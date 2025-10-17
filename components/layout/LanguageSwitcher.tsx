'use client';

import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

const locales = ['en', 'de', 'fr'];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (locale: string) => {
    // Replace current locale in URL
    const segments = pathname.split('/').filter(Boolean);
    if (locales.includes(segments[0])) {
      segments[0] = locale;
    } else {
      segments.unshift(locale);
    }
    const newPath = '/' + segments.join('/');
    router.push(newPath);
  };

  return (
    <div className="space-x-2">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleChange(locale)}
          className="px-3 py-1 border rounded hover:bg-gray-200"
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
