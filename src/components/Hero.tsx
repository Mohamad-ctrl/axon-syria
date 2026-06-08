import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Hero({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["hero"];
}) {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero__inner">
          <p className="eyebrow eyebrow--light">{dict.eyebrow}</p>
          <h1>{dict.title}</h1>
          <p className="hero__sub">{dict.subtitle}</p>
          <div className="hero__actions">
            <Link className="btn btn--primary btn--lg" href={`/${lang}#companies`}>
              {dict.ctaPrimary} <ArrowRight />
            </Link>
            <Link className="btn btn--light btn--lg" href={`/${lang}#contact`}>
              {dict.ctaSecondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
