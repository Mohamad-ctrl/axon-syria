/**
 * Declarative schema for the admin content editor.
 *
 * Every editable section of the site is described here once: which content
 * document it writes to (`store`), and the fields the editor renders (`shape`).
 * The generic `ContentEditor` client renders any `shape`; the pure transforms
 * below convert between the editor's *logical* value (trilingual leaves are
 * `{ en, ar, tr }` objects) and each store's on-disk shape.
 *
 * Stores:
 * - `dict`    — a top-level key of the dictionaries. Locale lives at the top of
 *   the dictionary, so trilingual leaves are zipped from / unzipped to the three
 *   locale dictionaries.
 * - `profile` — a company's entry in `companyProfiles` (data is already inline
 *   trilingual). `contactPhone`/`contactEmail` map to the nested `contact`.
 * - `projects`— the home-page `featuredProjects` list.
 * - `certs`   — a company's certificate list.
 */
import { companyMeta } from "@/data/companies";
import { companyProfiles, type CompanyProfile } from "@/data/company-profiles";
import { PROJECT_CAT, type Project } from "@/data/projects";
import { CERT_META, type CompanyCert } from "@/data/certificates";

/* ------------------------------------------------------------------ types */

export interface TextField {
  type: "text" | "textarea";
  key: string;
  label: string;
  /** When true the field is per-locale (EN / AR / TR inputs). */
  i18n: boolean;
  hint?: string;
}
export interface ImageFieldDef {
  type: "image";
  key: string;
  label: string;
  /** Storage folder for uploads, e.g. "projects" or "companies/imdad". */
  folder?: string;
  hint?: string;
}
export interface ScalarFieldDef {
  type: "color" | "tel" | "email" | "url";
  key: string;
  label: string;
  hint?: string;
}
export interface SelectFieldDef {
  type: "select";
  key: string;
  label: string;
  options: { value: string; label: string }[];
  hint?: string;
}
export interface ListFieldDef {
  type: "list";
  key: string;
  label: string;
  itemLabel: string;
  itemFields: Field[];
  /** Edit-only list: no add / remove (keeps index-aligned data in lockstep). */
  locked?: boolean;
  hint?: string;
}
export type Field = TextField | ImageFieldDef | ScalarFieldDef | SelectFieldDef | ListFieldDef;

export type Shape =
  | { kind: "object"; fields: Field[] }
  | { kind: "list"; itemLabel: string; itemFields: Field[]; locked?: boolean };

export type Store =
  | { kind: "dict"; rootKey: string }
  | { kind: "profile"; slug: string }
  | { kind: "projects" }
  | { kind: "certs"; slug: string };

export interface Section {
  id: string;
  group: string;
  label: string;
  description: string;
  store: Store;
  shape: Shape;
}

/* ------------------------------------------------------------- field helpers */

function titleCase(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}
/** i18n single-line text field (label defaults to a Title Cased key). */
function t(key: string, label?: string, hint?: string): TextField {
  return { type: "text", key, label: label ?? titleCase(key), i18n: true, hint };
}
/** i18n multi-line text field. */
function area(key: string, label?: string, hint?: string): TextField {
  return { type: "textarea", key, label: label ?? titleCase(key), i18n: true, hint };
}
function list(
  key: string,
  label: string,
  itemLabel: string,
  itemFields: Field[],
  opts: { locked?: boolean; hint?: string } = {},
): ListFieldDef {
  return { type: "list", key, label, itemLabel, itemFields, ...opts };
}

/* ---------------------------------------------------------------- sections */

