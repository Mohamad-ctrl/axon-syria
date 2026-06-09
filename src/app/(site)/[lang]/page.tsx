import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import About from "@/components/About";
import Companies from "@/components/Companies";
import Projects from "@/components/Projects";
import WhyAxon from "@/components/WhyAxon";
import UaeSupport from "@/components/UaeSupport";
import CTA from "@/components/CTA";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <Hero lang={lang} dict={dict.hero} />
      <Stats dict={dict.stats} />
      <About lang={lang} dict={dict.about} />
      <Companies lang={lang} dict={dict.companies} />
      <Projects lang={lang} dict={dict.projects} />
      <WhyAxon dict={dict.why} />
      <UaeSupport lang={lang} dict={dict.uae} />
      <CTA dict={dict.cta} />
    </>
  );
}
