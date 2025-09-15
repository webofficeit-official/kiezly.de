import { ShieldCheck } from 'lucide-react';
export default function Footer() {
  return (
     <footer className="border-t">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-neutral-600 md:flex-row">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /><span>Kiezly.de</span></div>
              <div className="flex flex-wrap items-center gap-4">
                <a className="hover:opacity-80" href="#">Impressum</a>
                <a className="hover:opacity-80" href="#">Privacy</a>
                <a className="hover:opacity-80" href="#">Terms</a>
              </div>
            </div>
          </footer>
  );
}
