"use strict";

/* ============================================================
   api/book.js — Vercel serverless function (Node runtime)
   Route: POST /api/book
   Put TELEGRAM_BOT_TOKEN in the project's environment variables.
   ============================================================ */

const { handleBookingRequest, MAX_BODY_BYTES } = require("../lib/booking-handler");

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

module.exports = async function handler(req, res) {
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
};
