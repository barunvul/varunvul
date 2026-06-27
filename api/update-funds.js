import { buildFundPayload } from "../lib/klia-funds.mjs";
import { saveFundPayload, hasSupabase, loadFundPayload } from "../lib/supabase-rest.mjs";
import { loadStaticFundPayload } from "../lib/static-fund-data.mjs";

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.end(JSON.stringify(payload));
}

function todayInSeoulDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

function authorized(request) {
  const secret = process.env.UPDATE_SECRET;
  const userAgent = String(request.headers["user-agent"] || "");
  const isVercelCron = userAgent.includes("vercel-cron/1.0") && Boolean(request.headers["x-vercel-cron-schedule"]);
  if (isVercelCron) return true;
  if (!secret) return true;
  const origin = request.headers.origin;
  const host = request.headers.host;
  if (origin && host) {
    try {
      if (new URL(origin).host === host) return true;
    } catch {
      // Fall back to the explicit secret checks below.
    }
  }
  const header = request.headers["x-update-secret"];
  const url = new URL(request.url, "https://localhost");
  return header === secret || url.searchParams.get("secret") === secret;
}

async function loadPreviousPayload() {
  try {
    const payload = await loadFundPayload();
    if (payload?.funds?.length) return { payload, source: "supabase" };
  } catch {
    // Static fallback below keeps first-time setup and failed Supabase reads recoverable.
  }

  try {
    const payload = await loadStaticFundPayload();
    if (payload?.funds?.length) return { payload, source: "static-fallback" };
  } catch {
    // No fallback is available.
  }

  return { payload: null, source: "none" };
}

function refreshedFallbackPayload(previousPayload, error, requestedStdDate) {
  if (!previousPayload?.funds?.length) return null;
  return {
    ...previousPayload,
    meta: {
      ...(previousPayload.meta || {}),
      fetchedAt: new Date().toISOString(),
      requestedStdDate,
      requestedDateMatched: previousPayload.meta?.stdDate === requestedStdDate,
      requestedDateFallback: previousPayload.meta?.stdDate !== requestedStdDate,
      liveUpdateFailed: true,
      liveUpdateError: error.message || String(error),
    },
  };
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

  const previous = await loadPreviousPayload();
  const historyMode = process.env.FUND_UPDATE_HISTORY_MODE || "cached";
  const requestedStdDate = todayInSeoulDate();

  try {
    const payload = await buildFundPayload({
      previousPayload: previous.payload,
      historyMode,
      targetDate: requestedStdDate,
    });
    await saveFundPayload(payload);

    sendJson(response, 200, {
      ok: true,
      live: true,
      persisted: true,
      fundCount: payload.meta.fundCount,
      insurerCount: payload.meta.insurerCount,
      stdDate: payload.meta.stdDate,
      previousStdDate: payload.meta.previousStdDate,
      monthAgoStdDate: payload.meta.monthAgoStdDate,
      historyMode: payload.meta.historyMode,
      requestedStdDate: payload.meta.requestedStdDate,
      requestedDateMatched: payload.meta.requestedDateMatched,
      requestedDateFallback: payload.meta.requestedDateFallback,
      previousSource: previous.source,
      storage: "supabase",
      message: "Fund data saved to Supabase.",
    });
  } catch (error) {
    const fallbackPayload = refreshedFallbackPayload(previous.payload, error, requestedStdDate);
    if (fallbackPayload) {
      try {
        await saveFundPayload(fallbackPayload);
        sendJson(response, 200, {
          ok: true,
          live: false,
          persisted: true,
          fallback: true,
          fundCount: fallbackPayload.meta.fundCount,
          insurerCount: fallbackPayload.meta.insurerCount,
          stdDate: fallbackPayload.meta.stdDate,
          previousStdDate: fallbackPayload.meta.previousStdDate,
          monthAgoStdDate: fallbackPayload.meta.monthAgoStdDate,
          requestedStdDate: fallbackPayload.meta.requestedStdDate,
          requestedDateMatched: fallbackPayload.meta.requestedDateMatched,
          requestedDateFallback: fallbackPayload.meta.requestedDateFallback,
          previousSource: previous.source,
          storage: "supabase",
          error: error.message || String(error),
          message: "Live fund update failed; saved existing fund payload again.",
        });
        return;
      } catch (fallbackError) {
        sendJson(response, 500, {
          ok: false,
          persisted: false,
          fallback: true,
          storage: "supabase",
          error: fallbackError.message || String(fallbackError),
          liveUpdateError: error.message || String(error),
        });
        return;
      }
    }

    sendJson(response, 500, {
      ok: false,
      persisted: false,
      storage: "supabase",
      error: error.message || String(error),
    });
  }
}
