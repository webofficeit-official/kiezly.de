import ClientLayout from './client-layout/client-layout';
import './globals.css';
import { Toaster } from "react-hot-toast";
import * as React from "react";

export const metadata = {
  title: {
    default: "Browse Mini‑Job Categories | Mini‑Helfer",
    template: "%s | Mini‑Helfer",
  },
  description: "Find trusted local help for babysitting, cleaning, pet care, senior support, errands, gardening and events. Post a mini‑job for free and get applications in minutes.",
  keywords: ["mini jobs", "babysitting", "cleaning", "pet sitting", "senior support", "Braunschweig mini jobs", "Haushaltshilfe", "Nebenjob"],
  alternates: {
    canonical: "https://www.mini-helfer.de/categories",
  },
  openGraph: {
    type: "website",
    url: "https://www.mini-helfer.de/categories",
    siteName: "Mini‑Helfer",
    title: "Browse Mini‑Job Categories",
    description: "Babysitting, cleaning, pet care, senior support and more — book local, verified helpers.",
    images: [
      {
        url: "https://via.placeholder.com/1200x630.png?text=Mini-Helfer+Categories",
        width: 1200,
        height: 630,
        alt: "Mini‑Helfer categories overview (dummy image)",
      },
    ],
    locale: "de_DE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Mini‑Job Categories | Mini‑Helfer",
    description: "Babysitting, cleaning, pet care, senior support and more — book local, verified helpers.",
    images: ["https://via.placeholder.com/1200x630.png?text=Mini-Helfer+Categories"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      maxImagePreview: "large",
      maxSnippet: -1,
      maxVideoPreview: -1,
    },
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
    <script type= "application/ld+json" dangerouslySetInnerHTML = {{ __html: JSON.stringify(jsonLd) }} suppressHydrationWarning />
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
