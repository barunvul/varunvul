import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const STATIC_FUNDS_PATH = fileURLToPath(new URL("../data/funds.json", import.meta.url));

export async function loadStaticFundPayload() {
  return JSON.parse(await readFile(STATIC_FUNDS_PATH, "utf8"));
}

export async function loadStaticFundMeta() {
  const payload = await loadStaticFundPayload();
  return {
    stdDate: payload.meta?.stdDate || null,
    fetchedAt: payload.meta?.fetchedAt || null,
    fundCount: Array.isArray(payload.funds) ? payload.funds.length : 0,
  };
}
