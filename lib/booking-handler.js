"use strict";

/* ============================================================
   lib/booking-handler.js
   Provider-agnostic booking endpoint core.

   - Keeps the Telegram bot token & chat id server-side ONLY
     (read from env: TELEGRAM_BOT_TOKEN, optional TELEGRAM_CHAT_ID)
   - Validates all input (defense in depth — the client validates too)
   - Rate-limits per IP to cut spam
   - Handles both JSON bookings and multipart bookings with a photo
   - Zero dependencies
   ============================================================ */

const ALLOWED_SERVICES = [
  "Haircut",
  "Shave",
  "Beard Trim",
  "Full Package",
  "Hair Dye",
  "Mobile Barbing",
];

const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // Telegram sendPhoto limit
const MAX_BODY_BYTES = 11 * 1024 * 1024; // photo + multipart overhead
const MAX_TELEGRAM_CAPTION = 1024;

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

// The chat id is not a secret (it was already in the public client code),
// so a default keeps setup to a single env var.
const DEFAULT_CHAT_ID = "-1002551826027";

/* ---------------- input handling ---------------- */

function cleanStr(value, max) {
  return String(value == null ? "" : value)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function validateBooking(data) {
  data = data && typeof data === "object" ? data : {};
  const errors = {};

  const name = cleanStr(data.name, 100);
  if (name.length < 2) errors.name = "Please enter your full name.";

  const email = cleanStr(data.email, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  const phone = cleanStr(data.phone, 20);
  if (!/^\+?[\d\s\-()]{7,15}$/.test(phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  const service = cleanStr(data.service, 40);
  if (!ALLOWED_SERVICES.includes(service)) {
    errors.service = "Please choose a valid service.";
  }

  const date = cleanStr(data.date, 10);
  let dateOk = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date));
  if (dateOk) {
    const now = new Date();
    const todayIso =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");
    if (date < todayIso) {
      dateOk = false;
      errors.date = "The date can’t be in the past.";
    }
  }
  if (!dateOk && !errors.date) errors.date = "Please provide a valid date (YYYY-MM-DD).";

  const time = cleanStr(data.time, 5);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    errors.time = "Please provide a valid time (HH:MM).";
  }

  const notes = cleanStr(data.notes, 300);

  return {
    errors,
    data: { name, email, phone, service, date, time, notes },
  };
}

// Escape Markdown specials so Telegram never fails on a name with "_" etc.
function md(s) {
  return String(s).replace(/[_*[\]]/g, "\\$&");
}

function buildMessage(d) {
  return (
    "💈 *New Appointment Booking* 💈\n\n" +
    "👤 *Name:* " + md(d.name) + "\n" +
    "📧 *Email:* " + md(d.email) + "\n" +
    "📱 *Phone:* " + md(d.phone) + "\n" +
    "✂️ *Service:* " + md(d.service) + "\n" +
    "📅 *Date:* " + md(d.date) + "\n" +
    "⏰ *Time:* " + md(d.time) + "\n" +
    "📝 *Notes:* " + md(d.notes || "None")
  );
}

/* ---------------- rate limiting (per IP, in-memory) ---------------- */

const buckets = new Map();

function rateLimitAllow(ip) {
  const now = Date.now();
  let bucket = buckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    buckets.set(ip, bucket);
  }
  if (buckets.size > 10000) {
    for (const [key, b] of buckets) if (now > b.resetAt) buckets.delete(key);
  }
  bucket.count += 1;
  return bucket.count <= RATE_LIMIT_MAX;
}

/* ---------------- minimal multipart/form-data parser ---------------- */

function parseMultipart(buffer, contentType) {
  const out = { fields: {}, file: null };
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || "");
  if (!m) return out;
  const delimiter = Buffer.from("--" + (m[1] || m[2]).trim());

  let start = buffer.indexOf(delimiter);
  while (start !== -1) {
    const after = start + delimiter.length;
    if (buffer.slice(after, after + 2).toString("utf8") === "--") break; // closing

    const headerEnd = buffer.indexOf("\r\n\r\n", after);
    if (headerEnd === -1) break;
    const headerText = buffer.slice(after, headerEnd).toString("utf8");
    const bodyStart = headerEnd + 4;

    const nextStart = buffer.indexOf(delimiter, bodyStart);
    if (nextStart === -1) break;
    const body = buffer.slice(bodyStart, nextStart - 2); // strip trailing \r\n

    const nameMatch = /name="([^"]*)"/.exec(headerText);
    const filenameMatch = /filename="([^"]*)"/.exec(headerText);
    const typeMatch = /Content-Type:\s*([^\r\n]+)/i.exec(headerText);

    if (nameMatch) {
      if (filenameMatch && filenameMatch[1].trim() !== "") {
        out.file = {
          name: filenameMatch[1].slice(0, 200),
          type: (typeMatch && typeMatch[1].trim()) || "application/octet-stream",
          buffer: body,
        };
      } else if (nameMatch[1]) {
        out.fields[nameMatch[1]] = body.toString("utf8");
      }
    }
    start = nextStart;
  }
  return out;
}

/* ---------------- Telegram ---------------- */

function getChatId() {
  return process.env.TELEGRAM_CHAT_ID || DEFAULT_CHAT_ID;
}

