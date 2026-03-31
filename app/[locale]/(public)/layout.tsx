import type { Metadata } from "next";
import React from "react";

const META = {
  de: {
    title: "Kiezly – Mini-Jobs & Helfer in deiner Nähe",
    description:
      "Kiezly verbindet Menschen mit geprüften Helfern in ihrer Nachbarschaft. Mini-Jobs für Babysitting, Umzug, Gartenarbeit, Putzen & mehr – schnell, sicher und lokal in Deutschland.",
    ogTitle: "Kiezly – Mini-Jobs & Helfer in deiner Nähe",
    ogDesc:
      "Finde geprüfte Helfer für Babysitting, Umzug, Gartenarbeit & mehr – oder biete selbst Mini-Jobs in deiner Nachbarschaft an.",
    ogLocale: "de_DE",
    url: "https://kiezly.de/de",
  },
  en: {
    title: "Kiezly – Mini-Jobs & Helpers Near You",
    description:
      "Kiezly connects people with verified helpers in their neighbourhood. Mini-jobs for babysitting, moving, gardening, cleaning & more – fast, safe and local across Germany.",
    ogTitle: "Kiezly – Mini-Jobs & Helpers Near You",
    ogDesc:
      "Find verified helpers for babysitting, moving, gardening & more – or post your own mini-jobs in your neighbourhood.",
    ogLocale: "en_US",
    url: "https://kiezly.de/en",
  },
};

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = params.locale === "en" ? "en" : "de";
  const m = META[locale];

  return {
    title: m.title,
    description: m.description,
    alternates: {
      canonical: m.url,
      languages: {
        "de": "https://kiezly.de/de",
        "en": "https://kiezly.de/en",
        "x-default": "https://kiezly.de/de",
      },
    },
    openGraph: {
      type: "website",
      url: m.url,
      siteName: "Kiezly",
      locale: m.ogLocale,
      alternateLocale: locale === "de" ? ["en_US"] : ["de_DE"],
      title: m.ogTitle,
      description: m.ogDesc,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: m.ogTitle,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@kiezly",
      creator: "@kiezly",
      title: m.ogTitle,
      description: m.ogDesc,
      images: ["/opengraph-image"],
    },
  };
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
