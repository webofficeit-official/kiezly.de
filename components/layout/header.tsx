import { ShieldCheck } from 'lucide-react';
export default function Header() {
  return (
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <a href="/" className="font-semibold">Kiezly.de</a>
          </div>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="/how-it-works" className="hover:opacity-80">How it works</a>
            <a href="/#categories" className="hover:opacity-80">Categories</a>
            <a href="/#trust" className="hover:opacity-80">Trust & Safety</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="/signup?role=helper"  className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50">Become a helper</a>
            <a href="#" className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90">Post a mini‑job</a>
          </div>
        </div>
      </header>
  );
}
