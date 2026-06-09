import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary, getCompanyProfiles, getFeaturedProjects } from "@/lib/content";
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
  const [dict, profiles, projects] = await Promise.all([
    getDictionary(lang),
    getCompanyProfiles(),
    getFeaturedProjects(),
  ]);

  return (
    <>
      <Hero lang={lang} dict={dict.hero} />
      <Stats dict={dict.stats} />
      <About lang={lang} dict={dict.about} profiles={profiles} />
      <Companies lang={lang} dict={dict.companies} profiles={profiles} />
      <Projects lang={lang} dict={dict.projects} projects={projects} />
      <WhyAxon dict={dict.why} />
      <UaeSupport lang={lang} dict={dict.uae} />
      <CTA dict={dict.cta} />
    </>
  );
}
