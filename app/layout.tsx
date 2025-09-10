import './globals.css'

export const metadata = {
  title: 'Mini-Helfer',
  description: 'Find trusted help for everyday mini‑jobs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
