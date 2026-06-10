import { notFound } from "next/navigation";
import { requireSection } from "@/lib/admin-auth";
import {
  getSection,
  dictToLogical,
  profileToLogical,
  projectsToLogical,
  certsToLogical,
} from "@/lib/content-schema";
import {
  getDictionary,
  getCompanyProfile,
  getFeaturedProjects,
  getCompanyCertificates,
} from "@/lib/content";
import { companyMeta } from "@/data/companies";
import ContentEditor from "../ContentEditor";

export const dynamic = "force-dynamic";

export default async function ContentSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  await requireSection("content");

  const { section: id } = await params;
  const section = getSection(id);
  if (!section) notFound();

  // Load the section's effective value (defaults + overrides) as the editor's
  // logical shape (trilingual leaves become { en, ar, tr }).
  let value: unknown;
  if (section.store.kind === "dict") {
    const [en, ar, tr] = await Promise.all([getDictionary("en"), getDictionary("ar"), getDictionary("tr")]);
    const rk = section.store.rootKey as keyof typeof en;
    value = dictToLogical(section.shape, en[rk], ar[rk], tr[rk]);
  } else if (section.store.kind === "profile") {
    const slug = section.store.slug;
    const [profile, en, ar, tr] = await Promise.all([
      getCompanyProfile(slug),
      getDictionary("en"),
      getDictionary("ar"),
      getDictionary("tr"),
    ]);
    // Prefill the description field with the current default Overview text
    // (the dictionary card) when the profile has no `about` override yet.
    const idx = companyMeta.findIndex((m) => m.slug === slug);
    const fallbackAbout =
      idx >= 0
        ? {
            en: en.companies.cards[idx]?.about ?? "",
            ar: ar.companies.cards[idx]?.about ?? "",
            tr: tr.companies.cards[idx]?.about ?? "",
          }
        : undefined;
    value = profileToLogical(profile, fallbackAbout);
  } else if (section.store.kind === "projects") {
    value = projectsToLogical(await getFeaturedProjects());
  } else {
    value = certsToLogical(await getCompanyCertificates(section.store.slug));
  }

  return (
    <ContentEditor
      sectionId={section.id}
      label={section.label}
      description={section.description}
      shape={section.shape}
      value={value}
    />
  );
}
