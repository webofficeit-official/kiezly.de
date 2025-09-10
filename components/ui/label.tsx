import * as React from 'react'
export function Label({ className='', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`block text-sm text-neutral-700 mb-1 ${className}`} {...props} />
}
