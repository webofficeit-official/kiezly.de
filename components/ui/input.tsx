import * as React from 'react'
export function Input({ className='', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-300 ${className}`} {...props} />
}
