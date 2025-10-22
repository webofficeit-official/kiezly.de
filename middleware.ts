// /middleware.ts  (project root)
import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['en', 'de'] as const;
const DEFAULT = 'en';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip assets, API, and files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // If already localized, continue
  if (pathname.startsWith('/en/') || pathname === '/en' ||
      pathname.startsWith('/de/') || pathname === '/de') {
    return NextResponse.next();
  }

  // Choose locale: cookie or default
  const cookie = req.cookies.get('NEXT_LOCALE')?.value;
  const locale = (cookie && (LOCALES as readonly string[]).includes(cookie))
    ? cookie
    : DEFAULT;

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url); // one extra hop; minimal work above
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
