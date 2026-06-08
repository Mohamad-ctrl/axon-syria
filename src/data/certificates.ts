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

export const CERT_META: Record<CertKind, { en: string; ar: string; noteEn: string; noteAr: string }> = {
  "commercial-registration": { en: "Commercial Registration", ar: "السجل التجاري", noteEn: "Syrian commercial registry", noteAr: "السجل التجاري السوري" },
  "iso-9001": { en: "ISO 9001", ar: "ISO 9001", noteEn: "Quality Management", noteAr: "إدارة الجودة" },
  "iso-14001": { en: "ISO 14001", ar: "ISO 14001", noteEn: "Environmental Management", noteAr: "الإدارة البيئية" },
  "iso-45001": { en: "ISO 45001", ar: "ISO 45001", noteEn: "Occupational Health & Safety", noteAr: "الصحة والسلامة المهنية" },
};

export type CompanyCert = { kind: CertKind; src: string };

export const companyCertificates: Record<string, CompanyCert[]> = {
  // No scanned certificates yet — sections auto-hide until files are added.
};
