"use strict";

/* ============================================================
   netlify/functions/book.js — Netlify Function
   Route: POST /api/book   (mapped by the /_redirects file)
   Put TELEGRAM_BOT_TOKEN in the site's env vars.
   ============================================================ */

const { handleBookingRequest } = require("../../lib/booking-handler");

exports.handler = async (event) => {
  const headers = event.headers || {};

  const clientIp =
    (headers["x-forwarded-for"] || headers["X-Forwarded-For"] || "").split(",")[0].trim() ||
    "unknown";

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64")
    : Buffer.from(event.body || "", "utf8");

  const result = await handleBookingRequest({
    method: event.httpMethod || "POST",
    headers,
    rawBody,
    ip: clientIp,
  });

  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (result.status === 204) {
    return { statusCode: 204, headers: cors, body: "" };
  }
  return {
    statusCode: result.status,
    headers: Object.assign(cors, { "Content-Type": "application/json; charset=utf-8" }),
    body: JSON.stringify(result.payload),
  };
};
