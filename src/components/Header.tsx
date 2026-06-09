"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone, Mail, Menu, Close } from "@/components/icons";
import BrandMark from "@/components/BrandMark";
import type { CompanyNav } from "@/data/company-profiles";
import { isLocale, type Locale } from "@/i18n/config";
import { telHref } from "@/lib/site";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Header({
  lang,
  dict,
  contact,
  companies,
}: {
  lang: Locale;
  dict: Dictionary["nav"];
  contact: Dictionary["contact"];
  companies: Record<string, CompanyNav>;
}) {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const pathname = usePathname();

  // On a company detail page (/[lang]/companies/[slug]) show that company's
  // mark beside the Axon logo, tinted with its accent.
  const parts = pathname.split("/");
  const companySlug = parts[2] === "companies" ? parts[3] : undefined;
  const company = companySlug ? companies[companySlug] : undefined;

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const swap = (target: Locale) => {
    const parts = pathname.split("/");
    if (isLocale(parts[1])) {
      parts[1] = target;
      return parts.join("/") || `/${target}`;
    }
    return `/${target}`;
  };

  const navLinks = [
    { href: `/${lang}#about`, label: dict.about },
    { href: `/${lang}#companies`, label: dict.companies },
    { href: `/${lang}#why`, label: dict.why },
    { href: `/${lang}/careers`, label: dict.careers },
    { href: `/${lang}#contact`, label: dict.contact },
  ];

  return (
    <>
      <div className="topbar">
        <div className="container topbar__inner">
          <div className="topbar__contact">
            <a href={`tel:${telHref(contact.phone)}`}><Phone /> {contact.phone}</a>
            <a href={`mailto:${contact.email}`}><Mail /> {contact.email}</a>
          </div>
          <nav className="lang-switch" aria-label={dict.language}>
            <Link href={swap("en")} aria-current={lang === "en" ? "true" : undefined}>EN</Link>
            <span aria-hidden="true">/</span>
            <Link href={swap("ar")} aria-current={lang === "ar" ? "true" : undefined}>ع</Link>
            <span aria-hidden="true">/</span>
            <Link href={swap("tr")} aria-current={lang === "tr" ? "true" : undefined}>TR</Link>
          </nav>
        </div>
      </div>

      <header className={`site-header${stuck ? " is-stuck" : ""}`}>
        <div className="container nav">
          <div className="nav__brand">
            <Link className="nav__logo" href={`/${lang}`} aria-label="Axon Syria">
              <BrandMark />
            </Link>
            {company && (
              <span className="nav__co" style={{ "--accent": company.accent } as CSSProperties}>
                <span className="nav__co-div" aria-hidden="true" />
                {company.logo ? (
                  <span className={`nav__co-logoWrap${company.logoOnDark ? " nav__co-plate" : ""}`}>
                    <Image
                      className="nav__co-logo"
                      src={company.logo}
                      alt={company.name[lang]}
                      width={company.logoW ?? 130}
                      height={company.logoH ?? 36}
                    />
                  </span>
                ) : (
                  <span className="nav__co-mark">{company.name[lang]}</span>
                )}
              </span>
            )}
          </div>

          <div
            className={`nav__backdrop${open ? " is-open" : ""}`}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <nav className={`nav__menu${open ? " is-open" : ""}`} aria-label="Primary">
            <button className="nav__close" onClick={() => setOpen(false)} aria-label={dict.closeMenu}>
              <Close />
            </button>
            {navLinks.map((l) => (
              <Link key={l.href} className="nav__link" href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="nav__lang" role="group" aria-label={dict.language}>
              <Link
                href={swap("en")}
                className="nav__lang-btn"
                aria-current={lang === "en" ? "true" : undefined}
                onClick={() => setOpen(false)}
              >
                English
              </Link>
              <Link
                href={swap("ar")}
                className="nav__lang-btn"
                aria-current={lang === "ar" ? "true" : undefined}
                onClick={() => setOpen(false)}
              >
                العربية
              </Link>
              <Link
                href={swap("tr")}
                className="nav__lang-btn"
                aria-current={lang === "tr" ? "true" : undefined}
                onClick={() => setOpen(false)}
              >
                Türkçe
              </Link>
            </div>
          </nav>

          <div className="nav__actions">
            <Link className="btn btn--primary" href={`/${lang}#contact`}>{dict.getInTouch}</Link>
            <button
              className="nav__toggle"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? dict.closeMenu : dict.openMenu}
              aria-expanded={open}
            >
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
