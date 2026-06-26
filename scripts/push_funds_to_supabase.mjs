import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

async function loadLocalEnv() {
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return;

  const text = await readFile(envPath, "utf8");
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separator = trimmed.indexOf("=");
    if (separator === -1) return;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  });
}

await loadLocalEnv();

const { saveFundPayload, hasSupabase } = await import("../lib/supabase-rest.mjs");

if (!hasSupabase()) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env or environment variables.");
}

const file = join(ROOT, "data", "funds.json");
const payload = JSON.parse(await readFile(file, "utf8"));

await saveFundPayload(payload);

console.log(
  JSON.stringify(
    {
      ok: true,
      stdDate: payload.meta?.stdDate,
      fundCount: Array.isArray(payload.funds) ? payload.funds.length : 0,
      storage: "supabase",
    },
    null,
    2,
  ),
);
