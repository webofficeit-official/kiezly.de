import ClientLayout from './client-layout/client-layout';
import './globals.css';

export const metadata = {
  title: 'Kiezly.de',
  description: 'Find trusted help for everyday mini‑jobs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">

      <body className='min-h-screen bg-gradient-to-b from-neutral-50 to-white text-neutral-900'>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>

    </html>
  )
}
