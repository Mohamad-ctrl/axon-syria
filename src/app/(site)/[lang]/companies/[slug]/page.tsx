import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { companyMeta } from "@/data/companies";
import { companyProfiles } from "@/data/company-profiles";
import { companyCertificates, CERT_META } from "@/data/certificates";
import { companyProjects, PROJECT_CAT } from "@/data/projects";
import { ArrowRight } from "@/components/icons";
import { SITE_URL, ogLocale, ogAlternateLocales, langAlternates } from "@/lib/site";

// One static page per company slug, generated for each locale by the parent
// `[lang]` layout. Content is fully static (dictionaries + data), so prerender it all.
export function generateStaticParams() {
  return companyMeta.map((m) => ({ slug: m.slug }));
}

/** Concise, keyword + location-rich summary, shared by the meta description and
 *  the Organization JSON-LD so they stay consistent. */
function buildDescription(loc: string, name: string, tagline: string, serviceNames: string[]): string {
  const svc = serviceNames.slice(0, 3);
  if (loc === "ar") return `${name} في سوريا${svc.length ? `: ${svc.join("، ")} وغيرها` : ""}. ${tagline} ضمن مجموعة أكسون سوريا.`;
  if (loc === "tr") return `${name}, Suriye${svc.length ? `: ${svc.join(", ")} ve daha fazlası` : ""}. ${tagline} Axon Syria grubunun bir parçası.`;
  return `${name} in Syria${svc.length ? `: ${svc.join(", ")} and more` : ""}. ${tagline} Part of the Axon Syria group.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const loc = isLocale(lang) ? lang : "en";
  const dict = getDictionary(loc);
  const idx = companyMeta.findIndex((m) => m.slug === slug);
  if (idx === -1) return {};
  const card = dict.companies.cards[idx];
  const profile = companyProfiles[slug];
  const tagline = profile ? profile.tagline[loc] : card.desc;
  const services = profile?.services ?? [];
  const description = buildDescription(loc, card.name, tagline, services.map((s) => s.name[loc]));
  const path = `/companies/${slug}`;
  // Title carries the company name + its sector, so it matches "<company> syria"
  // and disambiguates the five Axon-prefixed names (the template adds "| Axon Syria").
  const titleSep = loc === "ar" ? "، " : ", ";
  const titleWithSector = `${card.name}${titleSep}${card.tag}`;
  return {
    title: titleWithSector,
    description,
    keywords: [
      card.name,
      card.tag,
      "Syria",
      "Aleppo",
      "أكسون سوريا",
      ...services.map((s) => s.name[loc]),
    ],
    alternates: {
      canonical: `/${loc}${path}`,
      languages: langAlternates(path),
    },
    openGraph: {
      type: "website",
      siteName: "Axon Syria",
      title: `${titleWithSector} | Axon Syria`,
      description,
      url: `${SITE_URL}/${loc}${path}`,
      locale: ogLocale(loc),
      alternateLocale: ogAlternateLocales(loc),
      images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: "Axon Syria" }],
    },
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const idx = companyMeta.findIndex((m) => m.slug === slug);
  if (idx === -1) notFound();

  const dict = getDictionary(lang);
  const card = dict.companies.cards[idx];
  const cd = dict.companyDetail;
  const profile = companyProfiles[slug];
  const certs = companyCertificates[slug] ?? [];
  const projects = companyProjects[slug] ?? [];
  const services = profile?.services ?? [];
  const tagline = profile ? profile.tagline[lang] : card.desc;

  // Per-company accent colour (subtle theming); falls back to the Axon red.
  const accentStyle = profile ? ({ "--accent": profile.accent } as CSSProperties) : undefined;

  const meta = companyMeta[idx];
  // Per-company Organization structured data — tells search engines this page
  // *is* the company named here, so a search for the company name resolves to it.
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: card.name,
    ...(profile ? { alternateName: [profile.name.en, profile.name.ar, profile.name.tr] } : {}),
    url: `${SITE_URL}/${lang}/companies/${slug}`,
    ...(profile?.logo ? { logo: `${SITE_URL}${profile.logo}` } : {}),
    description: buildDescription(lang, card.name, tagline, services.map((s) => s.name[lang])),
    areaServed: "SY",
    ...(profile?.address
      ? {
          address: {
            "@type": "PostalAddress",
            ...(profile.address.street ? { streetAddress: profile.address.street } : {}),
            addressLocality: profile.address.locality,
            addressCountry: "SY",
          },
        }
      : {}),
    ...(profile?.contact?.email ? { email: profile.contact.email } : {}),
    ...(profile?.contact?.phone ? { telephone: profile.contact.phone.replace(/\s+/g, "") } : {}),
    parentOrganization: { "@type": "Organization", name: "Axon Syria", url: `${SITE_URL}/` },
    ...(services.length
      ? {
          makesOffer: services.map((s) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: s.name[lang],
              description: s.desc[lang],
            },
          })),
        }
      : {}),
    ...(meta.website ? { sameAs: [meta.website] } : {}),
  };

  return (
    <div className="company-detail" style={accentStyle}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div className="crumbs">
            <Link href={`/${lang}`}>{cd.crumbHome}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${lang}#companies`}>{cd.crumbCompanies}</Link>
            <span aria-hidden="true">/</span>
            <span>{card.name}</span>
          </div>
          <span className="chip">{card.tag}</span>
          <h1 style={{ marginTop: ".6rem" }}>{card.name}</h1>
          <p>{tagline}</p>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="reveal" style={{ maxWidth: "760px", marginInline: "auto" }}>
            {profile?.logo && (
              <div className={`company-logo${profile.logoOnDark ? " company-logo--dark" : ""}`}>
                <Image
                  className="company-logo__img"
                  src={profile.logo}
                  alt={card.name}
                  width={profile.logoW ?? 200}
                  height={profile.logoH ?? 80}
                />
              </div>
            )}
            <p className="eyebrow">{cd.overviewEyebrow}</p>
            <div className="prose" style={{ marginTop: ".6rem" }}>
              {card.about.split("\n\n").map((para) => (
                <p key={para.slice(0, 32)}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head reveal">
              <p className="eyebrow eyebrow--center">{cd.servicesEyebrow}</p>
              <h2>{cd.servicesTitle}</h2>
            </div>
            <div className="grid grid-3">
              {services.map((s) => (
                <article className="service-card reveal" key={s.name.en}>
                  <span className="service-card__mark" aria-hidden="true" />
                  <h3>{s.name[lang]}</h3>
                  <p>{s.desc[lang]}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {certs.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <div className="section-head reveal">
              <p className="eyebrow eyebrow--center">{cd.certsEyebrow}</p>
              <h2>{cd.certsTitle}</h2>
              <p className="lead">{cd.certsLead}</p>
            </div>
            <div className="grid grid-3">
              {certs.map((c) => {
                const m = CERT_META[c.kind];
                return (
                  <article className="cert-card reveal" key={c.kind}>
                    <a
                      className="cert-card__frame"
                      href={c.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${m.label[lang]}, ${card.name}`}
                    >
                      <Image
                        className="cert-card__photo"
                        src={c.src}
                        alt={`${m.label[lang]}, ${card.name}`}
                        fill
                        sizes="(max-width: 620px) 100vw, (max-width: 960px) 50vw, 33vw"
                      />
                    </a>
                    <div className="cert-card__meta">
                      <h3>{m.label[lang]}</h3>
                      <p>{m.note[lang]}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head reveal">
              <p className="eyebrow eyebrow--center">{cd.projectsEyebrow}</p>
              <h2>{cd.projectsTitle}</h2>
              <p className="lead">{cd.projectsLead}</p>
            </div>
            <div className="grid grid-3">
              {projects.map((p) => (
                <article className="project-card reveal" key={p.img}>
                  <Image
                    className="project-card__img"
                    src={p.img}
                    alt={p[lang]}
                    width={600}
                    height={450}
                  />
                  <div className="project-card__meta">
                    <span className="project-card__cat">{PROJECT_CAT[p.kind][lang]}</span>
                    <h3>{p[lang]}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="cta reveal">
            <h2>{cd.contactTitle}</h2>
            <p>{cd.contactText}</p>
            <div className="cta__actions">
              {profile?.contact?.email ? (
                <a className="btn btn--primary btn--lg" href={`mailto:${profile.contact.email}`}>
                  {cd.contactCta}
                </a>
              ) : (
                <Link className="btn btn--primary btn--lg" href={`/${lang}#contact`}>
                  {cd.contactCta}
                </Link>
              )}
              {profile?.contact?.phone && (
                <a className="btn btn--light btn--lg" href={`tel:${profile.contact.phone.replace(/\s+/g, "")}`}>
                  {profile.contact.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ textAlign: "center", padding: "0 0 4rem" }}>
        <Link className="btn btn--ghost" href={`/${lang}#companies`}>
          {cd.back}
        </Link>
      </div>
    </div>
  );
}
