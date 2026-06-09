import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { Check } from "@/components/icons";
import { companyMeta } from "@/data/companies";
import { companyProfiles } from "@/data/company-profiles";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export default function About({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["about"];
}) {
  return (
    <section className="section" id="about">
      <div className="container about">
        <div className="about__media reveal">
          {/* No site photography yet — a mosaic of the five company marks
              stands in and doubles as a visual table of contents. */}
          <div className="about-logos" aria-label="The five Axon Syria companies">
            {companyMeta.map((m) => {
              const profile = companyProfiles[m.slug];
              if (!profile?.logo) return null;
              return (
                <Link
                  key={m.slug}
                  className="about-logos__tile"
                  href={`/${lang}/companies/${m.slug}`}
                  style={{ "--accent": profile.accent } as CSSProperties}
                  aria-label={profile.name[lang]}
                >
                  <Image
                    src={profile.logo}
                    alt={profile.name[lang]}
                    width={profile.logoW ?? 180}
                    height={profile.logoH ?? 100}
                  />
                </Link>
              );
            })}
          </div>
        </div>
        <div className="about__body reveal">
          <p className="eyebrow">{dict.eyebrow}</p>
          <h2>{dict.title}</h2>
          <p className="lead">{dict.lead}</p>
          <div className="about__points">
            {dict.points.map((p) => (
              <div className="about__point" key={p.t}>
                <Check />
                <p>
                  <b>{p.t}</b> {p.d}
                </p>
              </div>
            ))}
          </div>
          <Link className="btn btn--ghost" href={`/${lang}#contact`} style={{ marginTop: "2rem" }}>
            {dict.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
