# MockDrop

> Paste JSON. Get a live API. No signup, no backend, no waiting.

MockDrop is a lightweight, zero-friction developer tool designed to bridge the gap between UI prototyping and backend API readiness. Paste your JSON payload, pick a status code, and get a live, hosted CORS-enabled HTTP endpoint in under 10 seconds.

Mocks are ephemeral by design and automatically expire after **24 hours**.

---

## ⚡ Features

- **Zero Friction**: No accounts, no credentials, no project configuration. Paste $\rightarrow$ Generate $\rightarrow$ Copy URL.
- **Real HTTP Behavior**: Generates a publicly fetchable REST endpoint (`GET`) returning your payload with correct HTTP status codes and `Content-Type: application/json`.
- **CORS-Enabled**: Headers support cross-origin fetches (`Access-Control-Allow-Origin: *`) so you can query endpoints directly from local or staging frontends.
- **Emerald Theme Design**: Styled with a minimal developer-tool aesthetic featuring responsive dark/light modes, an interactive diamond layout background, and a mouse-following glow effect.
- **Error Simulation**: QA testing support for simulating error states easily (choose from `200 OK`, `404 Not Found`, or `500 Internal Server Error`).

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS & Vanilla CSS (Tokens-based design system)
- **Database**: Redis (used for ephemeral storage with Key TTLs)
- **Deployment**: Vercel & Redis Cloud

---

## 🚀 Getting Started

### Prerequisites

You need a Redis instance to store endpoints. You can run one locally or spin up a free tier instance on [Redis Cloud](https://redis.io/try-free/).

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Redis credentials to `.env.local`:
   ```env
   REDIS_URL=redis://default:your-password@your-redis-host:port
   ```

3. Spin up the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

- `/app` — Next.js layout, routing, dynamic dynamic API routes (`/api/generate` and `/api/mock/[id]`).
- `/components` — Reusable client UI components (`Composer.tsx`, custom accessible `StatusSelect.tsx`, and `CursorGlow.tsx`).
- `/lib` — Redis clients, token utilities, rate-limiting handlers, and mockup payload helpers.
- `tokens.css` — Core theme variables (spacing, fonts, colors).
- `globals.css` — Main layout styles, keyframe animations, and custom backgrounds.

---

## 🔒 Security & Limits

- **Anonymous Access**: Mocks are public by URL. Do **not** input secrets, credentials, or PII.
- **Payload Limit**: Capped at **100KB** per mock mock to prevent abuse and keep data usage light.
- **Rate Limiting**: API generation is rate-limited to 20 requests per minute per IP.
- **Auto-Deletion**: Redis key expiration handles automatic cleanup after 24 hours.
