import './globals.css';
import * as React from "react";

export const metadata = {
  metadataBase: new URL("https://kiezly.de"),

  title: {
    default: "Kiezly – Mini-Jobs & Helfer in deiner Nähe",
    template: "%s | Kiezly",
  },

  description:
    "Kiezly verbindet Menschen mit geprüften Helfern in ihrer Nachbarschaft. Mini-Jobs für Babysitting, Umzug, Gartenarbeit, Putzen & mehr – schnell, sicher und lokal in Deutschland.",

  keywords: [
    "Mini-Jobs Deutschland",
    "Helfer finden Nachbarschaft",
    "Babysitter gesucht",
    "Umzugshilfe",
    "Haushaltshilfe",
    "Gartenarbeit",
    "Putzhilfe",
    "Einkaufshilfe",
    "Kinderbetreuung",
    "Seniorenbetreuung",
    "Handwerker",
    "Nachhilfe",
    "Minijob",
    "Braunschweig",
    "Kiezly",
    "lokale Jobs",
    "geprüfte Helfer",
  ],

  applicationName: "Kiezly",
  authors: [{ name: "Kiezly", url: "https://kiezly.de" }],
  creator: "Kiezly",
  publisher: "Kiezly",
  referrer: "origin-when-cross-origin",

  alternates: {
    canonical: "https://kiezly.de",
    languages: {
      "de": "https://kiezly.de/de",
      "en": "https://kiezly.de/en",
    },
  },

  openGraph: {
    type: "website",
    url: "https://kiezly.de/",
    siteName: "Kiezly",
    locale: "de_DE",
    alternateLocale: ["en_US"],
    title: "Kiezly – Mini-Jobs & Helfer in deiner Nähe",
    description:
      "Finde geprüfte Helfer für Babysitting, Umzug, Gartenarbeit & mehr – oder biete selbst Mini-Jobs in deiner Nachbarschaft an.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Kiezly – Mini-Jobs & Helfer in deiner Nachbarschaft",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@kiezly",
    creator: "@kiezly",
    title: "Kiezly – Mini-Jobs & Helfer in deiner Nähe",
    description:
      "Finde geprüfte Helfer für Babysitting, Umzug, Gartenarbeit & mehr – oder biete selbst Mini-Jobs an.",
    images: ["/opengraph-image"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  category: "marketplace",
} as const;

export const viewport = {
  themeColor: "#e8622a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-white text-[#111110] w-full">
        {children}
      </body>
    </html>
  );
}
