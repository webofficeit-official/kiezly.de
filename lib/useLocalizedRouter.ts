"use client";

import { useRouter, usePathname } from "next/navigation";
import { useContext, useCallback } from "react";
import { TranslationContext } from "../app/[locale]/layout";

export function useLocalizedRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useContext(TranslationContext);

  const push = useCallback(
    (rawPath: string) => {
      if (!rawPath) return;

      // 1️ Handle external links
      if (
        /^https?:\/\//i.test(rawPath) ||
        rawPath.startsWith("mailto:") ||
        rawPath.startsWith("tel:")
      ) {
        window.location.href = rawPath;
        return;
      }

      // 2️ Handle hash-only links (same page)
      if (rawPath.startsWith("#")) {
        const id = rawPath.slice(1);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", rawPath);
        return;
      }

      // 3️ Normalize internal paths and preserve query/hash
      const url = new URL(rawPath, "http://x"); // dummy base
      const path = url.pathname.startsWith("/")
        ? url.pathname
        : "/" + url.pathname;
      const segs = path.split("/").filter(Boolean);

      const LOCALES = ["en", "de"] as const;
      if (!LOCALES.includes(segs[0] as any)) segs.unshift(locale);
      
      const nextPath = "/" + segs.join("/");
      const finalUrl = nextPath + url.search + url.hash;

      // 4️ Avoid reloading same page with different hash
      if (pathname === nextPath && url.hash) {
        router.replace(finalUrl, { scroll: true });
      } else {
        router.push(finalUrl, { scroll: true });
      }
    },
    [router, pathname, locale]
  );

  return { push };
}
