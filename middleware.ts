// /middleware.ts (project root)
import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['en', 'de'] as const;
const DEFAULT = 'en';
const COOKIE = 'NEXT_LOCALE';
const COOKIE_OPTS = {
  path: '/',
  maxAge: 60 * 60 * 24 * 365, // 1 year, persists across browser restarts
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production', // only over https in prod
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip assets/API/files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const firstSeg = pathname.split('/').filter(Boolean)[0];

  // If URL already has a locale: refresh/align the cookie and continue
  if (LOCALES.includes(firstSeg as any)) {
    const res = NextResponse.next();
    res.cookies.set(COOKIE, firstSeg!, COOKIE_OPTS); // refresh expiry each request
    return res;
  }

  // Missing locale: choose from cookie or default, then redirect and set cookie
  const fromCookie = req.cookies.get(COOKIE)?.value;
  const locale =
    (fromCookie && (LOCALES as readonly string[]).includes(fromCookie))
      ? fromCookie
      : DEFAULT;

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;

  const res = NextResponse.redirect(url);
  res.cookies.set(COOKIE, locale, COOKIE_OPTS); // set persistent cookie
  return res;
}

export const config = { matcher: ['/((?!_next|api|.*\\..*).*)'] };
