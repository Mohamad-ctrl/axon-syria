import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import JobsExplorer from "@/components/careers/JobsExplorer";
import { getActiveJobs } from "@/lib/jobs";
import { ArrowRight, Growth, Users, Shield, Sparkle } from "@/components/icons";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const loc = isLocale(lang) ? lang : "en";
  const dict = getDictionary(loc);
  return {
    title: dict.careers.metaTitle,
    description: dict.careers.metaDescription,
    alternates: {
      canonical: `/${loc}/careers`,
      languages: { en: "/en/careers", ar: "/ar/careers", "x-default": "/en/careers" },
    },
    openGraph: {
      type: "website",
      siteName: "Axon Syria",
      title: `${dict.careers.metaTitle} | Axon Syria`,
      description: dict.careers.metaDescription,
      url: `${SITE_URL}/${loc}/careers`,
      locale: loc === "ar" ? "ar_SY" : "en_GB",
      alternateLocale: loc === "ar" ? "en_GB" : "ar_SY",
      images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: "Axon Syria" }],
    },
  };
}

const valueIcons = [Growth, Users, Shield, Sparkle];

export default async function CareersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const c = dict.careers;
  const jobs = await getActiveJobs();

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div className="crumbs">
            <Link href={`/${lang}`}>{c.crumbHome}</Link>
            <span aria-hidden="true">/</span>
            <span>{c.crumbCareers}</span>
          </div>
          <p className="eyebrow eyebrow--light">{c.eyebrow}</p>
          <h1>{c.title}</h1>
          <p>{c.intro}</p>
          <div className="hero__actions">
            <a className="btn btn--primary btn--lg" href="#openings">
              {c.viewRoles} <ArrowRight />
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow eyebrow--center">{c.whyEyebrow}</p>
            <h2>{c.whyTitle}</h2>
          </div>
          <div className="grid grid-4">
            {c.values.map((v, i) => {
              const Icon = valueIcons[i] ?? Growth;
              return (
                <div className="value-card reveal" key={v.title}>
                  <div className="value-card__icon">
                    <Icon />
                  </div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section--alt" id="openings">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow eyebrow--center">{c.openEyebrow}</p>
            <h2>{c.openTitle}</h2>
            <p className="lead">{c.rolesCount.replace("{count}", String(jobs.length))}</p>
          </div>
          <JobsExplorer lang={lang} dict={c} jobs={jobs} />
        </div>
      </section>
    </>
  );
}
