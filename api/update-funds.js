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

  try {
    const payload = await buildFundPayload();
    let persisted = false;
    if (hasSupabase()) {
      await saveFundPayload(payload);
      persisted = true;
    }

    sendJson(response, 200, {
      ok: true,
      persisted,
      fundCount: payload.meta.fundCount,
      insurerCount: payload.meta.insurerCount,
      stdDate: payload.meta.stdDate,
      previousStdDate: payload.meta.previousStdDate,
      monthAgoStdDate: payload.meta.monthAgoStdDate,
      storage: persisted ? "supabase" : "memory-only",
      message: persisted
        ? "Supabase에 공시 데이터를 저장했습니다."
        : "Supabase 환경변수가 없어 수집만 수행했습니다.",
    });
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      error: error.message || String(error),
    });
  }
}
