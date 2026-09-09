# Oluwanii Signature Cuts

A one-page appointment-booking site for Oluwanii Signature Cuts — a premium barbershop.
Bookings are delivered to the owner via a Telegram bot, sent through a **secure server-side
endpoint** (the bot token is never exposed in the browser).

## Pages

- `index.html` — hero, pricing, booking form, and gallery
- `thank-you-page.html` — confirmation page shown after a successful booking

## How booking works

1. The form validates in the browser, then POSTs to `/api/book` (relative URL).
2. The server-side handler (`lib/booking-handler.js`) re-validates everything, rate-limits
   per IP, and forwards the booking (with optional reference photo) to the Telegram bot.
3. On success the visitor is redirected to the thank-you page.

The endpoint ships with three interchangeable runtimes — pick whichever matches your host:

| File                      | Where it runs                                   |
| ------------------------- | ----------------------------------------------- |
| `api/book.js`             | Vercel (auto-routes to `/api/book`)             |
| `netlify/functions/book.js` + `_redirects` | Netlify (auto-routes to `/api/book`) |
| `server.js`               | Anywhere Node runs: Render, Railway, a VPS, or locally (also serves the static site) |

## 🔐 Security: the bot token

The bot token is read **only** from the server environment:

```
TELEGRAM_BOT_TOKEN=   (required)
TELEGRAM_CHAT_ID=     (optional — defaults to the existing bookings group)
PORT=8080             (optional — server.js only)
```

See `.env.example`. The `.env` file is gitignored — **never commit or paste the token
into the repo, chat, or client code**.

> ⚠️ **The old token (previously hard-coded in `app.js`) is already compromised** — it was
> public in the page source and in git history. Rotate it before going live:
>
> 1. Open Telegram → chat with **@BotFather**
> 2. `/mybots` → your bot → **API Token** → **Revoke current token**
> 3. Copy the new token into your host's environment variables (see below)
>
> The old token cannot be un-leaked, so revoking it is mandatory, not optional.

## Deploying (pick one)

### Option A — Netlify (easiest, free)

1. [app.netlify.com](https://app.netlify.com) → **Add new site → Deploy manually** → drag in this folder.
   (Or connect this GitHub repo.)
2. Site settings → **Environment variables** → add `TELEGRAM_BOT_TOKEN` (and optionally `TELEGRAM_CHAT_ID`).
3. Redeploy. The `_redirects` file routes `/api/book` to the function automatically.

### Option B — Vercel (free)

1. [vercel.com](https://vercel.com) → **Add New → Project** → import this repo (or use `vercel` CLI here).
2. Project → **Settings → Environment Variables** → add `TELEGRAM_BOT_TOKEN` (+ optional `TELEGRAM_CHAT_ID`) for Production/Preview.
3. Deploy. `api/book.js` is auto-routed to `/api/book`.

### Option C — Standalone server (Render / Railway / VPS)

1. On the host, clone this repo and set the env vars `TELEGRAM_BOT_TOKEN` (+ optional `TELEGRAM_CHAT_ID`).
2. Start command: `node server.js` (port defaults to 8080; set `PORT` to override, e.g. 3000 on Render).
3. It serves both the site and `/api/book` from the same origin — no extra config needed.

### Local development

```bash
# terminal 1
TELEGRAM_BOT_TOKEN="123:abc…" PORT=8080 node server.js
# open http://localhost:8080
```

## Notes

- **Vercel free (Hobby) plan** has a ~4.5 MB request-body limit, so on Hobby the reference
  photo should be under ~4 MB (Pro plan allows much more; Netlify and a plain server have no
  practical limit). Telegram's own cap is 10 MB either way.
- Rate limiting is 5 bookings / 10 min / IP (in-memory — fine for a single instance; shared
  across Netlify's scaled instances approximately).

## Structure

| File                      | Purpose                                        |
| ------------------------- | ---------------------------------------------- |
| `index.html`              | Main page                                      |
| `thank-you-page.html`     | Booking confirmation page                      |
| `style.css`               | Dark + gold theme, responsive, a11y-friendly   |
| `app.js`                  | Client validation, upload preview, calls `/api/book` |
| `lib/booking-handler.js`  | Shared server core: validation, rate limit, Telegram |
| `api/book.js`             | Vercel function adapter                        |
| `netlify/functions/book.js` | Netlify function adapter                     |
| `server.js`               | Standalone zero-dependency server (site + API) |
| `.env.example`            | Environment variable template                  |
| `*.jpeg*`                 | Gallery photos                                 |
