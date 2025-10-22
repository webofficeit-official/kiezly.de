// /lib/useLocalizedRouter.ts
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useContext, useEffect, useRef, useTransition } from 'react'
import NProgress from 'nprogress'
import { TranslationContext } from '@/app/[locale]/layout'

function withLocale(href: string, locale: string) {
  try {
    const url = new URL(href, 'http://x')
    const segs = url.pathname.split('/').filter(Boolean)
    if (segs[0] !== locale) url.pathname = '/' + [locale, ...segs].join('/')
    return url.pathname + url.search + url.hash
  } catch {
    return '/' + locale + (href.startsWith('/') ? href : '/' + href)
  }
}

export function useLocalizedRouter() {
  const router = useRouter()
  const { locale } = useContext(TranslationContext)
  const [ , startTransition] = useTransition()

  // Stop the bar once URL actually changes (path OR search)
  const pathname = usePathname()
  const search = useSearchParams()
  const last = useRef(pathname + '?' + search.toString())
  useEffect(() => {
    const now = pathname + '?' + search.toString()
    if (now !== last.current) {
      NProgress.done()
      last.current = now
    }
  }, [pathname, search])

  const push = (href: string) => {
    const finalHref = withLocale(href, locale)
    NProgress.start()
    startTransition(() => router.push(finalHref))
  }

  const replace = (href: string) => {
    const finalHref = withLocale(href, locale)
    NProgress.start()
    startTransition(() => router.replace(finalHref))
  }

  const prefetch = (href: string) => {
    const finalHref = withLocale(href, locale)
    router.prefetch?.(finalHref)
  }

  return { push, replace, back: router.back, prefetch }
}
