# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Trilingual (EN / AR / TR) Next.js 16 (App Router) + React 19 + TypeScript site for **Axon Syria** — an independent Syrian group of five companies — with a careers section and an admin dashboard. English and Arabic are the original locales (Arabic is full RTL); **Turkish was added later and is LTR**. Forked from the Axon Group UAE site (`axongroup-next`, sibling folder, which is still EN/AR only) and re-themed/rewritten; the two share the same architecture, but Axon Syria's localized data shapes have since diverged (see *i18n* below).

## ⚠️ Critical content rule — the UAE relationship

**Axon Syria is an INDEPENDENT Syrian group that is *supported by* Axon Group UAE. It is NOT part of, a branch of, or a sister to the UAE group.** The owner explicitly rejected copy implying the company "came from the UAE".

- Always "supported by" / "بدعم من" — never "backed by", "sister companies" / "شركات شقيقة", "part of Axon Group", or "the group's UAE operations".
- JSON-LD in `src/app/(site)/[lang]/layout.tsx` deliberately models Axon UAE as `sponsor`, **not** `parentOrganization` — keep it that way.
- The UaeSupport homepage section states the independence explicitly in every language; don't soften or remove it.
- **Copy style (all languages):** the owner wants human-sounding copy, not AI-sounding, and **bans the em-dash `—`** in user-facing text. Rewrite around it with commas, colons or shorter sentences. A normal hyphen and an en-dash in ranges (`Sat–Thu`) are fine.

## Commands

Node.js lives at `C:\Users\User\nodejs` and is often not on a fresh shell's PATH:

```powershell
$env:Path = "C:\Users\User\nodejs;$env:Path"
```

- `npm run dev` — dev server (Turbopack, port 3000).
- `npm run build` — production build; runs TypeScript **and** ESLint. This is the primary verification gate — **there is no test suite**; a green build plus manual checks against the dev server is how changes are verified.
- **Deploy:** pushing to `main` (repo `Mohamad-ctrl/axon-syria`) auto-deploys to Vercel; the site is **live at `https://axon-sy.com`** (apex + `www`).
- **Build gotcha:** after adding/moving/deleting a route, the `.next` type cache can go stale (`Cannot find module '.../route.js'`). Fix: delete `.next` and rebuild. Don't run `next build` while the dev server is running (both contend over `.next`).

## Architecture

