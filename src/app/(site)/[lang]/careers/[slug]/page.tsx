import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/lib/content";
import { getJobBySlug } from "@/lib/jobs";
import ApplicationForm from "@/components/careers/ApplicationForm";
import { SITE_URL, ogLocale, ogAlternateLocales, langAlternates } from "@/lib/site";
import { MapPin, Clock } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const loc = isLocale(lang) ? lang : "en";
  const dict = await getDictionary(loc);
  const job = await getJobBySlug(slug);
  if (!job) return { title: dict.careers.notFound };
  // Job content is EN + AR (DB); Turkish (and any gap) falls back to English.
  const pick = <T,>(f: { en: T; ar: T; tr?: T }): T => f[loc] ?? f.en;
  const desc = pick(job.description)[0] ?? pick(job.title);
  const titleSep = loc === "ar" ? "، " : ", ";
  const title = `${pick(job.title)}${titleSep}${pick(job.company)}`;
  return {
    title,
    description: desc,
    alternates: {
      canonical: `/${loc}/careers/${job.slug}`,
      languages: langAlternates(`/careers/${job.slug}`),
    },
    openGraph: {
      type: "article",
      siteName: "Axon Syria",
      title,
      description: desc,
      url: `${SITE_URL}/${loc}/careers/${job.slug}`,
      locale: ogLocale(loc),
      alternateLocale: ogAlternateLocales(loc),
      images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: "Axon Syria" }],
    },
  };
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const c = dict.careers;
  const job = await getJobBySlug(slug);
  if (!job || !job.active) notFound();

  // Job content is EN + AR (DB); Turkish (and any gap) falls back to English.
  const pick = <T,>(f: { en: T; ar: T; tr?: T }): T => f[lang] ?? f.en;

  const postedLabel = new Date(job.posted).toLocaleDateString(
    lang === "ar" ? "ar-AE" : lang === "tr" ? "tr-TR" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );

  // JobPosting structured data so live roles are eligible for Google Jobs.
  const jobLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: pick(job.title),
    description: [...pick(job.description), ...pick(job.requirements)].join(" "),
    datePosted: new Date(job.posted).toISOString(),
    employmentType: /part/i.test(job.type.en) ? "PART_TIME" : "FULL_TIME",
    hiringOrganization: { "@type": "Organization", name: pick(job.company), sameAs: SITE_URL },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: pick(job.location), addressCountry: "SY" },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobLd) }}
      />
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div className="crumbs">
            <Link href={`/${lang}`}>{c.crumbHome}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${lang}/careers`}>{c.crumbCareers}</Link>
            <span aria-hidden="true">/</span>
            <span>{pick(job.title)}</span>
          </div>
          <span className="chip">{pick(job.company)}</span>
          <h1 style={{ marginTop: ".6rem" }}>{pick(job.title)}</h1>
          <div className="job-card__meta" style={{ color: "#9FB0C7" }}>
            <span><MapPin /> {pick(job.location)}</span>
            <span><Clock /> {pick(job.type)}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container job-detail">
          <div className="prose reveal">
            {pick(job.description).map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            <h2>{c.requirements}</h2>
            <ul>
              {pick(job.requirements).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>

          <aside className="job-aside reveal">
            <dl>
              <div><dt>{c.detailCompany}</dt><dd>{pick(job.company)}</dd></div>
              <div><dt>{c.detailLocation}</dt><dd>{pick(job.location)}</dd></div>
              <div><dt>{c.detailType}</dt><dd>{pick(job.type)}</dd></div>
              <div><dt>{c.detailPosted}</dt><dd>{postedLabel}</dd></div>
            </dl>
            <a className="btn btn--primary btn--block" href="#apply">{c.applyNow}</a>
          </aside>
        </div>
      </section>

      <section className="section section--alt" id="apply">
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="section-head reveal">
            <p className="eyebrow eyebrow--center">{c.applyEyebrow}</p>
            <h2>{c.applyTitle}</h2>
            <p className="lead">{c.applyLead}</p>
          </div>
          <div className="form-card reveal">
            <ApplicationForm dict={dict.form} jobSlug={job.slug} jobTitle={pick(job.title)} />
          </div>
        </div>
      </section>
    </>
  );
}
