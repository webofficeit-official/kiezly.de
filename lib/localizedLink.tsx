// /lib/LocalizedLink.tsx
'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { TranslationContext } from '@/app/[locale]/layout';

type Props = {
  href: string;               // internal path, hash, or absolute URL
  className?: string;
  children: React.ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
} & Record<string, any>;

export default function LocalizedLink({
  href,
  children,
  className,
  prefetch = true,
  replace,
  scroll = true,
  onClick,
  ...rest
}: Props) {
  const { locale } = useContext(TranslationContext);

  // External links -> plain <a>
  if (/^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return (
      <a href={href} className={className} onClick={onClick} {...rest} rel="noreferrer" target="_blank">
        {children}
      </a>
    );
  }

  // Hash-only -> plain <a> (no route change)
  if (href.startsWith('#')) {
    return (
      <a href={href} className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }

  // Internal path -> inject locale
  let finalHref = href;
  try {
    const url = new URL(href, 'http://x');
    const segs = url.pathname.split('/').filter(Boolean);
    if (segs[0] !== locale) url.pathname = '/' + [locale, ...segs].join('/');
    finalHref = url.pathname + url.search + url.hash;
  } catch {
    finalHref = '/' + locale + (href.startsWith('/') ? href : '/' + href);
  }

  return (
    <Link
      href={finalHref}
      className={className}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Link>
  );
}
