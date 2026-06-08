/**
 * Projects shown on each company's detail page. The Syrian companies are
 * newly established and have no published projects yet, so this map is empty —
 * the detail pages automatically omit the section when a company has no
 * entries. As projects are delivered (or Imdad's existing portfolio is
 * photographed), add images to /public/images/projects/ and list them here.
 */
export type ProjectKind =
  | "contracting"
  | "industry"
  | "facilities"
  | "landscape"
  | "metal";

export const PROJECT_CAT: Record<ProjectKind, { en: string; ar: string }> = {
  contracting: { en: "Contracting", ar: "المقاولات" },
  industry: { en: "Industry & Trade", ar: "الصناعة والتجارة" },
  facilities: { en: "Facilities Services", ar: "خدمات المرافق" },
  landscape: { en: "Landscaping", ar: "تنسيق المواقع" },
  metal: { en: "Metal Construction", ar: "الإنشاءات المعدنية" },
};

export type Project = { kind: ProjectKind; en: string; ar: string; img: string };

export const companyProjects: Record<string, Project[]> = {
  // No published projects yet — sections auto-hide until entries are added.
};
