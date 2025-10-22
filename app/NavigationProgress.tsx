'use client'
import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'

export default function NavigationProgress() {
  const pathname = usePathname()
  const search = useSearchParams()
  const prev = useRef(pathname + '?' + search.toString())

  useEffect(() => {
    const now = pathname + '?' + search.toString()
    if (now !== prev.current) {
      // Safety: in case a route change happened without our hook
      NProgress.done()
      prev.current = now
    }
  }, [pathname, search])

  return null
}