const dictSections: Section[] = [
  {
    id: "meta",
    group: "Global",
    label: "SEO / Meta",
    description: "The default browser-tab title and search-result description.",
    store: { kind: "dict", rootKey: "meta" },
    shape: { kind: "object", fields: [t("title"), area("description")] },
  },
  {
    id: "nav",
    group: "Global",
    label: "Navigation labels",
    description: "Header menu and accessibility labels.",
    store: { kind: "dict", rootKey: "nav" },
    shape: {
      kind: "object",
      fields: [
        t("about"), t("companies", "Companies"), t("why", "Why"), t("careers"),
        t("contact"), t("getInTouch", "Get in touch"), t("skip", "Skip link"),
        t("openMenu", "Open menu"), t("closeMenu", "Close menu"), t("language"),
      ],
    },
  },
  {
    id: "hero",
    group: "Home",
    label: "Hero",
    description: "The top banner: eyebrow, headline, intro and the two buttons.",
    store: { kind: "dict", rootKey: "hero" },
    shape: {
      kind: "object",
      fields: [
        t("eyebrow"), t("title", "Title"), area("subtitle"),
        t("ctaPrimary", "Primary button"), t("ctaSecondary", "Secondary button"),
      ],
    },
  },
  {
    id: "stats",
    group: "Home",
    label: "Stats band",
    description: "The row of numbers under the hero.",
    store: { kind: "dict", rootKey: "stats" },
    shape: {
      kind: "list",
      itemLabel: "Stat",
      itemFields: [t("value", "Number"), t("label", "Label")],
    },
  },
  {
    id: "about",
    group: "Home",
    label: "About",
    description: "The 'Who we are' section, including the checklist points.",
    store: { kind: "dict", rootKey: "about" },
    shape: {
      kind: "object",
      fields: [
        t("eyebrow"), t("title", "Title"), area("lead"),
        list("points", "Points", "Point", [t("t", "Heading"), area("d", "Text")]),
        t("cta", "Button"),
      ],
    },
  },
  {
    id: "companies",
    group: "Home",
    label: "Companies section + cards",
    description:
      "The 'Our companies' heading and the five company cards. Cards are edit-only (the five companies are fixed in code).",
    store: { kind: "dict", rootKey: "companies" },
    shape: {
      kind: "object",
      fields: [
        t("eyebrow"), t("title", "Title"), area("lead"),
        t("learnMore", "'Learn more' link"), t("visit", "'Visit website' link"), t("contact", "'Get in touch' link"),
        list(
          "cards",
          "Company cards",
          "Card",
          [
            t("tag", "Tag"), t("name", "Name"), area("desc", "Short description"),
            area("about", "Full overview", "Paragraphs separated by a blank line."),
            t("alt", "Logo alt text"),
          ],
          { locked: true },
        ),
      ],
    },
  },
  {
    id: "company-detail",
    group: "Companies",
    label: "Company page labels",
    description: "Section headings and labels shared by every company detail page.",
    store: { kind: "dict", rootKey: "companyDetail" },
    shape: {
      kind: "object",
      fields: [
        t("crumbHome", "Breadcrumb: Home"), t("crumbCompanies", "Breadcrumb: Companies"), t("back", "Back link"),
        t("overviewEyebrow", "Overview eyebrow"),
        t("servicesEyebrow", "Services eyebrow"), t("servicesTitle", "Services title"),
        t("certsEyebrow", "Certs eyebrow"), t("certsTitle", "Certs title"), area("certsLead", "Certs lead"),
        t("projectsEyebrow", "Projects eyebrow"), t("projectsTitle", "Projects title"), area("projectsLead", "Projects lead"),
        t("contactEyebrow", "Contact eyebrow"), t("contactTitle", "Contact title"), area("contactText", "Contact text"),
        t("contactCta", "Contact button"),
      ],
    },
  },
  {
    id: "projects-heading",
    group: "Home",
    label: "Projects section heading",
    description: "The heading above the project grid (the projects themselves are edited under 'Featured projects').",
    store: { kind: "dict", rootKey: "projects" },
    shape: { kind: "object", fields: [t("eyebrow"), t("title", "Title"), area("lead")] },
  },
  {
    id: "why",
    group: "Home",
    label: "Why Axon",
    description: "The 'What the group brings' section and its feature list.",
    store: { kind: "dict", rootKey: "why" },
    shape: {
      kind: "object",
      fields: [
        t("eyebrow"), t("title", "Title"),
        list("features", "Features", "Feature", [t("title", "Title"), area("desc", "Text")]),
      ],
    },
  },
  {
    id: "uae",
    group: "Home",
    label: "Supported by Axon UAE",
    description: "The UAE-support panel. Keep the 'supported by, not part of' wording.",
    store: { kind: "dict", rootKey: "uae" },
    shape: {
      kind: "object",
      fields: [t("eyebrow"), t("title", "Title"), area("text"), t("panelTitle", "Panel title"), t("cta", "Button")],
    },
  },
  {
    id: "cta",
    group: "Home",
    label: "Closing call-to-action",
    description: "The contact band near the bottom of the home page.",
    store: { kind: "dict", rootKey: "cta" },
    shape: { kind: "object", fields: [t("title", "Title"), area("text"), t("email", "Button")] },
  },
  {
    id: "footer",
    group: "Global",
    label: "Footer",
    description: "Footer tagline, column headings and link labels.",
    store: { kind: "dict", rootKey: "footer" },
    shape: {
      kind: "object",
      fields: [
        area("tagline"),
        t("companiesTitle", "Companies heading"), t("companyTitle", "Company heading"),
        t("about"), t("why", "Why"), t("careers"), t("contact"), t("getInTouch", "Get in touch heading"),
        t("hours", "Opening hours"), t("rights", "Rights line"), t("location"),
      ],
    },
  },
  {
    id: "contact",
    group: "Global",
    label: "Contact & social",
    description: "The group phone, email and address shown in the header bar and footer, plus the four social links.",
    store: { kind: "dict", rootKey: "contact" },
    shape: {
      kind: "object",
      fields: [
        { type: "tel", key: "phone", label: "Phone", hint: "Shown in the header bar and footer." },
        { type: "email", key: "email", label: "Email" },
        area("address", "Address", "Footer address. Put each line on its own line."),
        { type: "url", key: "linkedin", label: "LinkedIn URL", hint: "Leave as # to hide this icon." },
        { type: "url", key: "instagram", label: "Instagram URL", hint: "Leave as # to hide this icon." },
        { type: "url", key: "facebook", label: "Facebook URL", hint: "Leave as # to hide this icon." },
        { type: "url", key: "x", label: "X (Twitter) URL", hint: "Leave as # to hide this icon." },
      ],
    },
  },
  {
    id: "careers",
    group: "Careers",
    label: "Careers page",
    description: "All copy on the careers landing page, including the 'Why work with us' values.",
    store: { kind: "dict", rootKey: "careers" },
    shape: {
      kind: "object",
      fields: [
        t("metaTitle", "SEO title"), area("metaDescription", "SEO description"),
        t("crumbHome", "Breadcrumb: Home"), t("crumbCareers", "Breadcrumb: Careers"),
        t("eyebrow"), t("title", "Title"), area("intro"), t("viewRoles", "'View roles' button"),
        t("whyEyebrow", "Why eyebrow"), t("whyTitle", "Why title"),
        list("values", "Values", "Value", [t("title", "Title"), area("desc", "Text")]),
        t("openEyebrow", "Openings eyebrow"), t("openTitle", "Openings title"),
        t("rolesCount", "Roles-count line", "Keep the {count} placeholder."),
        t("filterAll", "Filter: All"), t("filterAria", "Filter aria-label"), t("viewApply", "'View & apply' link"),
        area("emptyPrefix", "Empty-state text"),
        t("responsibilities", "Responsibilities heading"), t("requirements", "Requirements heading"),
        t("detailCompany", "Detail: Company"), t("detailDepartment", "Detail: Department"),
        t("detailLocation", "Detail: Location"), t("detailType", "Detail: Type"), t("detailPosted", "Detail: Posted"),
        t("applyNow", "'Apply now' button"), t("applyEyebrow", "Apply eyebrow"), t("applyTitle", "Apply title"),
        area("applyLead", "Apply lead"), t("notFound", "Not-found text"),
      ],
    },
  },
  {
    id: "form",
    group: "Careers",
    label: "Application form",
    description: "Labels and messages on the job application form.",
    store: { kind: "dict", rootKey: "form" },
    shape: {
      kind: "object",
      fields: [
        t("firstName", "First name"), t("lastName", "Last name"), t("email"), t("phone"),
        t("coverNote", "Cover note"), t("coverPlaceholder", "Cover placeholder"),
        t("cv", "CV label"), t("cvHint", "CV hint"),
        t("submit", "Submit button"), t("submitting", "Submitting text"),
        t("successTitle", "Success title"), area("successText", "Success text", "Keep the {title} placeholder."),
        t("errorGeneric", "Generic error"),
      ],
    },
  },
];

