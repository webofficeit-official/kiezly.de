import './globals.css';
import { Toaster } from "react-hot-toast";
import * as React from "react";

export const metadata = {
  metadataBase: new URL("https://kiezly.de"),
  title: {
    default: "Kiezly – Mini-Jobs & Helfer in deiner Nähe",
    template: "%s | Kiezly",
  },
  description:
    "Finde geprüfte Helfer für Babysitting, Umzug, Garten & mehr – oder biete selbst Mini-Jobs in deiner Nachbarschaft an. Schnell, sicher, lokal.",
  keywords: [
    "Mini-Jobs",
    "Babysitter",
    "Umzugshilfe",
    "Haushaltshilfe",
    "Nachbarschaft",
    "Helfer finden",
    "Kiez",
    "Braunschweig",
    "Deutschland",
  ],
  applicationName: "Kiezly",
  authors: [{ name: "Kiezly" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://kiezly.de/",
    siteName: "Kiezly",
    title: "Kiezly – Mini-Jobs & Helfer in deiner Nähe",
    description:
      "Finde geprüfte Helfer für Babysitting, Umzug, Garten & mehr – oder biete selbst Mini-Jobs an.",
    images: [
      {
        url: "/images/Kiezly_OG_1200 X 630.png", // place a 1200x630 image in /public/og/
        width: 1200,
        height: 630,
        alt: "Kiezly – Mini-Jobs & Helfer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kiezly – Mini-Jobs & Helfer in deiner Nähe",
    description:
      "Finde geprüfte Helfer für Babysitting, Umzug, Garten & mehr – oder biete selbst Mini-Jobs an.",
    images: ["/images/Kiezly_OG_1200 X 630.jpg"],
    creator: "@kiezly", // if you have one
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
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
  verification: {
    google: "YOUR_GOOGLE_SITE_VERIFICATION_CODE",
    yandex: "",
    other: { "ahrefs-site-verification": [""] },
  },
} as const;

export const viewport = {
  themeColor: "#dadcdcff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">

      <body className='min-h-screen bg-gradient-to-b from-neutral-50 to-white text-neutral-900 w-full'>
        {children}
      </body>

    </html>
  )
}