### Two root layouts via route groups — no `app/layout.tsx`
- `(site)/[lang]/…` — public bilingual site (`en` | `ar`); its layout sets `<html lang dir>`, fonts (Cairo added only for `ar`), metadata and the org JSON-LD.
- `(admin)/admin/…` — internal dashboard (English, noindex), separate root layout.
- `src/proxy.ts` (Next 16's renamed middleware) redirects locale-less paths; matcher excludes `api`, `admin`, images and any path with a file extension.
- `params`/`searchParams` are **Promises** — `await` them.

### i18n — trilingual EN / AR / TR
- Locales live in `src/i18n/config.ts` (`locales = ["en","ar","tr"]`, `isLocale`, `dir`); only `ar` is RTL. **`getDictionary(locale)` now lives in `src/lib/content.ts` and is `async` + override-aware** (it deep-merges admin edits from Supabase over the static dictionaries, then falls back to them); `src/i18n/dictionaries.ts` keeps only the `Dictionary` type + the raw static defaults. `await` it. See *Content admin* below.
- `src/dictionaries/en.ts` is the **type source** (`Dictionary = typeof en`); **both `ar.ts` and `tr.ts`** are typed against it, so a missing/renamed key breaks the build. Keep all three in lockstep.
- **Locale selection is `obj[lang]`, never `lang === "ar" ? … : …`.** Every localized data object therefore carries all three locales — `Bilingual` is `{ en; ar; tr }`. Don't reintroduce binary `=== "ar"` branches when adding content.
- All user-facing text comes from the dictionaries or the per-company data files — never hardcode strings in components.
- `dict.stats` is an **array** of `{value, label}` (differs from the UAE site's object shape).
- SEO helpers in `src/lib/site.ts` centralize per-locale logic: `ogLocale` (`en_GB`/`ar_SY`/`tr_TR`), `ogAlternateLocales`, and `langAlternates(path)` (hreflang for all three + `x-default`). Use them in metadata + the sitemap instead of hand-writing locale maps.
- RTL: `dir="rtl"` + overrides in the `Arabic / RTL` section of `globals.css`; the Cairo font loads only for `ar`. `BrandMark` is forced `direction: ltr` so "AXON SY" never reverses in RTL. Arrows mirror via `.icon-arrow` (`icons.tsx`).
- Language switch: topbar EN / ع / TR (hidden below 720px) + a mobile-drawer switch (English / العربية / Türkçe) in `.nav__lang`; `Header.swap()` rewrites the locale segment of the current path.

### The five companies — index-aligned places
`src/data/companies.ts` (`companyMeta`: 5 slugs — axon-contracting, axon-industry-trade, axon-integrated-facilities, axon-landscape, imdad) is **index-aligned** with `dict.companies.cards` in **all three** dictionaries (`en.ts`, `ar.ts`, `tr.ts`); `src/data/company-profiles.ts` is keyed by slug and holds `accent`, logo + dims, `name`/`tagline` as `Bilingual`, `services` as **`{ name: Bilingual; desc: Bilingual }[]`** (restructured from the old flat `{en,ar,enDesc,arDesc}`), `contact`, optional `address`. Adding/reordering a company means touching the dictionaries and the profile in the same positions. Detail pages prerender via `generateStaticParams` over `companyMeta`.

- Per-company **accent colors** were sampled from the official logos (in `public/images/companies/`). Accent-colored text and primary buttons run through `color-mix(... 70%, var(--ink))` in `globals.css` for WCAG contrast — the orange (industry) and sage (landscape) accents fail on white otherwise.
- **Little site photography**: hero is a designed CSS gradient, About is a logo mosaic, company cards are accent-tinted logo plates. Exceptions: the homepage Projects section (real photos) and the UaeSupport panel (the seven Axon Group UAE logos in `public/images/uae-companies/` shown with names as **non-clickable** tiles).
- **Projects** live in ONE homepage section, not under any company: `featuredProjects` in `src/data/projects.ts` rendered by `components/Projects.tsx` (between Companies and WhyAxon), photos in `public/images/projects/`, sourced from the group capability statement. The per-company `companyProjects` map is empty by design so the detail-page Projects section auto-hides. `certificates.ts` (`companyCertificates`) is likewise empty; `CERT_META` is `{ label: Bilingual; note: Bilingual }`. Imdad's ISO 9001/14001/45001 scans are the first expected certs (`public/images/certificates/<slug>/`).
- The brand wordmark is `src/components/BrandMark.tsx` — text-only "AXON SY" (charcoal + brand blue). The owner removed the X-check glyph from the logo; only `public/favicon.svg` still uses it.

### Design system
One global stylesheet `src/app/globals.css` (no Tailwind/CSS Modules). Brand token is `--brand` (royal blue `#3D55E0`) — **not** `--red` as in the UAE site. Re-skin via `:root` tokens.

### Data layer — Supabase, server-only
- Supabase project **axon-syria** (`uhuoqcuhwfgnylcljhct`, eu-central-1, same account as the UAE's separate `axon-group` project — never mix them). Tables `jobs` + `applications` with **RLS enabled and no policies**: the service-role key (`src/lib/supabase.ts`) is the only access path. Private `cvs` storage bucket for CV uploads.
- `src/lib/jobs.ts` reads live; all three readers **degrade gracefully when env vars are missing** (careers shows "no openings", `/admin` shows a setup notice instead of crashing) — preserve that behaviour.
- `src/data/jobs.ts` (`seedJobs`) is seed/reference only — the 7 jobs were already inserted into the DB; it is not read at runtime.
- Admin auth is a signed cookie (`src/lib/admin-auth.ts`); mutations are server actions in `(admin)/admin/actions.ts` that re-check auth and `revalidatePath`. Jobs are authored in English; `src/lib/translate.ts` (Anthropic API) generates the Arabic, falling back to English without `ANTHROPIC_API_KEY`.
- **Jobs are EN + AR only** (`L<T> = { en; ar; tr? }` in `lib/jobs.ts`), so **Turkish careers pages fall back to English** via a local `pick()` helper (`field[lang] ?? field.en`). `translate.ts` only produces Arabic, so making new jobs Turkish would mean extending it.

### Content admin (editable site copy + images)
Every section's text and images are editable from **`/admin/content`** without a redeploy. The TypeScript dictionaries (`src/dictionaries/*.ts`) and per-company data files stay the **typed defaults and fallback**; the admin stores *partial overrides* in a Supabase **`content`** table (one jsonb row per document: `dictionary`, `companyProfiles`, `projects`, `certificates`) and `src/lib/content.ts` **deep-merges them over the defaults** at render time (arrays replace wholesale). With no overrides, or no Supabase env, the site renders exactly as the static defaults.
- `src/lib/content-schema.ts` is the single registry of editable sections (`SECTIONS`) + the pure logical⇄store transforms; it drives both the index and the generic `ContentEditor` (EN/AR/TR fields, list add/remove, color, image upload). Adding/renaming a dictionary key means updating the matching section's `fields` there too. The 5 company **cards** list is edit-only (locked) to stay index-aligned.
- Each company's **profile** section also edits its **description** (`CompanyProfile.about`, optional `Bilingual`): the detail page renders `profile.about?.[lang] || card.about`, so it falls back to the dictionary card's `about` when unset. The editor prefills the field with that default (passed into `profileToLogical` from `[section]/page.tsx`), so the card `about` stays the single default source and the override lives per-slug in `companyProfiles` (no array-index merge).
- Reads are cached via `unstable_cache` tagged `content` (keeps home + company pages **static/SSG**); the save/reset server actions (`src/app/(admin)/admin/content-actions.ts`) call **`updateTag("content")`** (read-your-own-writes, blocking) so edits go live on the next request. NB: `revalidateTag` is two-arg here (`(tag, "max")`, stale-while-revalidate) — `updateTag` is what gives instant publish. Editing rows **directly in SQL** bypasses this, leaving the dev cache stale until `.next` is cleared.
- Images upload to the **public `site-media` bucket** via the auth-guarded `src/app/api/admin/upload/route.ts`; the Supabase storage host is whitelisted in `next.config.ts` `images.remotePatterns`. The client `Header`/`Footer` get a slim, serializable company-nav map (built in the `[lang]` layout from the effective profiles) instead of importing the static data, so co-brand name/logo edits stay in sync.

### SEO & metadata
- `src/lib/site.ts` exports `SITE_URL` (from `NEXT_PUBLIC_SITE_URL`, default `https://axon-sy.com`) — the single source for every absolute URL (`metadataBase`, canonical, OG, sitemap, JSON-LD). `layout.tsx` no longer hardcodes a domain.
- `src/app/sitemap.ts` + `src/app/robots.ts` (file conventions): the sitemap lists every public page in EN + AR with `hreflang` alternates (incl. `x-default`); robots allows crawling, disallows `/admin` + `/api`, and points to the sitemap.
- Per-page metadata sets canonical + `hreflang` (en/ar/x-default) + OpenGraph. Company pages use **sector-bearing titles** (`name — tag`) and emit a per-company **Organization** JSON-LD (`parentOrganization: Axon Syria`); job pages emit **JobPosting** JSON-LD; the layout emits the group Organization JSON-LD (with Axon UAE as `sponsor`).
- `src/app/api/og/route.tsx` — a `next/og` branded social card at `/api/og` (lives under `/api` so the locale proxy doesn't redirect it), referenced by `openGraph.images` on every page so link previews (WhatsApp etc.) show the brand. Favicon is `public/favicon.svg` (the default `favicon.ico` was removed).
- Google Search Console is verified via `verification.google` in the layout metadata + `public/google…html`.

### Runtime env vars (`.env.local`, git-ignored)
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `ANTHROPIC_API_KEY` (optional `ANTHROPIC_MODEL`). Keep secrets out of the repo. Plus the public, non-secret **`NEXT_PUBLIC_SITE_URL`** (canonical origin for SEO; defaults to `https://axon-sy.com` — see `src/lib/site.ts`).

## Known placeholders (see README.md for the full list)
- **Live domain is `axon-sy.com`** (apex + `www`), centralized in `src/lib/site.ts` (`SITE_URL`, overridable via `NEXT_PUBLIC_SITE_URL`) — `layout.tsx` no longer hardcodes a domain; Search Console is verified and the sitemap submitted.
- Group phone `+963 21 473 1300` is Imdad's published Aleppo line; group email is `info@axon-sy.com`; footer social links still point to `#`.
- Default admin credentials (`admin`/`admin`) must change before launch — set `ADMIN_USERNAME`/`ADMIN_PASSWORD` and a strong `ADMIN_SESSION_SECRET` in Vercel.

## Source material
Company scope and the Arabic names come from the licensed-activity Word docs and logos in `../Syria website/`; Imdad's facts come from imdadgroup.com. Don't invent capabilities, years, clients or projects beyond those sources — the four Axon companies are newly registered and have no Syrian track record (Imdad is the only established one).
