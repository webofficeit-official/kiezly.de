import * as React from 'react'
export function Textarea({ className='', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-300 ${className}`} {...props} />
}
