import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import fundsHandler from "./api/funds.js";
import statusHandler from "./api/status.js";
import updateFundsHandler from "./api/update-funds.js";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)));

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

function send(response, status, body, contentType = "text/plain; charset=utf-8") {
  response.statusCode = status;
  response.setHeader("content-type", contentType);
  if (Buffer.isBuffer(body)) {
    response.setHeader("content-length", body.length);
    response.end(body);
    return;
  }
  response.end(body);
}

function staticPath(pathname) {
  let cleanPath = decodeURIComponent(pathname);
  if (cleanPath === "/" || cleanPath === "") cleanPath = "/index.html";
  cleanPath = cleanPath.replace(/^\/+/, "");

  const candidate = resolve(ROOT, cleanPath);
  if (candidate !== ROOT && !candidate.startsWith(`${ROOT}${sep}`)) return null;
  return candidate;
}

async function serveFile(request, response, pathname) {
  const candidate = staticPath(pathname);
  if (!candidate) {
    send(response, 403, "Forbidden");
    return;
  }

  try {
    const body = await readFile(candidate);
    const contentType = mimeTypes[extname(candidate).toLowerCase()] || "application/octet-stream";
    response.statusCode = 200;
    response.setHeader("content-type", contentType);
    response.setHeader("cache-control", pathname === "/" ? "no-store" : "public, max-age=300");
    if (request.method === "HEAD") response.end();
    else response.end(body);
  } catch {
    if (extname(pathname)) {
      send(response, 404, "Not found");
      return;
    }
    await serveFile(request, response, "/index.html");
  }
}

export default async function handler(request, response) {
  const url = new URL(request.url || "/", "https://localhost");

  if (url.pathname === "/api/funds") return fundsHandler(request, response);
  if (url.pathname === "/api/status") return statusHandler(request, response);
  if (url.pathname === "/api/update-funds") return updateFundsHandler(request, response);

  if (!["GET", "HEAD"].includes(request.method)) {
    send(response, 405, "Method not allowed");
    return;
  }

  await serveFile(request, response, url.pathname);
}
