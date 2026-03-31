"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import ClientLayout from "./client-layout/client-layout";
import { Toaster } from "react-hot-toast";
import { Loader } from "@/components/ui/loader";

export const TranslationContext = createContext({
  locale: "en",
  messages: {} as Record<string, any>,
});

export function useT(fileName?: string) {
  const context = useContext(TranslationContext);
  if (!context) throw new Error("useT must be used within TranslationProvider");

  return (key: string, vars: Record<string, any> = {}) => {
    const base = fileName ? context.messages[fileName] : context.messages;

    const keys = key.split(".");
    let value: any = base;
    for (const k of keys) value = value?.[k];

    if (value === undefined) return key;

    if (Array.isArray(value)) return value;

    if (typeof value === "object" && value !== null) return value;

    if (typeof value === "string") {
      return value.replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? `{${v}}`);
    }

    return value;
  };
}

function SiteJsonLd() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Kiezly",
      url: "https://kiezly.de",
      description:
        "Kiezly verbindet Menschen mit geprüften Helfern in ihrer Nachbarschaft. Mini-Jobs für Babysitting, Umzug, Gartenarbeit, Putzen & mehr.",
      inLanguage: ["de-DE", "en-US"],
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://kiezly.de/de/jobs?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Kiezly",
      url: "https://kiezly.de",
      logo: {
        "@type": "ImageObject",
        url: "https://kiezly.de/icons/icon-512.png",
        width: 512,
        height: 512,
      },
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: ["German", "English"],
      },
      areaServed: {
        "@type": "Country",
        name: "Germany",
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      suppressHydrationWarning
    />
  );
}

export default function LocaleLayout({ children, params }: any) {
  const { locale } = params;
  const [messages, setMessages] = useState<any>({});

  const files = [
    "header", "footer", "home", "signup", "signin", "howItWorks",
    "impressum", "terms", "privacy", "404", "jobs", "application",
    "profile", "company", "my-jobs", "post-job", "reset-password",
    "forgot-password", "changePassword", "inbox", "reviews", "messages",
  ];

  useEffect(() => {
    async function loadMessages() {
      const merged: Record<string, any> = {};
      for (const file of files) {
        try {
          const mod = await import(`../../locales/${locale}/${file}.json`);
          merged[file] = mod.default;
        } catch {
          console.warn(`Translation file not found: ${locale}/${file}.json. Falling back to English.`);
          const fallback = await import(`../../locales/en/${file}.json`);
          merged[file] = fallback.default;
        }
      }
      setMessages(merged);
    }
    loadMessages();
  }, [locale]);

  if (Object.keys(messages).length === 0)
    return (
      <ClientLayout>
        <div className="min-h-screen">
          <div className="flex">
            <div className="flex-1 flex items-center justify-center">
              <Loader />
            </div>
          </div>
        </div>
      </ClientLayout>
    );

  const isReady = Object.keys(messages).length > 0;

  return (
    <TranslationContext.Provider value={{ locale, messages }}>
      <ClientLayout>
        {isReady && <SiteJsonLd />}
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: "rounded-xl shadow-md",
            success: { style: { background: "#10B981", color: "white" } },
            error: { style: { background: "#EF4444", color: "white" } },
          }}
        />
      </ClientLayout>
    </TranslationContext.Provider>
  );
}
