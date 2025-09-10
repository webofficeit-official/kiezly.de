import * as React from 'react'
export function Button({ className='', variant, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'outline' | 'default' }) {
  const base = 'inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors disabled:opacity-50 border'
  const styles = variant === 'outline'
    ? 'bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50'
    : 'bg-neutral-900 text-white border-neutral-900 hover:opacity-90'
  return <button className={`${base} ${styles} ${className}`} {...props} />
}
