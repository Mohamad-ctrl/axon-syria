/**
 * Pure, client-safe constants for the approval-requests pilot (no server
 * imports, mirroring lib/stages.ts and lib/permissions.ts). The company list
 * is specific to this feature: it spans the UAE and Syrian groups and is
 * deliberately independent from src/data/companies.ts (the public site's five
 * Syrian companies).
 */

export type ApprovalCompany = { slug: string; name: string; country: "UAE" | "Syria" };

export const APPROVAL_COMPANIES: ApprovalCompany[] = [
  { slug: "green-dream-agricultural", name: "Green Dream Agricultural", country: "UAE" },
  { slug: "axon-group", name: "Axon Group", country: "UAE" },
  { slug: "axon-waste-management", name: "Axon Waste Management", country: "UAE" },
  { slug: "axon-amenities", name: "Axon Amenities", country: "UAE" },
  { slug: "axon-garments", name: "Axon Garments", country: "UAE" },
  { slug: "axon-swimming-pools", name: "Axon Swimming Pools", country: "UAE" },
  { slug: "axon-facility-management", name: "Axon Facility Management", country: "UAE" },
  { slug: "lsf-contracting", name: "LSF Contracting", country: "UAE" },
  { slug: "axon-contracting", name: "Axon Contracting", country: "Syria" },
  { slug: "axon-industry-trade", name: "Axon for Industry & Trade", country: "Syria" },
  { slug: "axon-integrated-facilities", name: "Axon Integrated Facilities Services", country: "Syria" },
  { slug: "axon-landscape", name: "Axon Landscape", country: "Syria" },
  { slug: "imdad", name: "Imdad", country: "Syria" },
];

export function companyBySlug(slug: string): ApprovalCompany | undefined {
  return APPROVAL_COMPANIES.find((c) => c.slug === slug);
}

/** The four document sections every company page is split into. */
export const APPROVAL_SECTIONS = ["quotations", "contracts", "letters", "others"] as const;
export type ApprovalSection = (typeof APPROVAL_SECTIONS)[number];

export const SECTION_LABEL: Record<ApprovalSection, string> = {
  quotations: "Quotations",
  contracts: "Contracts",
  letters: "Letters",
  others: "Others",
};

export function isApprovalSection(value: string): value is ApprovalSection {
  return (APPROVAL_SECTIONS as readonly string[]).includes(value);
}

export const APPROVAL_STATUSES = ["active", "hold", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const STATUS_LABEL: Record<ApprovalStatus, string> = {
  active: "Active",
  hold: "On Hold",
  approved: "Approved",
  rejected: "Rejected",
};

export function isApprovalStatus(value: string): value is ApprovalStatus {
  return (APPROVAL_STATUSES as readonly string[]).includes(value);
}

export const EVENT_KINDS = ["created", "version_uploaded", "approved", "rejected", "hold"] as const;
export type ApprovalEventKind = (typeof EVENT_KINDS)[number];

export const EVENT_LABEL: Record<ApprovalEventKind, string> = {
  created: "Request created",
  version_uploaded: "Updated document uploaded",
  approved: "Approved",
  rejected: "Rejected",
  hold: "Put on hold",
};
