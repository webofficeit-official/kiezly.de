import ClientLayout from './client-layout/client-layout';
import './globals.css';
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: 'Kiezly.de',
  description: 'Find trusted help for everyday mini‑jobs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">

      <body className='min-h-screen bg-gradient-to-b from-neutral-50 to-white text-neutral-900 w-full'>
        <ClientLayout>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: "rounded-xl shadow-md",
              success: {
                style: {
                  background: "#10B981",
                  color: "white",
                },
              },
              error: {
                style: {
                  background: "#EF4444",
                  color: "white",
                },
              },
            }}
          />
        </ClientLayout>
      </body>

    </html>
  )
}
