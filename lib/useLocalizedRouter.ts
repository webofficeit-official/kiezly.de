'use client';

import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { TranslationContext } from '../app/[locale]/layout'; // adjust path if needed

export function useLocalizedRouter() {
  const router = useRouter();
  const { locale } = useContext(TranslationContext);

  const push = (path: string) => {
    if (!path.startsWith('/')) path = '/' + path;

    // If the path already starts with the locale, do nothing
    const segments = path.split('/').filter(Boolean);
    if (segments[0] !== locale) {
      path = '/' + locale + (path === '/' ? '' : path);
    }

    router.push(path);
  };

  return { push };
}
