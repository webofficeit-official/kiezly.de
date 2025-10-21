'use client';

import React, { createContext, useContext, useEffect, useState } from "react";
import ClientLayout from "./client-layout/client-layout";
import { Toaster } from "react-hot-toast";

export const TranslationContext = createContext({
  locale: "en",
  messages: {} as Record<string, any>,
});

export function useT(fileName?: string) {
  const context = useContext(TranslationContext);
  if (!context) throw new Error("useT must be used within TranslationProvider");

  return (key: string, vars: Record<string, string | number> = {}) => {
    let value: any = context.messages;

    // Scope to specific file
    if (fileName) {
      value = value?.[fileName];
    }

    const keys = key.split(".");
    for (const k of keys) value = value?.[k];

    if (!value) return key;

    // Replace placeholders like {name}
    return value.replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? `{${v}}`);
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

  // List of JSON files to load for each locale
  const files = ["header", "footer", "home"]; // add more as needed

  useEffect(() => {
    async function loadMessages() {
      const merged: Record<string, any> = {};

      for (const file of files) {
        try {
          const mod = await import(`../../locales/${locale}/${file}.json`);
          merged[file] = mod.default;
        } catch {
          console.warn(
            `Translation file not found: ${locale}/${file}.json. Falling back to English.`
          );
          const fallback = await import(`../../locales/en/${file}.json`);
          merged[file] = fallback.default;
        }
      }

      setMessages(merged);
    }

    loadMessages();
  }, [locale]);

  if (Object.keys(messages).length === 0) return <></>;


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
