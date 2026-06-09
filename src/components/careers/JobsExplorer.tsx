"use client";

import Link from "next/link";
import { MapPin, Clock, ArrowRight } from "@/components/icons";
import type { Job } from "@/lib/jobs";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export default function JobsExplorer({
  lang,
  dict,
  jobs,
}: {
  lang: Locale;
  dict: Dictionary["careers"];
  jobs: Job[];
}) {
  return (
    <div className="reveal">
      {jobs.length === 0 ? (
        <p className="jobs__empty">
          {dict.emptyPrefix}
          <a href="mailto:info@axon-sy.com">info@axon-sy.com</a>.
        </p>
      ) : (
        <div className="jobs__list">
          {jobs.map((job) => (
            <article className="job-card" key={job.slug}>
              <div>
                <span className="chip">{job.company[lang] ?? job.company.en}</span>
                <h3 style={{ marginTop: ".5rem" }}>{job.title[lang] ?? job.title.en}</h3>
                <div className="job-card__meta">
                  <span><MapPin /> {job.location[lang] ?? job.location.en}</span>
                  <span><Clock /> {job.type[lang] ?? job.type.en}</span>
                </div>
              </div>
              <div className="job-card__cta">
                <Link className="btn btn--primary" href={`/${lang}/careers/${job.slug}`}>
                  {dict.viewApply} <ArrowRight />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
