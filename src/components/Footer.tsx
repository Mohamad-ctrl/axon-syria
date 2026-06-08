import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Linkedin,
  Instagram,
  Facebook,
  XTwitter,
} from "@/components/icons";
import BrandMark from "@/components/BrandMark";
import { companyMeta } from "@/data/companies";
import { companyProfiles } from "@/data/company-profiles";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Footer({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["footer"];
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <BrandMark variant="light" />
            <p>{dict.tagline}</p>
            <div className="footer__social">
              <a href="#" aria-label="LinkedIn"><Linkedin /></a>
              <a href="#" aria-label="Instagram"><Instagram /></a>
              <a href="#" aria-label="Facebook"><Facebook /></a>
              <a href="#" aria-label="X"><XTwitter /></a>
            </div>
          </div>

          <div className="footer__col">
            <h4>{dict.companiesTitle}</h4>
            <ul>
              {companyMeta.map((m) => {
                const profile = companyProfiles[m.slug];
                if (!profile) return null;
                return (
                  <li key={m.slug}>
                    <Link href={`/${lang}/companies/${m.slug}`}>
                      {lang === "ar" ? profile.name.ar : profile.name.en}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="footer__col">
            <h4>{dict.companyTitle}</h4>
            <ul>
              <li><Link href={`/${lang}#about`}>{dict.about}</Link></li>
              <li><Link href={`/${lang}#why`}>{dict.why}</Link></li>
              <li><Link href={`/${lang}/careers`}>{dict.careers}</Link></li>
              <li><Link href={`/${lang}#contact`}>{dict.contact}</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>{dict.getInTouch}</h4>
            <ul className="footer__contact">
              <li>
                <MapPin />
                <span>
                  {lang === "ar"
                    ? <>المدينة الصناعية الثانية، الشيخ نجار،<br />حلب، سوريا</>
                    : <>Al Shaikh Najar, Second Industrial Area,<br />Aleppo, Syria</>}
                </span>
              </li>
              <li>
                <Phone />
                <a href="tel:+963214731300">+963 21 473 1300</a>
              </li>
              <li>
                <Mail />
                <a href="mailto:info@axon-sy.com">info@axon-sy.com</a>
              </li>
              <li>
                <Clock />
                <span>{dict.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {year} Axon Syria. {dict.rights}</span>
          <span>{dict.location}</span>
        </div>
      </div>
    </footer>
  );
}
