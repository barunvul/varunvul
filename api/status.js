import { hasSupabase, loadFundPayload } from "../lib/supabase-rest.mjs";
import { loadStaticFundMeta } from "../lib/static-fund-data.mjs";

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.end(JSON.stringify(payload));
}

export default async function handler(_request, response) {
  const status = {
    ok: true,
    supabaseConfigured: hasSupabase(),
    activeSource: "none",
    supabase: null,
    staticFallback: null,
  };

  if (hasSupabase()) {
    try {
      const payload = await loadFundPayload();
      status.supabase = payload
        ? {
            stdDate: payload.meta?.stdDate || null,
            fetchedAt: payload.meta?.fetchedAt || null,
            fundCount: Array.isArray(payload.funds) ? payload.funds.length : 0,
          }
        : { fundCount: 0 };
      if (status.supabase.fundCount > 0) status.activeSource = "supabase";
    } catch (error) {
      status.supabase = {
        error: error.message || String(error),
      };
    }
  }

  try {
    status.staticFallback = await loadStaticFundMeta();
    if (status.activeSource === "none" && status.staticFallback.fundCount > 0) {
      status.activeSource = "static-fallback";
    }
  } catch {
    status.staticFallback = { fundCount: 0 };
  }

  sendJson(response, 200, status);
}
