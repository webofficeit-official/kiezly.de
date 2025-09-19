import ClientLayout from './client-layout/client-layout';
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
  themeColor: "#0ea5e9",
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

function CategoriesSeoJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Browse Mini‑Job Categories",
    description: "Find trusted local help for everyday mini‑jobs: babysitting, cleaning, pet care, senior support, errands, gardening and events.",
    url: "https://www.mini-helfer.de/categories",
    isPartOf: {
      "@type": "WebSite",
      name: "Mini‑Helfer",
      url: "https://www.mini-helfer.de",
    },
    about: [
      { "@type": "Thing", name: "Childcare" },
      { "@type": "Thing", name: "Cleaning" },
      { "@type": "Thing", name: "Pet care" },
      { "@type": "Thing", name: "Senior support" },
      { "@type": "Thing", name: "Errands" },
      { "@type": "Thing", name: "Garden" },
      { "@type": "Thing", name: "Events" },
    ],

  } as const;

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} suppressHydrationWarning />
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">

      <body className='min-h-screen bg-gradient-to-b from-neutral-50 to-white text-neutral-900 w-full'>
        <ClientLayout>
          <CategoriesSeoJsonLd />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: "rounded-xl shadow-md",
              success: {
                style: {
                  background: "#10B981",
                  color: "white",
                },
              },
              error: {
                style: {
                  background: "#EF4444",
                  color: "white",
                },
              },
            }}
          />
        </ClientLayout>
      </body>

    </html>
  )
}
