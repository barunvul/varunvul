import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import fundsHandler from "./api/funds.js";
import updateFundsHandler from "./api/update-funds.js";
import statusHandler from "./api/status.js";
import { hasSupabase } from "./lib/supabase-rest.mjs";
import { loadStaticFundMeta } from "./lib/static-fund-data.mjs";

// Local development server only. Vercel uses files in /api as serverless functions.
const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)));
let PORT = 5173;
const BUNDLED_PYTHON = join(
  homedir(),
  ".cache",
  "codex-runtimes",
  "codex-primary-runtime",
  "dependencies",
  "python",
  "python.exe",
);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function resolvePython() {
  return process.env.PYTHON || (existsSync(BUNDLED_PYTHON) ? BUNDLED_PYTHON : "python");
}

async function loadLocalEnv() {
  const envPath = join(ROOT, ".env");
  if (process.env.VERCEL || !existsSync(envPath)) return;

  try {
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
  } catch {
    // Local .env loading is optional.
  }
}

function runFundUpdater() {
  return new Promise((resolveUpdater) => {
    const child = spawn(resolvePython(), [join(ROOT, "scripts", "update_funds.py")], {
      cwd: ROOT,
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
      },
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    child.on("close", (code) => {
      const lines = `${stdout}\n${stderr}`
        .trim()
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      const lastJson = [...lines].reverse().find((line) => line.startsWith("{"));
      let parsed = null;
      try {
        parsed = lastJson ? JSON.parse(lastJson) : null;
      } catch {
        parsed = null;
      }
      const fallbackError = stderr.trim() || stdout.trim() || `Updater exited with code ${code}`;
      resolveUpdater({
        ok: code === 0 && parsed?.ok === true,
        code,
        ...parsed,
        error: parsed?.error || (code === 0 ? undefined : fallbackError),
        stderr: stderr.trim(),
      });
    });
  });
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://127.0.0.1:${PORT}`);
  const requestedPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const fullPath = resolve(join(ROOT, requestedPath));

  if (!fullPath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const info = await stat(fullPath);
    if (!info.isFile()) throw new Error("Not a file");
    const body = await readFile(fullPath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(fullPath).toLowerCase()] || "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control": requestedPath.startsWith("/data/") ? "no-store" : "no-cache",
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not Found");
  }
}

const server = createServer(async (request, response) => {
  if (request.url?.startsWith("/api/funds")) {
    await fundsHandler(request, response);
    return;
  }

  if (request.url?.startsWith("/api/update-funds")) {
    if (hasSupabase()) {
      await updateFundsHandler(request, response);
      return;
    }

    if (request.method !== "POST" && request.method !== "GET") {
      sendJson(response, 405, { ok: false, error: "Method not allowed" });
      return;
    }
    const result = await runFundUpdater();
    if (!result.ok) {
      try {
        const meta = await loadStaticFundMeta();
        sendJson(response, 200, {
          ok: true,
          live: false,
          persisted: false,
          fallback: true,
          storage: "static-fallback",
          fundCount: meta.fundCount,
          stdDate: meta.stdDate,
          error: result.error || result.stderr || "Local fund update failed.",
        });
        return;
      } catch {
        // Fall through to the original failed result.
      }
    }
    sendJson(response, result.ok ? 200 : 500, result);
    return;
  }

  if (request.url?.startsWith("/api/status")) {
    await statusHandler(request, response);
    return;
  }

  await serveStatic(request, response);
});

await loadLocalEnv();
PORT = Number(process.env.PORT || 5173);

server.listen(PORT, "127.0.0.1", () => {
  console.log(`변액보험 매니저 Pro 실행 중: http://127.0.0.1:${PORT}/`);
  console.log("데이터 갱신: 앱의 [데이터 수집] 버튼 또는 update-funds.ps1");
});
