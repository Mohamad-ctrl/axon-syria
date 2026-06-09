import type { Bilingual } from "@/data/company-profiles";

/**
 * Certificates shown on each company's detail page. Companies missing from
 * the map simply don't render the section.
 *
 * Imdad holds ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 (per
 * imdadgroup.com) — add the scanned documents to
 * /public/images/certificates/imdad/<kind>.jpg and list them below to surface
 * them on the page. The newly registered companies will gain commercial
 * registrations and certifications as they are issued.
 */
export type CertKind =
  | "commercial-registration"
  | "iso-9001"
  | "iso-14001"
  | "iso-45001";

export const CERT_META: Record<CertKind, { label: Bilingual; note: Bilingual }> = {
  "commercial-registration": {
    label: { en: "Commercial Registration", ar: "السجل التجاري", tr: "Ticaret Sicili" },
    note: { en: "Syrian commercial registry", ar: "السجل التجاري السوري", tr: "Suriye ticaret sicili" },
  },
  "iso-9001": {
    label: { en: "ISO 9001", ar: "ISO 9001", tr: "ISO 9001" },
    note: { en: "Quality Management", ar: "إدارة الجودة", tr: "Kalite Yönetimi" },
  },
  "iso-14001": {
    label: { en: "ISO 14001", ar: "ISO 14001", tr: "ISO 14001" },
    note: { en: "Environmental Management", ar: "الإدارة البيئية", tr: "Çevre Yönetimi" },
  },
  "iso-45001": {
    label: { en: "ISO 45001", ar: "ISO 45001", tr: "ISO 45001" },
    note: { en: "Occupational Health & Safety", ar: "الصحة والسلامة المهنية", tr: "İş Sağlığı ve Güvenliği" },
  },
};

export type CompanyCert = { kind: CertKind; src: string };

export const companyCertificates: Record<string, CompanyCert[]> = {
  // No scanned certificates yet — sections auto-hide until files are added.
};
