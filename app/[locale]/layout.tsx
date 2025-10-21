'use client';

import React, { createContext, useContext, useEffect, useState } from "react";

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

export default function LocaleLayout({ children, params }: any) {
  const { locale } = params;
  const [messages, setMessages] = useState<any>({});

  // Load JSON dynamically from /messages folder
  useEffect(() => {
    import(`../../messages/${locale}.json`)
      .then((mod) => setMessages(mod.default))
      .catch(() => {
        console.warn(`No translation found for locale: ${locale}, using English fallback.`);
        import(`../../messages/en.json`).then((mod) => setMessages(mod.default));
      });
  }, [locale]);

  if (Object.keys(messages).length === 0) {
    return <></>;
  }

  return (
    <TranslationContext.Provider value={{ locale, messages }}>
      <main>{children}</main>
    </TranslationContext.Provider>
  );
}
