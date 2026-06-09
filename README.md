# Axon Syria — Website

Bilingual (EN/AR) marketing + careers site for **Axon Syria**, an **independent
Syrian group** of five companies taking part in Syria's reconstruction. It is
**supported by the companies of [Axon Group UAE](https://axongroup.ae)** — it is
not part of the UAE group, and the site copy is written to keep that distinction
clear everywhere ("supported by", never "branch/member/sister of").

Built with Next.js 16 (App Router), React 19 and TypeScript — forked from the
Axon Group UAE site (`axongroup-next`) and re-themed/rewritten for Syria.

## The five companies

| Slug | Company | Accent |
|---|---|---|
| `axon-contracting` | Axon Contracting — civil construction, roads & bridges, heritage restoration, building-materials trading | `#3A4A44` |
| `axon-industry-trade` | Axon for Industry & Trade — steel structures, hangars, industrial equipment, import/export, agencies | `#E8920E` |
| `axon-integrated-facilities` | Axon Integrated Facilities Services — MEP, HVAC, solar, water/sewage, waste, remediation, fit-out | `#4056E0` |
| `axon-landscape` | Axon Landscape — landscaping, nurseries, irrigation, sports turf, greenhouses | `#7A9C4F` |
| `imdad` | Imdad — established Aleppo metal-construction manufacturer ([imdadgroup.com](https://imdadgroup.com)), the group's industrial anchor | `#2A2659` |

Company content lives in three index-aligned places (same order everywhere):
`src/data/companies.ts` (slugs), `src/dictionaries/en.ts` + `ar.ts`
(`companies.cards`), and `src/data/company-profiles.ts` (accents, logos,
services, contacts — keyed by slug).

## Commands

```powershell
$env:Path = "C:\Users\User\nodejs;$env:Path"   # Node is not always on PATH
npm run dev     # dev server on :3000
npm run build   # production build — TypeScript + ESLint gate (no test suite)
```

Pushing to `main` (repo `Mohamad-ctrl/axon-syria`) auto-deploys to Vercel — the site is **live at https://axon-sy.com**.

## Runtime environment variables

Set in `.env.local` (git-ignored) and the hosting platform:

| Variable | Purpose |
|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Jobs + applications database. Project **`axon-syria`** (`uhuoqcuhwfgnylcljhct`, eu-central-1) is provisioned with the schema + 7 seed jobs; copy the service_role key from [its API settings](https://supabase.com/dashboard/project/uhuoqcuhwfgnylcljhct/settings/api-keys). Until set, careers shows "no openings" and `/admin` shows a setup notice. |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | Admin dashboard at `/admin` (defaults `admin`/`admin` — change before going live). |
| `ANTHROPIC_API_KEY` (+ optional `ANTHROPIC_MODEL`) | EN→AR auto-translation when posting jobs; falls back to English when unset. |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for SEO (canonical/sitemap/OG/JSON-LD). Public, non-secret; defaults to `https://axon-sy.com` (see `src/lib/site.ts`). |

Supabase setup mirrors the UAE project: tables `jobs` (slug, active, posted,
`jsonb data`) and `applications`, plus a private `cvs` storage bucket; RLS on
with **no policies** (the service-role key is the only access path).

## Placeholders to replace before launch

- **Domain** — ✅ done: live at `https://axon-sy.com` (apex + `www`), centralized in
  `src/lib/site.ts` (`SITE_URL` / `NEXT_PUBLIC_SITE_URL`) — no hardcoded domain in
  `layout.tsx`. Search Console is verified, the sitemap submitted, and a branded
  `/api/og` social-share card is in place.
- **Contact** — group phone `+963 21 473 1300` is Imdad's published Aleppo line;
  email is `info@axon-sy.com`. Used in Header, Footer, CTA, JobsExplorer and layout
  JSON-LD — swap the phone for a dedicated Axon Syria line when one exists.
- **Photography** — no Syria photos yet: the hero is a designed gradient, the
  About section shows a logo mosaic, and company cards show logo plates.
  Drop real images in and wire them up when available.
- **Social links** — Footer icons point to `#`.
- **Certificates / projects** — `src/data/certificates.ts` and
  `src/data/projects.ts` are empty maps; detail-page sections auto-appear once
  entries (and images under `public/images/...`) are added. Imdad's ISO
  9001/14001/45001 scans would be the first candidates.
