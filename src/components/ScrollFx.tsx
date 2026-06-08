"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Global scroll effects:
 *  - reveals elements with `.reveal` as they enter the viewport
 *  - animates `[data-count]` numbers when they first appear
 * Re-runs on route change so client-side navigations animate too.
 */
export default function ScrollFx() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const counters = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));

    let revealIO: IntersectionObserver | null = null;
    let countIO: IntersectionObserver | null = null;

    if (reduce || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("is-visible"));
      counters.forEach((el) => {
        el.textContent = (el.dataset.count ?? "") + (el.dataset.suffix ?? "");
      });
      return;
    }

    revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealIO?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => {
      if (!el.classList.contains("is-visible")) revealIO!.observe(el);
    });

    const animate = (el: HTMLElement) => {
      const target = parseFloat(el.dataset.count ?? "0");
      const suffix = el.dataset.suffix ?? "";
      const duration = 1400;
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    countIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target as HTMLElement);
            countIO?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => countIO!.observe(el));

    return () => {
      revealIO?.disconnect();
      countIO?.disconnect();
    };
  }, [pathname]);

  return null;
}
