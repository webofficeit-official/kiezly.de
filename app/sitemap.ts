import type { MetadataRoute } from "next";

const BASE = "https://kiezly.de";
const LOCALES = ["de", "en"] as const;

const STATIC_ROUTES = [
  { path: "",          priority: 1.0, changeFrequency: "daily"   as const },
  { path: "/jobs",     priority: 0.9, changeFrequency: "hourly"  as const },
  { path: "/how-it-works", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/signin",   priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/signup",   priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/impressum",priority: 0.2, changeFrequency: "yearly"  as const },
  { path: "/terms",    priority: 0.2, changeFrequency: "yearly"  as const },
  { path: "/datenschutz", priority: 0.2, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const { path, priority, changeFrequency } of STATIC_ROUTES) {
    const alternates: Record<string, string> = {};
    for (const locale of LOCALES) {
      alternates[locale] = `${BASE}/${locale}${path}`;
    }
    alternates["x-default"] = `${BASE}/de${path}`;

    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: { languages: alternates },
      });
    }
  }

  return entries;
}
