import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "../../globals.css";
import { isAuthenticated } from "@/lib/admin-auth";
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
  const authed = await isAuthenticated();
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <header className="admin-topbar">
          <div className="admin-topbar__inner">
            <a href="/admin" className="admin-brand">Axon <span>Admin</span></a>
            {authed && (
              <nav className="admin-nav">
                <a href="/admin">Applications</a>
                <a href="/admin/jobs">Jobs</a>
                <a href="/admin/content">Content</a>
              </nav>
            )}
            {authed && <LogoutButton />}
          </div>
        </header>
        <main className="admin-main">{children}</main>
      </body>
    </html>
  );
}
