'use client';

import React, { createContext, useContext, useEffect, useState } from "react";
import ClientLayout from "./client-layout/client-layout";
import { Toaster } from "react-hot-toast";

export const TranslationContext = createContext({
  locale: "en",
  messages: {},
});

export function useT() {
  const context = useContext(TranslationContext);
  if (!context) throw new Error("useT must be used within TranslationProvider");

  return (key: string) => {
    const keys = key.split(".");
    let value: any = context.messages;
    for (const k of keys) value = value?.[k];
    return value ?? key;
  };
}

function CategoriesSeoJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Browse kiezly Categories",
    description: "Finde geprüfte Helfer für Babysitting, Umzug, Garten, Haustiere, Seniorenbetreuung, Besorgungen und Events in deiner Nähe.",
    url: "https://www.kiezly.de/jobs",
    isPartOf: {
      "@type": "WebSite",
      name: "Kiezly",
      url: "https://kiezly.de",
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

export default function LocaleLayout({ children, params }: any) {
  const { locale } = params;
  const [messages, setMessages] = useState<any>({});

  // Load JSON dynamically from /messages folder
  useEffect(() => {
    import(`../../locales/${locale}.json`)
      .then((mod) => setMessages(mod.default))
      .catch(() => {
        console.warn(`No translation found for locale: ${locale}, using English fallback.`);
        import(`../../locales/en.json`).then((mod) => setMessages(mod.default));
      });
  }, [locale]);

  if (Object.keys(messages).length === 0) {
    return <></>;
  }

  return (
    <TranslationContext.Provider value={{ locale, messages }}>
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
    </TranslationContext.Provider>
  );
}
