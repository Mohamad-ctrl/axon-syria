import { Fragment } from "react";
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
import type { CompanyNav } from "@/data/company-profiles";
import type { Locale } from "@/i18n/config";
import { telHref } from "@/lib/site";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Footer({
  lang,
  dict,
  contact,
  companies,
}: {
  lang: Locale;
  dict: Dictionary["footer"];
  contact: Dictionary["contact"];
  companies: Record<string, CompanyNav>;
}) {
  const year = new Date().getFullYear();
  // Social links default to "#" (not configured); show only the ones with a real URL.
  const socials = [
    { href: contact.linkedin, label: "LinkedIn", Icon: Linkedin },
    { href: contact.instagram, label: "Instagram", Icon: Instagram },
    { href: contact.facebook, label: "Facebook", Icon: Facebook },
    { href: contact.x, label: "X", Icon: XTwitter },
  ].filter((s) => s.href && s.href !== "#");
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <BrandMark variant="light" />
            <p>{dict.tagline}</p>
            {socials.length > 0 && (
              <div className="footer__social">
                {socials.map(({ href, label, Icon }) => (
                  <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
                    <Icon />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="footer__col">
            <h4>{dict.companiesTitle}</h4>
            <ul>
              {companyMeta.map((m) => {
                const profile = companies[m.slug];
                if (!profile) return null;
                return (
                  <li key={m.slug}>
                    <Link href={`/${lang}/companies/${m.slug}`}>
                      {profile.name[lang]}
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
                  {contact.address.split("\n").map((line, i) => (
                    <Fragment key={i}>
                      {i > 0 && <br />}
                      {line}
                    </Fragment>
                  ))}
                </span>
              </li>
              <li>
                <Phone />
                <a href={`tel:${telHref(contact.phone)}`}>{contact.phone}</a>
              </li>
              <li>
                <Mail />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
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