async function telegramSend(api, token, payload) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${api}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let json = null;
  try {
    json = await res.json();
  } catch (e) {
    /* non-JSON error */
  }
  if (!res.ok || !json || json.ok !== true) {
    const desc = (json && json.description) || ("HTTP " + res.status);
    const err = new Error("TELEGRAM_FAILED");
    err.telegramDescription = desc;
    throw err;
  }
  return json;
}

function buildPhotoMultipart(chatId, caption, photo) {
  const boundary = "----oluwaniicutz" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const headerPart = (name, extra) =>
    `--${boundary}\r\nContent-Disposition: form-data; name="${name}"${extra}\r\n\r\n`;

  const parts = [
    Buffer.from(
      headerPart("chat_id") + chatId + "\r\n" +
      headerPart("caption") + caption + "\r\n" +
      headerPart("parse_mode") + "Markdown\r\n" +
      headerPart("photo", `; filename="${photo.name.replace(/"/g, "")}"`) +
      `Content-Type: ${photo.type}\r\n\r\n`
    ),
    photo.buffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ];
  return {
    body: Buffer.concat(parts),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

async function sendToTelegram({ token, chatId, message, photo }) {
  if (photo) {
    if (message.length > MAX_TELEGRAM_CAPTION) {
      throw new Error("TELEGRAM_FAILED"); // caption too long — shouldn't happen after validation
    }
    const multipart = buildPhotoMultipart(chatId, message, photo);
    const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": multipart.contentType },
      body: multipart.body,
    });
    let json = null;
    try {
      json = await res.json();
    } catch (e) {
      /* non-JSON error */
    }
    if (!res.ok || !json || json.ok !== true) {
      const err = new Error("TELEGRAM_FAILED");
      err.telegramDescription = (json && json.description) || ("HTTP " + res.status);
      throw err;
    }
    return json;
  }
  return telegramSend("sendMessage", token, {
    chat_id: chatId,
    text: message,
    parse_mode: "Markdown",
  });
}

/* ---------------- request → response ---------------- */

function respond(res, status, payload) {
  if (!res.headersSent) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.writeHead(status);
  }
  res.end(JSON.stringify(payload));
}

/**
 * handleBookingRequest({ method, headers, rawBody, ip })
 * @returns {Promise<{status:number, payload:object}>}
 */
async function handleBookingRequest({ method, headers, rawBody, ip }) {
  if (method === "OPTIONS") {
    return { status: 204, payload: null };
  }
  if (method !== "POST") {
    return { status: 405, payload: { ok: false, error: "Method not allowed." } };
  }
  if (!rawBody || rawBody.length === 0) {
    return { status: 400, payload: { ok: false, error: "Empty request." } };
  }
  if (rawBody.length > MAX_BODY_BYTES) {
    return { status: 413, payload: { ok: false, error: "Request too large." } };
  }
  if (!rateLimitAllow(ip || "unknown")) {
    return {
      status: 429,
      payload: { ok: false, error: "Too many requests — please wait a few minutes and try again." },
    };
  }

  const contentType = String((headers && headers["content-type"]) || "");
  let data;
  let photo = null;

  if (contentType.includes("multipart/form-data")) {
    const parsed = parseMultipart(rawBody, contentType);
    photo = parsed.file;
    if (photo) {
      if (!/^image\//.test(photo.type)) {
        return { status: 400, payload: { ok: false, error: "The reference image must be an image file (JPG or PNG)." } };
      }
      if (photo.buffer.length > MAX_PHOTO_BYTES) {
        return { status: 400, payload: { ok: false, error: "The image is too large — please keep it under 10 MB." } };
      }
    }
    data = {
      name: parsed.fields.name,
      email: parsed.fields.email,
      phone: parsed.fields.phone,
      service: parsed.fields.service,
      date: parsed.fields.date,
      time: parsed.fields.time,
      notes: parsed.fields.notes,
    };
  } else {
    let json;
    try {
      json = JSON.parse(rawBody.toString("utf8"));
    } catch (e) {
      return { status: 400, payload: { ok: false, error: "Invalid request." } };
    }
    data = json && typeof json === "object" ? json : {};
  }

  const { errors, data: clean } = validateBooking(data);
  if (Object.keys(errors).length > 0) {
    return { status: 400, payload: { ok: false, error: errors[Object.keys(errors)[0]], errors } };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN || "";
  if (!token) {
    return {
      status: 503,
      payload: {
        ok: false,
        error:
          "Booking is temporarily unavailable. Please call or WhatsApp us on +234 702 511 3434 instead.",
      },
    };
  }

  try {
    await sendToTelegram({
      token,
      chatId: getChatId(),
      message: buildMessage(clean),
      photo: photo && photo.buffer.length > 0 ? photo : null,
    });
    return { status: 200, payload: { ok: true } };
  } catch (err) {
    return {
      status: 502,
      payload: {
        ok: false,
        error:
          "We couldn’t send your booking just now. Please try again, or WhatsApp us on +234 702 511 3434.",
      },
    };
  }
}

module.exports = {
  handleBookingRequest,
  ALLOWED_SERVICES,
  MAX_PHOTO_BYTES,
  MAX_BODY_BYTES,
};
