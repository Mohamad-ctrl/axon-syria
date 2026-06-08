# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Bilingual (EN/AR, full RTL) Next.js 16 (App Router) + React 19 + TypeScript site for **Axon Syria** — an independent Syrian group of five companies — with a careers section and an admin dashboard. Forked from the Axon Group UAE site (`axongroup-next`, sibling folder) and re-themed/rewritten; the two sites share the same architecture.

## ⚠️ Critical content rule — the UAE relationship

**Axon Syria is an INDEPENDENT Syrian group that is *supported by* Axon Group UAE. It is NOT part of, a branch of, or a sister to the UAE group.** The owner explicitly rejected copy implying the company "came from the UAE".

- Always "supported by" / "بدعم من" — never "backed by", "sister companies" / "شركات شقيقة", "part of Axon Group", or "the group's UAE operations".
- JSON-LD in `src/app/(site)/[lang]/layout.tsx` deliberately models Axon UAE as `sponsor`, **not** `parentOrganization` — keep it that way.
- The UaeSupport homepage section states the independence explicitly in both languages; don't soften or remove it.

## Commands

Node.js lives at `C:\Users\User\nodejs` and is often not on a fresh shell's PATH:

```powershell
$env:Path = "C:\Users\User\nodejs;$env:Path"
```

- `npm run dev` — dev server (Turbopack, port 3000).
- `npm run build` — production build; runs TypeScript **and** ESLint. This is the primary verification gate — **there is no test suite**; a green build plus manual checks against the dev server is how changes are verified.
- **Build gotcha:** after adding/moving/deleting a route, the `.next` type cache can go stale (`Cannot find module '.../route.js'`). Fix: delete `.next` and rebuild. Don't run `next build` while the dev server is running (both contend over `.next`).

## Architecture

### Two root layouts via route groups — no `app/layout.tsx`
- `(site)/[lang]/…` — public bilingual site (`en` | `ar`); its layout sets `<html lang dir>`, fonts (Cairo added only for `ar`), metadata and the org JSON-LD.
- `(admin)/admin/…` — internal dashboard (English, noindex), separate root layout.
- `src/proxy.ts` (Next 16's renamed middleware) redirects locale-less paths; matcher excludes `api`, `admin`, images and any path with a file extension.
- `params`/`searchParams` are **Promises** — `await` them.

### i18n
- `src/dictionaries/en.ts` is the **type source** (`Dictionary = typeof en`); `ar.ts` is typed against it, so missing/renamed keys break the build. Keep both in lockstep.
- All user-facing text comes from the dictionaries or the bilingual data files — never hardcode strings in components.
- `dict.stats` is an **array** of `{value, label}` (differs from the UAE site's object shape).
- RTL: `dir="rtl"` + overrides in the `Arabic / RTL` section of `globals.css`. Directional arrows mirror via the `.icon-arrow` class set in `icons.tsx`.

### The five companies — three index-aligned places
`src/data/companies.ts` (`companyMeta`: 5 slugs — axon-contracting, axon-industry-trade, axon-integrated-facilities, axon-landscape, imdad) is **index-aligned** with `dict.companies.cards` in **both** `en.ts` and `ar.ts`; `src/data/company-profiles.ts` (accent, logo + dims, tagline, services, contact) is keyed by slug. Adding/reordering a company means touching all four in the same positions. Detail pages prerender via `generateStaticParams` over `companyMeta`.

- Per-company **accent colors** were sampled from the official logos (in `public/images/companies/`). Accent-colored text and primary buttons run through `color-mix(... 70%, var(--ink))` in `globals.css` for WCAG contrast — the orange (industry) and sage (landscape) accents fail on white otherwise.
- **No photography exists yet**: the hero is a designed CSS gradient, the About section is a logo mosaic, and company cards render logo plates tinted by accent. Drop-in points are documented in README.md.
- `src/data/projects.ts` and `certificates.ts` are **empty maps by design** — detail-page sections auto-appear once entries (and images under `public/images/...`) are added. Imdad's ISO 9001/14001/45001 scans are the first expected certificates.
- The brand wordmark is `src/components/BrandMark.tsx` — text-only "AXON SY" (charcoal + brand blue). The owner removed the X-check glyph from the logo; only `public/favicon.svg` still uses it.

### Design system
One global stylesheet `src/app/globals.css` (no Tailwind/CSS Modules). Brand token is `--brand` (royal blue `#3D55E0`) — **not** `--red` as in the UAE site. Re-skin via `:root` tokens.

### Data layer — Supabase, server-only
- Supabase project **axon-syria** (`uhuoqcuhwfgnylcljhct`, eu-central-1, same account as the UAE's separate `axon-group` project — never mix them). Tables `jobs` + `applications` with **RLS enabled and no policies**: the service-role key (`src/lib/supabase.ts`) is the only access path. Private `cvs` storage bucket for CV uploads.
- `src/lib/jobs.ts` reads live; all three readers **degrade gracefully when env vars are missing** (careers shows "no openings", `/admin` shows a setup notice instead of crashing) — preserve that behaviour.
- `src/data/jobs.ts` (`seedJobs`) is seed/reference only — the 7 jobs were already inserted into the DB; it is not read at runtime.
- Admin auth is a signed cookie (`src/lib/admin-auth.ts`); mutations are server actions in `(admin)/admin/actions.ts` that re-check auth and `revalidatePath`. Jobs are authored in English; `src/lib/translate.ts` (Anthropic API) generates the Arabic, falling back to English without `ANTHROPIC_API_KEY`.

### Runtime env vars (`.env.local`, git-ignored)
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `ANTHROPIC_API_KEY` (optional `ANTHROPIC_MODEL`). Keep secrets out of the repo.

## Known placeholders (see README.md for the full list)
- Domain `https://axonsyria.com` in `layout.tsx` is a placeholder (the real domain may be `axon-sy.com` — the group email is `info@axon-sy.com`; unconfirmed at time of writing).
- Group phone `+963 21 473 1300` is Imdad's published Aleppo line; footer social links point to `#`.
- Default admin credentials (`admin`/`admin`) must change before launch.

## Source material
Company scope and the Arabic names come from the licensed-activity Word docs and logos in `../Syria website/`; Imdad's facts come from imdadgroup.com. Don't invent capabilities, years, clients or projects beyond those sources — the four Axon companies are newly registered and have no Syrian track record (Imdad is the only established one).