/** Service sub-fields, shared by all company profiles. */
const serviceItemFields: Field[] = [
  t("name", "Service name"),
  area("desc", "Description"),
];

const profileSections: Section[] = companyMeta.map(({ slug }): Section => {
  const name = companyProfiles[slug]?.name.en ?? slug;
  return {
    id: `profile-${slug}`,
    group: "Companies",
    label: `${name} — profile`,
    description: "Header name, tagline, accent colour, logo, contact and the services list shown on this company's page.",
    store: { kind: "profile", slug },
    shape: {
      kind: "object",
      fields: [
        t("name", "Display name"),
        t("tagline", "Tagline"),
        { type: "color", key: "accent", label: "Accent colour" },
        { type: "image", key: "logo", label: "Logo", folder: `companies/${slug}`, hint: "Transparent PNG works best." },
        { type: "tel", key: "contactPhone", label: "Contact phone", hint: "Optional. Leave blank to use the group contact." },
        { type: "email", key: "contactEmail", label: "Contact email", hint: "Optional." },
        list("services", "Services", "Service", serviceItemFields),
      ],
    },
  };
});

const projectKindOptions = Object.entries(PROJECT_CAT).map(([value, b]) => ({ value, label: b.en }));

const projectsSection: Section = {
  id: "featured-projects",
  group: "Home",
  label: "Featured projects",
  description: "The project photos and titles shown on the home page.",
  store: { kind: "projects" },
  shape: {
    kind: "list",
    itemLabel: "Project",
    itemFields: [
      { type: "select", key: "kind", label: "Category", options: projectKindOptions },
      t("title", "Title"),
      { type: "image", key: "img", label: "Photo", folder: "projects" },
    ],
  },
};

