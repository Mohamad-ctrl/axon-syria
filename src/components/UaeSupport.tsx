import Image from "next/image";
import { ArrowRight } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

const UAE_SITE = "https://axongroup.ae";

type UaeCompany = {
  slug: string;
  en: string;
  ar: string;
  tr: string;
  /** Logo file in /public/images/uae-companies. */
  logo: string;
  w: number;
  h: number;
  /** Logo artwork is light/white → show it on a dark plate so it stays visible. */
  dark?: boolean;
  /** Square/compact logo that needs extra height to look the right size. */
  big?: boolean;
};

/** The seven Axon Group UAE companies that support the Syrian group. */
const uaeCompanies: UaeCompany[] = [
  { slug: "green-dream", en: "Green Dream Agricultural", ar: "الحلم الأخضر للزراعة", tr: "Green Dream Tarım", logo: "/images/uae-companies/green-dream-mark.png", w: 750, h: 440, big: true },
  { slug: "axon-facility-management", en: "Axon Facility Management", ar: "أكسون لإدارة المرافق", tr: "Axon Facility Management", logo: "/images/uae-companies/axon-facility-management-logo.png", w: 3444, h: 955 },
  { slug: "axon-pools", en: "Axon Swimming Pools", ar: "أكسون لحمامات السباحة", tr: "Axon Yüzme Havuzları", logo: "/images/uae-companies/axon-pools-logo.png", w: 935, h: 430 },
  { slug: "axon-garments", en: "Axon Garments", ar: "أكسون للأزياء", tr: "Axon Garments", logo: "/images/uae-companies/axon-garments-logo.png", w: 1000, h: 400 },
  { slug: "lsf-contracting", en: "LSF Contracting", ar: "إل إس إف للمقاولات", tr: "LSF Contracting", logo: "/images/uae-companies/lsf-contracting-logo.png", w: 1068, h: 645 },
  { slug: "axon-waste-management", en: "Axon Waste Management", ar: "أكسون لإدارة النفايات", tr: "Axon Waste Management", logo: "/images/uae-companies/axon-waste-management-logo.png", w: 5001, h: 1668 },
  { slug: "axon-amenities", en: "Axon Amenities", ar: "أكسون أمينيتيز", tr: "Axon Amenities", logo: "/images/uae-companies/axon-amenities-logo.png", w: 4000, h: 749 },
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
          <ul className="uae-logos">
            {uaeCompanies.map((c) => {
              const name = c[lang];
              return (
                <li key={c.slug} className="uae-logo">
                  <div className={`uae-logo__plate${c.dark ? " uae-logo__plate--dark" : ""}`}>
                    <Image
                      className={`uae-logo__img${c.big ? " uae-logo__img--big" : ""}`}
                      src={c.logo}
                      alt={name}
                      width={c.w}
                      height={c.h}
                    />
                  </div>
                  <span className="uae-logo__name">{name}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
