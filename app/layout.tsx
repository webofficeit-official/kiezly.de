import './globals.css';
import * as React from "react";

export const metadata = {
  metadataBase: new URL("https://kiezly.de"),

  title: {
    default: "Kiezly – Mini-Jobs & Helfer in deiner Nähe",
    template: "%s | Kiezly",
  },

  applicationName: "Kiezly",
  authors: [{ name: "Kiezly", url: "https://kiezly.de" }],
  creator: "Kiezly",
  publisher: "Kiezly",
  referrer: "origin-when-cross-origin",

  keywords: [
    "Mini-Jobs Deutschland", "Helfer finden Nachbarschaft", "Babysitter gesucht",
    "Umzugshilfe", "Haushaltshilfe", "Gartenarbeit", "Putzhilfe", "Einkaufshilfe",
    "Kinderbetreuung", "Seniorenbetreuung", "Handwerker", "Nachhilfe", "Minijob",
    "Braunschweig", "Kiezly", "lokale Jobs", "geprüfte Helfer",
  ],

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

  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/icons/icon-32.png",
  },

  manifest: "/manifest.webmanifest",

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
