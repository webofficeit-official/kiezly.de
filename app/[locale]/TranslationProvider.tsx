'use client';

import React, { createContext, useContext } from "react";

const TranslationContext = createContext({ locale: "de", messages: {} });

export function useTranslation() {
  return useContext(TranslationContext);
}

export function TranslationProvider({ children, locale, messages }) {
  return (
    <TranslationContext.Provider value={{ locale, messages }}>
      {children}
    </TranslationContext.Provider>
  );
}
