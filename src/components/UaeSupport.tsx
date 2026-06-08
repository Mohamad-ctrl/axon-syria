import { ArrowRight } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

const UAE_SITE = "https://axongroup.ae";

/** The seven Axon Group UAE companies that back the Syrian group. */
const uaeCompanies = [
  { slug: "green-dream", en: "Green Dream Agricultural", ar: "الحلم الأخضر للزراعة" },
  { slug: "axon-facility-management", en: "Axon Facility Management", ar: "أكسون لإدارة المرافق" },
  { slug: "axon-pools", en: "Axon Swimming Pools", ar: "أكسون لحمامات السباحة" },
  { slug: "axon-garments", en: "Axon Garments", ar: "أكسون للأزياء" },
  { slug: "lsf-contracting", en: "LSF Contracting", ar: "إل إس إف للمقاولات" },
  { slug: "axon-waste-management", en: "Axon Waste Management", ar: "أكسون لإدارة النفايات" },
  { slug: "axon-amenities", en: "Axon Amenities", ar: "أكسون أمينيتيز" },
];

export default function UaeSupport({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["uae"];
}) {
  return (
    <section className="section section--alt" id="uae">
      <div className="container uae">
        <div className="uae__body reveal">
          <p className="eyebrow">{dict.eyebrow}</p>
          <h2>{dict.title}</h2>
          <p className="uae__text">{dict.text}</p>
          <a
            className="btn btn--dark"
            href={`${UAE_SITE}/${lang}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: "1.8rem" }}
          >
            {dict.cta} <ArrowRight />
          </a>
        </div>
        <div className="uae-panel reveal">
          <h3 className="uae-panel__title">{dict.panelTitle}</h3>
          <div className="uae-chips">
            {uaeCompanies.map((c) => (
              <a
                key={c.slug}
                className="uae-chip"
                href={`${UAE_SITE}/${lang}/companies/${c.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {lang === "ar" ? c.ar : c.en}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
