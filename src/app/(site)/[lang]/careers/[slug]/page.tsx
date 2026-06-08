import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getJobBySlug } from "@/lib/jobs";
import ApplicationForm from "@/components/careers/ApplicationForm";
import { MapPin, Clock } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const loc = isLocale(lang) ? lang : "en";
  const dict = getDictionary(loc);
  const job = await getJobBySlug(slug);
  if (!job) return { title: dict.careers.notFound };
  return {
    title: `${job.title[loc]} — ${job.company[loc]}`,
    description: job.description[loc]?.[0] ?? job.title[loc],
    alternates: { canonical: `/${loc}/careers/${job.slug}` },
  };
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const c = dict.careers;
  const job = await getJobBySlug(slug);
  if (!job || !job.active) notFound();

  const postedLabel = new Date(job.posted).toLocaleDateString(
    lang === "ar" ? "ar-AE" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div className="crumbs">
            <Link href={`/${lang}`}>{c.crumbHome}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${lang}/careers`}>{c.crumbCareers}</Link>
            <span aria-hidden="true">/</span>
            <span>{job.title[lang]}</span>
          </div>
          <span className="chip">{job.company[lang]}</span>
          <h1 style={{ marginTop: ".6rem" }}>{job.title[lang]}</h1>
          <div className="job-card__meta" style={{ color: "#9FB0C7" }}>
            <span><MapPin /> {job.location[lang]}</span>
            <span><Clock /> {job.type[lang]}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container job-detail">
          <div className="prose reveal">
            {job.description[lang].map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            <h2>{c.requirements}</h2>
            <ul>
              {job.requirements[lang].map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>

          <aside className="job-aside reveal">
            <dl>
              <div><dt>{c.detailCompany}</dt><dd>{job.company[lang]}</dd></div>
              <div><dt>{c.detailLocation}</dt><dd>{job.location[lang]}</dd></div>
              <div><dt>{c.detailType}</dt><dd>{job.type[lang]}</dd></div>
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
            <ApplicationForm dict={dict.form} jobSlug={job.slug} jobTitle={job.title[lang]} />
          </div>
        </div>
      </section>
    </>
  );
}
