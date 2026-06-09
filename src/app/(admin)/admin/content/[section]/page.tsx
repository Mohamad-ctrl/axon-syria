import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/admin-auth";
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
import ContentEditor from "../ContentEditor";

export const dynamic = "force-dynamic";

export default async function ContentSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");

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
    value = profileToLogical(await getCompanyProfile(section.store.slug));
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
