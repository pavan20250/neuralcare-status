# NeuralCare Status

Production-grade public status dashboard for **NeuralCare AI**, inspired by modern enterprise SaaS status experiences. The UI is fully responsive, supports light and dark themes, and refreshes automatically using **SWR**.

**Intended domain:** [https://status.neuralcare-ai.com](https://status.neuralcare-ai.com)

## Stack

- **Next.js 15.5** (App Router) + **TypeScript**
- **Tailwind CSS v4** + shadcn-style primitives (Card, Badge, Button, Skeleton)
- **Framer Motion**, **Lucide**, **Recharts**, **SWR**
- **Vercel**-ready deployment

## Features

- Live service checks via Route Handlers (`/api/status`, `/api/health/*`)
- **No hardcoded operational states** — every card reflects the latest probe
- Latency measurement + consistent JSON contracts
- Glassmorphism layout, animated status indicators, skeleton loading
- Incident timeline backed by `data/incidents.json` (`/api/incidents`)
- Composite uptime and average latency charts fed by polling history in the browser

## Monitored services

| Service                 | Source of truth |
| ----------------------- | ---------------- |
| Gemini API              | `GEMINI_API_KEY`, `GEMINI_MODEL` |
| NeuralCare Backend API  | `BACKEND_API_URL`, `BACKEND_HEALTH_ENDPOINT` |
| Supabase Database       | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, optional `SUPABASE_HEALTH_TABLE` |
| Supabase Auth           | `${SUPABASE_URL}/auth/v1/health` |
| Vercel Hosting          | `VERCEL_API_TOKEN`, `VERCEL_PROJECT_ID`, optional `VERCEL_TEAM_ID` |
| AI Chat Engine          | `CHAT_ENGINE_HEALTH_URL` |

## Status rules

- **Operational:** request succeeds and latency is under **500 ms**
- **Degraded:** latency is over **1000 ms**, partial JSON / soft failures, or building Vercel deployments
- **Down:** network failure, timeout, HTTP errors, or Vercel deployment in `ERROR` / `CANCELED`

Services that are **not configured** report `unknown` with an explanatory message (not a fake “green”).

## Local development

```bash
cp .env.example .env.local
# fill in secrets for services you want to probe
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

See `.env.example` for the full list. **Never** prefix server secrets with `NEXT_PUBLIC_`.

- `STATUS_REFRESH_INTERVAL` controls SWR polling (milliseconds). Default `30000`.
- `NEXT_PUBLIC_APP_NAME` controls branding in metadata and the header.

Optional: set `SUPABASE_HEALTH_TABLE` to a small table you own for a precise `select` head check. Without it, the probe uses the PostgREST root with your service role (connectivity-focused).

## API contract

`GET /api/status` returns:

```json
{
  "overall": "operational",
  "lastChecked": "2026-05-13T12:00:00.000Z",
  "services": [
    {
      "service": "Gemini API",
      "serviceId": "gemini",
      "status": "operational",
      "latency": 142,
      "uptime": null,
      "lastChecked": "2026-05-13T12:00:00.000Z"
    }
  ]
}
```

Individual probes:

- `GET /api/health/gemini`
- `GET /api/health/backend`
- `GET /api/health/supabase` → `{ "database": {…}, "auth": {…} }`
- `GET /api/health/vercel`

## Deploying to Vercel

1. Push this repository to GitHub (or connect any Git provider Vercel supports).
2. In Vercel, **Import Project** and select the repository.
3. Framework preset: **Next.js**. Build command: `next build`, output: default.
4. Under **Settings → Environment Variables**, add every key from `.env.example` for **Production** (and Preview if desired).
5. Deploy.

### Custom domain (`status.neuralcare-ai.com`)

1. Vercel project → **Settings → Domains** → add `status.neuralcare-ai.com`.
2. Follow Vercel’s DNS instructions. Typically:
   - **Apex / subdomain CNAME** to `cname.vercel-dns.com` (Vercel shows the exact target).
3. At your DNS host (Cloudflare, Route53, etc.), create the record Vercel displays.
4. Wait for DNS + certificate provisioning (usually a few minutes).

### DNS checklist

- Remove stale A records that conflict with the Vercel CNAME.
- If using Cloudflare proxy (“orange cloud”), ensure TLS mode is **Full (strict)** once Vercel has issued a certificate.

## Security notes

- `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `VERCEL_API_TOKEN` are **server-only** and used exclusively inside Route Handlers.
- The dashboard never receives raw secrets; it only consumes aggregated JSON.

## Project structure

```
app/
  api/…              # Route Handlers
  incidents/page.tsx
  layout.tsx
  page.tsx
  providers.tsx
components/
  charts/
  dashboard/
  status/
  ui/
data/
  incidents.json
hooks/
lib/
services/
types/
utils/
```

## Scripts

| Command        | Description          |
| -------------- | -------------------- |
| `npm run dev`  | Local dev server     |
| `npm run build`| Production build     |
| `npm run start`| Start production app |
| `npm run lint` | ESLint               |

## License

Private / internal unless otherwise specified by your organization.
