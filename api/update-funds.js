import { buildFundPayload } from "../lib/klia-funds.mjs";
import { saveFundPayload, hasSupabase } from "../lib/supabase-rest.mjs";

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.end(JSON.stringify(payload));
}

function authorized(request) {
  const secret = process.env.UPDATE_SECRET;
  const userAgent = String(request.headers["user-agent"] || "");
  const isVercelCron = userAgent.includes("vercel-cron/1.0") && Boolean(request.headers["x-vercel-cron-schedule"]);
  if (isVercelCron) return true;
  if (!secret) return true;
  const header = request.headers["x-update-secret"];
  const url = new URL(request.url, "https://localhost");
  return header === secret || url.searchParams.get("secret") === secret;
}

export default async function handler(request, response) {
  if (!["GET", "POST"].includes(request.method)) {
    sendJson(response, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  if (!authorized(request)) {
    sendJson(response, 401, { ok: false, error: "Unauthorized" });
    return;
  }

  if (!hasSupabase()) {
    sendJson(response, 500, {
      ok: false,
      persisted: false,
      storage: "not-configured",
      error: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Vercel data updates.",
    });
    return;
  }

  try {
    const payload = await buildFundPayload();
    await saveFundPayload(payload);

    sendJson(response, 200, {
      ok: true,
      persisted: true,
      fundCount: payload.meta.fundCount,
      insurerCount: payload.meta.insurerCount,
      stdDate: payload.meta.stdDate,
      previousStdDate: payload.meta.previousStdDate,
      monthAgoStdDate: payload.meta.monthAgoStdDate,
      storage: "supabase",
      message: "Fund data saved to Supabase.",
    });
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      persisted: false,
      storage: "supabase",
      error: error.message || String(error),
    });
  }
}
