import { loadFundPayload, hasSupabase } from "../lib/supabase-rest.mjs";
import { loadStaticFundPayload } from "../lib/static-fund-data.mjs";

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.end(JSON.stringify(payload));
}

export default async function handler(request, response) {
  let supabaseError = null;

  try {
    if (hasSupabase()) {
      try {
        const payload = await loadFundPayload();
        if (payload?.funds?.length) {
          sendJson(response, 200, payload);
          return;
        }
      } catch (error) {
        supabaseError = error.message || String(error);
      }
    }

    const fallback = await loadStaticFundPayload();
    fallback.meta = {
      ...(fallback.meta || {}),
      storage: "static-fallback",
      supabaseError,
    };
    sendJson(response, 200, fallback);
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      error: error.message || String(error),
    });
  }
}
