"use client";

import { useState } from "react";
import LogoutButton from "./LogoutButton";

type Link = { href: string; label: string };

/**
 * The admin topbar's right side: the section links plus the signed-in user and
 * logout. On desktop it's an inline row; on phones it collapses behind a
 * hamburger (the links + user info drop down full-width below the bar). Plain
 * <a> links trigger a full navigation, which remounts this and closes the menu.
 */
export default function AdminBar({
  links,
  username,
  isAdmin,
  isCeo,
}: {
  links: Link[];
  username: string;
  isAdmin: boolean;
  isCeo: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav id="admin-menu" className={`admin-nav${open ? " is-open" : ""}`}>
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <div className="admin-nav__user">
          <span
            className="admin-whoami"
            title={isCeo ? "CEO" : isAdmin ? "Administrator" : "Limited access"}
          >
            {username}
            {isAdmin && <span className="admin-badge">admin</span>}
            {isCeo && <span className="admin-badge">ceo</span>}
          </span>
          <LogoutButton />
        </div>
      </nav>

      <button
        type="button"
        className="admin-burger"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="admin-menu"
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <>
              <path d="M3 6h18" strokeLinecap="round" />
              <path d="M3 12h18" strokeLinecap="round" />
              <path d="M3 18h18" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>
    </>
  );
}
