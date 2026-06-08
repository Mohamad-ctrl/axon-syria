import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Cairo } from "next/font/google";
import { notFound } from "next/navigation";
import "../../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollFx from "@/components/ScrollFx";
import { getDictionary } from "@/i18n/dictionaries";
import { locales, isLocale, dir } from "@/i18n/config";
import { SITE_URL } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});
const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const loc = isLocale(lang) ? lang : "en";
  const dict = getDictionary(loc);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: dict.meta.title, template: "%s | Axon Syria" },
    description: dict.meta.description,
    alternates: {
      canonical: `/${loc}`,
      languages: { en: "/en", ar: "/ar", "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      siteName: "Axon Syria",
      title: dict.meta.title,
      description: dict.meta.description,
      url: `${SITE_URL}/${loc}`,
      locale: loc === "ar" ? "ar_SY" : "en_GB",
      alternateLocale: loc === "ar" ? "en_GB" : "ar_SY",
      images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: "Axon Syria" }],
    },
    twitter: { card: "summary" },
    icons: { icon: "/favicon.svg" },
    verification: { google: "cK_3SUf6_35b75IDjZq37BitrT8v80GSGIHhXa8nJe8" },
  };
}

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Axon Syria",
  url: `${SITE_URL}/en`,
  logo: `${SITE_URL}/favicon.svg`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Al Shaikh Najar, Second Industrial Area",
    addressLocality: "Aleppo",
    addressCountry: "SY",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+963214731300",
    email: "info@axon-sy.com",
    contactType: "customer service",
    areaServed: "SY",
    availableLanguage: ["en", "ar"],
  },
  // Axon Syria is an independent group SUPPORTED by Axon Group UAE — it is
  // deliberately modelled as `sponsor`, NOT `parentOrganization`.
  sponsor: {
    "@type": "Organization",
    name: "Axon Group",
    url: "https://axongroup.ae/",
  },
  subOrganization: [
    { "@type": "Organization", name: "Axon Contracting", url: `${SITE_URL}/en/companies/axon-contracting` },
    { "@type": "Organization", name: "Axon for Industry & Trade", url: `${SITE_URL}/en/companies/axon-industry-trade` },
    { "@type": "Organization", name: "Axon Integrated Facilities Services", url: `${SITE_URL}/en/companies/axon-integrated-facilities` },
    { "@type": "Organization", name: "Axon Landscape", url: `${SITE_URL}/en/companies/axon-landscape` },
    { "@type": "Organization", name: "Imdad", url: `${SITE_URL}/en/companies/imdad`, sameAs: ["https://imdadgroup.com/"] },
  ],
};

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const fontVars =
    lang === "ar"
      ? `${inter.variable} ${jakarta.variable} ${cairo.variable}`
      : `${inter.variable} ${jakarta.variable}`;

  return (
    <html lang={lang} dir={dir(lang)} className={fontVars}>
      <body>
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a className="skip-link" href="#main">{dict.nav.skip}</a>
        <Header lang={lang} dict={dict.nav} />
        <main id="main">{children}</main>
        <Footer lang={lang} dict={dict.footer} />
        <ScrollFx />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </body>
    </html>
  );
}
