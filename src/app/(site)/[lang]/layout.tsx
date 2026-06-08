import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Cairo } from "next/font/google";
import { notFound } from "next/navigation";
import "../../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollFx from "@/components/ScrollFx";
import { getDictionary } from "@/i18n/dictionaries";
import { locales, isLocale, dir } from "@/i18n/config";

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
    // NOTE: placeholder domain — update once the production domain is registered.
    metadataBase: new URL("https://axonsyria.com"),
    title: { default: dict.meta.title, template: "%s | Axon Syria" },
    description: dict.meta.description,
    alternates: {
      canonical: `/${loc}`,
      languages: { en: "/en", ar: "/ar" },
    },
    openGraph: {
      type: "website",
      siteName: "Axon Syria",
      title: dict.meta.title,
      description: dict.meta.description,
      url: `https://axonsyria.com/${loc}`,
      locale: loc === "ar" ? "ar_SY" : "en_US",
    },
    twitter: { card: "summary" },
    icons: { icon: "/favicon.svg" },
  };
}

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Axon Syria",
  url: "https://axonsyria.com/",
  logo: "https://axonsyria.com/favicon.svg",
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
    { "@type": "Organization", name: "Axon Contracting", url: "https://axonsyria.com/en/companies/axon-contracting" },
    { "@type": "Organization", name: "Axon for Industry & Trade", url: "https://axonsyria.com/en/companies/axon-industry-trade" },
    { "@type": "Organization", name: "Axon Integrated Facilities Services", url: "https://axonsyria.com/en/companies/axon-integrated-facilities" },
    { "@type": "Organization", name: "Axon Landscape", url: "https://axonsyria.com/en/companies/axon-landscape" },
    { "@type": "Organization", name: "Imdad", url: "https://imdadgroup.com/" },
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
