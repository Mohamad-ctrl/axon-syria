import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowRight } from "@/components/icons";
import { companyMeta } from "@/data/companies";
import { companyProfiles } from "@/data/company-profiles";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Companies({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["companies"];
}) {
  return (
    <section className="section section--alt" id="companies">
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow eyebrow--center">{dict.eyebrow}</p>
          <h2>{dict.title}</h2>
          <p className="lead">{dict.lead}</p>
        </div>

        <div className="grid grid-3">
          {dict.cards.map((card, i) => {
            const meta = companyMeta[i];
            const profile = companyProfiles[meta.slug];
            const accentStyle = profile
              ? ({ "--accent": profile.accent } as CSSProperties)
              : undefined;
            return (
              <article className="card company-card reveal" key={card.name}>
                <Link
                  className="company-card__media company-card__media--logo"
                  href={`/${lang}/companies/${meta.slug}`}
                  aria-label={card.name}
                  style={accentStyle}
                >
                  {profile?.logo ? (
                    <Image
                      className="company-card__logoImg"
                      src={profile.logo}
                      alt={card.alt}
                      width={profile.logoW ?? 180}
                      height={profile.logoH ?? 100}
                    />
                  ) : (
                    <div className="company-card__ph" aria-hidden="true">
                      <span className="company-card__ph-name">{card.name}</span>
                    </div>
                  )}
                </Link>
                <div className="company-card__body" style={accentStyle}>
                  <span className="company-card__tag">{card.tag}</span>
                  <h3>
                    <Link className="company-card__title" href={`/${lang}/companies/${meta.slug}`}>
                      {card.name}
                    </Link>
                  </h3>
                  <p>{card.desc}</p>
                  <div className="company-card__links">
                    <Link
                      className="company-card__link"
                      href={`/${lang}/companies/${meta.slug}`}
                    >
                      {dict.learnMore} <ArrowRight />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
