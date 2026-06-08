import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const ArrowRight = (p: P) => (
  // .icon-arrow: directional — mirrored horizontally in RTL via globals.css
  <svg className="icon-arrow" viewBox="0 0 24 24" {...stroke} strokeWidth={2.2} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const Phone = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const Mail = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);

export const MapPin = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...p}>
    <path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const Check = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={2.2} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const Integrated = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...p}>
    <path d="M3 7h18M3 12h18M3 17h18" />
  </svg>
);

export const Shield = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...p}>
    <path d="M12 2 4 6v6c0 5 3.4 7.7 8 10 4.6-2.3 8-5 8-10V6z" />
  </svg>
);

export const Users = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" />
  </svg>
);

export const Menu = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...p}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

export const Close = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const Briefcase = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...p}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);

export const Clock = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const Sparkle = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
);

export const Growth = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...p}>
    <path d="M3 17l6-6 4 4 7-7" />
    <path d="M17 7h4v4" />
  </svg>
);

export const Search = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

/* Social (filled) */
export const Linkedin = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.34 17V10.2H6.1V17zM7.22 9.16a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6zM18 17v-3.73c0-2-1.07-2.93-2.5-2.93a2.16 2.16 0 0 0-1.96 1.08V10.2H11.3V17h2.24v-3.42c0-.9.17-1.78 1.29-1.78s1.13 1.03 1.13 1.84V17z" />
  </svg>
);

export const Instagram = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...p}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const Facebook = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M14 9h3V6h-3c-2 0-3.5 1.5-3.5 3.5V12H8v3h2.5v6h3v-6H16l.5-3h-3V9.8c0-.5.3-.8.8-.8z" />
  </svg>
);

export const XTwitter = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M18.2 3h3.3l-7.2 8.2L23 21h-6.6l-5.2-6.8L5.3 21H2l7.7-8.8L1.7 3h6.8l4.7 6.2zm-1.2 16h1.8L7.1 4.9H5.2z" />
  </svg>
);
