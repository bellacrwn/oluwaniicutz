"use strict";

/* ============================================================
   server.js — zero-dependency standalone server
   Serves the static site AND the secure POST /api/book endpoint.

   Run locally:
     TELEGRAM_BOT_TOKEN=... node server.js
   Host on Render / Railway / Fly / a VPS with the same command
   and set TELEGRAM_BOT_TOKEN (and optionally TELEGRAM_CHAT_ID)
   as environment variables.
   ============================================================ */

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { handleBookingRequest, MAX_BODY_BYTES } = require("./lib/booking-handler");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8080;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer-when-downgrade",
  "Cache-Control": "no-cache",
};

function readRawBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("too_large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function clientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff) return xff.split(",")[0].trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

async function handleApi(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req, MAX_BODY_BYTES);
  } catch (e) {
    res.writeHead(413, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, error: "Request too large." }));
    return;
  }

  const result = await handleBookingRequest({
    method: req.method,
    headers: req.headers,
    rawBody,
    ip: clientIp(req),
  });

  if (result.status === 204) {
    res.writeHead(204);
    res.end();
    return;
  }
  res.writeHead(result.status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(result.payload));
}

function serveStatic(req, res, pathname) {
  let filePath = pathname === "/" ? "/index.html" : pathname;
  try {
    filePath = decodeURIComponent(filePath);
  } catch (e) {
    res.writeHead(400, SECURITY_HEADERS);
    res.end("Bad request");
    return;
  }

  const resolved = path.normalize(path.join(ROOT, filePath));
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    res.writeHead(403, SECURITY_HEADERS);
    res.end("Forbidden");
    return;
  }

  fs.readFile(resolved, (err, buf) => {
    if (err) {
      res.writeHead(404, Object.assign({ "Content-Type": "text/plain; charset=utf-8" }, SECURITY_HEADERS));
      res.end("Not found");
      return;
    }
    const type = MIME[path.extname(resolved).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, Object.assign({ "Content-Type": type }, SECURITY_HEADERS));
    res.end(buf);
  });
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = new URL(req.url, "http://localhost").pathname;
  } catch (e) {
    res.writeHead(400, SECURITY_HEADERS);
    res.end("Bad request");
    return;
  }

  if (pathname === "/api/book") {
    handleApi(req, res).catch((err) => {
      console.error("book endpoint error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      }
      res.end(JSON.stringify({ ok: false, error: "Internal server error." }));
    });
    return;
  }

  if (pathname.startsWith("/api/")) {
    res.writeHead(404, Object.assign({ "Content-Type": "text/plain; charset=utf-8" }, SECURITY_HEADERS));
    res.end("Not found");
    return;
  }

  serveStatic(req, res, pathname);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Oluwanii Signature Cuts running at http://localhost:${PORT}`);
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn(
      "WARNING: TELEGRAM_BOT_TOKEN is not set — the booking form will return a " +
      "'temporarily unavailable' response until you set it."
    );
  }
});