const certKindOptions = Object.entries(CERT_META).map(([value, m]) => ({ value, label: m.label.en }));

const certSections: Section[] = companyMeta.map(({ slug }): Section => {
  const name = companyProfiles[slug]?.name.en ?? slug;
  return {
    id: `certs-${slug}`,
    group: "Companies",
    label: `${name} — certificates`,
    description: "Certificate / licence scans shown on this company's page. The section hides itself when empty.",
    store: { kind: "certs", slug },
    shape: {
      kind: "list",
      itemLabel: "Certificate",
      itemFields: [
        { type: "select", key: "kind", label: "Type", options: certKindOptions },
        { type: "image", key: "src", label: "Scan", folder: `certificates/${slug}`, hint: "An image of the certificate." },
      ],
    },
  };
});

export const SECTIONS: Section[] = [
  ...dictSections,
  ...profileSections,
  projectsSection,
  ...certSections,
];

export const SECTION_GROUPS = ["Global", "Home", "Companies", "Careers"] as const;

export function getSection(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}

/* --------------------------------------------------------- value transforms */

const LOCALES = ["en", "ar", "tr"] as const;
type Loc = (typeof LOCALES)[number];

function asObject(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}
function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}
function isI18nText(f: Field): f is TextField {
  return (f.type === "text" || f.type === "textarea") && f.i18n;
}

/* ----- dict store: zip three locale subtrees <-> logical value ----- */

function fieldToLogical(f: Field, en: unknown, ar: unknown, tr: unknown): unknown {
  if (f.type === "list") {
    return asArray(en).map((_, i) =>
      objFieldsToLogical(f.itemFields, asArray(en)[i], asArray(ar)[i], asArray(tr)[i]),
    );
  }
  if (isI18nText(f)) return { en: str(en), ar: str(ar), tr: str(tr) };
  return str(en); // non-i18n leaves are identical across locales
}
function objFieldsToLogical(fields: Field[], en: unknown, ar: unknown, tr: unknown): Record<string, unknown> {
  const eo = asObject(en);
  const ao = asObject(ar);
  const to = asObject(tr);
  const out: Record<string, unknown> = {};
  for (const f of fields) out[f.key] = fieldToLogical(f, eo[f.key], ao[f.key], to[f.key]);
  return out;
}
export function dictToLogical(shape: Shape, en: unknown, ar: unknown, tr: unknown): unknown {
  if (shape.kind === "list") {
    return asArray(en).map((_, i) =>
      objFieldsToLogical(shape.itemFields, asArray(en)[i], asArray(ar)[i], asArray(tr)[i]),
    );
  }
  return objFieldsToLogical(shape.fields, en, ar, tr);
}

