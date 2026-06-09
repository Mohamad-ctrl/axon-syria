import type { Bilingual } from "@/data/company-profiles";

/**
 * Projects delivered by the group. These are shown in one section on the home
 * page (see `featuredProjects` + the `Projects` component), not under any single
 * company. Photos live in /public/images/projects/ and were taken from the group
 * capability statement (2026).
 *
 * `companyProjects` (per-company, keyed by slug) is kept for the company detail
 * pages but is intentionally empty — those sections auto-hide when empty.
 */
export type ProjectKind =
  | "contracting"
  | "industry"
  | "facilities"
  | "landscape"
  | "metal";

export const PROJECT_CAT: Record<ProjectKind, Bilingual> = {
  contracting: { en: "Contracting", ar: "المقاولات", tr: "Müteahhitlik" },
  industry: { en: "Industry & Trade", ar: "الصناعة والتجارة", tr: "Sanayi ve Ticaret" },
  facilities: { en: "Facilities Services", ar: "خدمات المرافق", tr: "Tesis Hizmetleri" },
  landscape: { en: "Landscaping", ar: "تنسيق المواقع", tr: "Peyzaj Düzenleme" },
  metal: { en: "Metal Construction", ar: "الإنشاءات المعدنية", tr: "Metal İnşaat" },
};

export type Project = { kind: ProjectKind; en: string; ar: string; tr: string; img: string };

/** Group projects shown on the home page. */
export const featuredProjects: Project[] = [
  {
    kind: "contracting",
    en: "Steel Hangar, Sheikh Najjar Industrial City",
    ar: "هنكار معدني في الشيخ نجار",
    tr: "Çelik Hangar, Sheikh Najjar Sanayi Şehri",
    img: "/images/projects/axon-contracting-hangar-sheikh-najjar.jpg",
  },
  {
    kind: "contracting",
    en: "Concrete Building, Sheikh Najjar Industrial City",
    ar: "مبنى خرساني في الشيخ نجار",
    tr: "Betonarme Bina, Sheikh Najjar Sanayi Şehri",
    img: "/images/projects/axon-contracting-concrete-sheikh-najjar.jpg",
  },
  {
    kind: "contracting",
    en: "Steel Hangar, First Zone, Sheikh Najjar",
    ar: "هنكار معدني في المنطقة الأولى، الشيخ نجار",
    tr: "Çelik Hangar, Birinci Bölge, Sheikh Najjar",
    img: "/images/projects/axon-contracting-hangar-first-zone.jpg",
  },
  {
    kind: "contracting",
    en: "French School Renovation, Aleppo",
    ar: "تجديد وتشطيب المدرسة الفرنسية في حلب",
    tr: "Fransız Okulu Yenilemesi, Halep",
    img: "/images/projects/axon-contracting-french-school.jpg",
  },
  {
    kind: "contracting",
    en: "Villa Restoration, Aleppo Countryside",
    ar: "ترميم فيلا في ريف حلب",
    tr: "Villa Restorasyonu, Halep Kırsalı",
    img: "/images/projects/axon-contracting-villa-aleppo.jpg",
  },
  {
    kind: "contracting",
    en: "Residential Buildings, Bustan al-Basha",
    ar: "مباني سكنية في بستان الباشا",
    tr: "Konut Binaları, Bustan al-Basha",
    img: "/images/projects/axon-contracting-residential-bustan-basha.jpg",
  },
];

export const companyProjects: Record<string, Project[]> = {
  // Group projects live on the home page (featuredProjects); per-company
  // sections stay empty and auto-hide until a company has its own entries.
};
