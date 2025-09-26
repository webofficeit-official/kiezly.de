import { useAuth } from '@/lib/context/auth-context';
import { ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';
export default function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false)
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
          <a href="/jobs" className="hover:opacity-80">Jobs</a>
        </nav>
        <div className="flex items-center gap-2 relative">
          {user ? (
            <>
              {/* Avatar button */}
              {user?.role === 'client' && (<>
                <a href="/client/post-job" className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90">Post a mini‑job</a>
              </>)
              }
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1 text-sm font-medium hover:bg-gray-100"
              >
                {
                  user?.avatar_url ?
                    (
                      <>
                        <img src={user?.avatar_url || "https://placehold.co/96x96"} alt={user?.display_name} className="h-10 w-10 rounded-full object-cover" />
                      </>
                    ) :
                    (
                      <>
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white">
                          {(user?.avatar_url || user?.avatar_url)?.[0].toUpperCase() || <User className="w-4 h-4" />}
                        </div>
                      </>
                    )
                }

                <span>{user?.display_name || `${user?.first_name} ${user?.last_name}`}</span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 rounded-lg border bg-white shadow-md z-50">
                  <a
                    href="/my-profile"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Profile
                  </a>
                  <button
                    onClick={() => {
                      logout()
                      setDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <a href="/signup?role=helper" className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50">Become a helper</a>
              <a href="/signup?role=client" className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90">Post a mini‑job</a>

            </>
          )}
        </div>
      </div>
    </header>
  );
}