function fieldFromLogical(f: Field, val: unknown, loc: Loc): unknown {
  if (f.type === "list") {
    return asArray(val).map((item) => objFieldsFromLogical(f.itemFields, item, loc));
  }
  if (isI18nText(f)) return str(asObject(val)[loc]);
  return str(val);
}
function objFieldsFromLogical(fields: Field[], logical: unknown, loc: Loc): Record<string, unknown> {
  const lo = asObject(logical);
  const out: Record<string, unknown> = {};
  for (const f of fields) out[f.key] = fieldFromLogical(f, lo[f.key], loc);
  return out;
}
function dictFromLogical(shape: Shape, logical: unknown, loc: Loc): unknown {
  if (shape.kind === "list") {
    return asArray(logical).map((item) => objFieldsFromLogical(shape.itemFields, item, loc));
  }
  return objFieldsFromLogical(shape.fields, logical, loc);
}
/** Per-locale override subtrees for a dict section, e.g. `{ en, ar, tr }`. */
export function dictOverrideFromLogical(shape: Shape, logical: unknown): Record<Loc, unknown> {
  return {
    en: dictFromLogical(shape, logical, "en"),
    ar: dictFromLogical(shape, logical, "ar"),
    tr: dictFromLogical(shape, logical, "tr"),
  };
}

/* ----- profile store ----- */

export function profileToLogical(profile: CompanyProfile | undefined): Record<string, unknown> {
  return {
    name: profile?.name ?? { en: "", ar: "", tr: "" },
    tagline: profile?.tagline ?? { en: "", ar: "", tr: "" },
    accent: profile?.accent ?? "#3D55E0",
    logo: profile?.logo ?? "",
    contactPhone: profile?.contact?.phone ?? "",
    contactEmail: profile?.contact?.email ?? "",
    services: (profile?.services ?? []).map((s) => ({ name: s.name, desc: s.desc })),
  };
}
/** Partial profile override (only the editable fields). Empty contact fields
 *  are dropped so the page falls back to the group contact. */
export function profileFromLogical(logical: unknown): Partial<CompanyProfile> {
  const l = asObject(logical);
  const phone = str(l.contactPhone).trim();
  const email = str(l.contactEmail).trim();
  const tri = (v: unknown) => ({ en: str(asObject(v).en), ar: str(asObject(v).ar), tr: str(asObject(v).tr) });
  const out: Partial<CompanyProfile> = {
    name: tri(l.name),
    tagline: tri(l.tagline),
    accent: str(l.accent) || "#3D55E0",
    logo: str(l.logo) || undefined,
    services: asArray(l.services).map((s) => ({ name: tri(asObject(s).name), desc: tri(asObject(s).desc) })),
  };
  if (phone || email) out.contact = { ...(phone ? { phone } : {}), ...(email ? { email } : {}) };
  return out;
}

/* ----- projects store ----- */

export function projectsToLogical(list: Project[]): Record<string, unknown>[] {
  return list.map((p) => ({ kind: p.kind, title: { en: p.en, ar: p.ar, tr: p.tr }, img: p.img }));
}
export function projectsFromLogical(logical: unknown): Project[] {
  return asArray(logical).map((it) => {
    const o = asObject(it);
    const title = asObject(o.title);
    return {
      kind: (str(o.kind) || "contracting") as Project["kind"],
      en: str(title.en),
      ar: str(title.ar),
      tr: str(title.tr),
      img: str(o.img),
    };
  });
}

/* ----- certs store ----- */

export function certsToLogical(list: CompanyCert[]): Record<string, unknown>[] {
  return list.map((c) => ({ kind: c.kind, src: c.src }));
}
export function certsFromLogical(logical: unknown): CompanyCert[] {
  return asArray(logical)
    .map((it) => {
      const o = asObject(it);
      return { kind: str(o.kind) as CompanyCert["kind"], src: str(o.src) };
    })
    .filter((c) => c.kind && c.src);
}
