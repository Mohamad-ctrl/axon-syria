import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "../../globals.css";
import { getCurrentUser, can, landingPath } from "@/lib/admin-auth";
import LogoutButton from "./LogoutButton";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: "Axon Admin",
  robots: { index: false, follow: false },
  // Match the public site's favicon (the Axon Syria mark in /public/favicon.svg).
  icons: { icon: "/favicon.svg" },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  const links: { href: string; label: string }[] = [];
  if (user) {
    if (can(user, "applications")) links.push({ href: "/admin", label: "Applications" });
    if (can(user, "jobs")) links.push({ href: "/admin/jobs", label: "Jobs" });
    if (can(user, "content")) links.push({ href: "/admin/content", label: "Content" });
    if (can(user, "users")) links.push({ href: "/admin/users", label: "Users" });
    if (can(user, "log")) links.push({ href: "/admin/log", label: "Log" });
  }

  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <header className="admin-topbar">
          <div className="admin-topbar__inner">
            <a href={user ? landingPath(user) : "/admin"} className="admin-brand">
              Axon <span>Admin</span>
            </a>
            {user && (
              <nav className="admin-nav">
                {links.map((l) => (
                  <a key={l.href} href={l.href}>
                    {l.label}
                  </a>
                ))}
              </nav>
            )}
            {user && (
              <div className="admin-topbar__user">
                <span className="admin-whoami" title={user.isAdmin ? "Administrator" : "Limited access"}>
                  {user.username}
                  {user.isAdmin && <span className="admin-badge">admin</span>}
                </span>
                <LogoutButton />
              </div>
            )}
          </div>
        </header>
        <main className="admin-main">{children}</main>
      </body>
    </html>
  );
}
