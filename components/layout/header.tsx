import { useAuth } from '@/lib/context/auth-context';
import { getNotifications } from '@/lib/react-query/queries/user/notifications';
import { Notification } from '@/lib/types/notifications';
import { Bell, ShieldCheck, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [latestThree, setLatestThree] = useState([])
  const [notificationsCount, setNotificationsCount] = useState(0);
  const router = useRouter();

  const not = getNotifications();

  useEffect(() => {
    not.mutate({}, {
      onSuccess: (data) => {
        setLatestThree(data?.data.notifications.slice(0, 3))
        setNotificationsCount(data?.data.notifications.filter(n => !n.status).length)
      },
      onError: (err) => {
        console.log(err);
      }
    })
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          <button onClick={() => router.push("/")} className="font-semibold">Kiezly.de</button>
        </div>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <button onClick={() => router.push("/how-it-works")} className="hover:opacity-80">How it works</button>
          <button onClick={() => router.push("/#categories")} className="hover:opacity-80">Categories</button>
          <button onClick={() => router.push("/#trust")} className="hover:opacity-80">Trust & Safety</button>
          <button onClick={() => router.push("/jobs")} className="hover:opacity-80">Jobs</button>
        </nav>
        <div className="flex items-center gap-2 relative">
          {user ? (
            <>
              <div className="relative mr-2">
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition"
                  aria-label="Notifications"
                >
                  <Bell className="h-6 w-6 text-gray-700" />
                  {notificationsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationsCount > 9 ? "9+" : notificationsCount}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {notificationOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 rounded-lg border bg-white shadow-md z-50">
                    {
                      latestThree.map((n, i) => (
                        <button
                          key={i}
                          className={`block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left border-b border-gray-100`}
                          onClick={() => {
                            setNotificationOpen(false)
                            router.push(n.link)
                          }}
                        >
                          <p className='font-bold text-gray-900 text-sm flex justify-between'>
                            <span>{n.title}</span>
                            {!n.status && <span className="inline-block w-2 h-2 bg-amber-500 rounded-full"></span>}
                          </p>
                          <p className='hidden lg:flex text-xs text-gray-600'>{n.description}</p>
                        </button>
                      ))
                    }
                    <button
                      className={`block px-4 py-2 text-sm hover:bg-gray-100 w-full text-center`}
                      onClick={() => {
                        setNotificationOpen(false)
                        router.push("/notifications")
                      }}
                    >
                      <p className='text-sm font-semibold text-gray-800'>View all notifications</p>
                    </button>
                  </div>
                )}
              </div>
              {/* Avatar button */}
              {user?.role === 'client' && (<>
                <button onClick={() => router.push("/post-job/basic-details")} className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90">Post a mini‑job</button>
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
                          {(user?.avatar_url || "https://placehold.co/96x96")?.[0].toUpperCase() || <User className="w-4 h-4" />}
                        </div>
                      </>
                    )
                }

                <span>{user?.display_name || `${user?.first_name} ${user?.last_name}`}</span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 rounded-lg border bg-white shadow-md z-50">
                  <button
                    className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                    onClick={() => {
                      setDropdownOpen(false)
                      router.push("/my-profile")
                    }}
                  >
                    My Profile
                  </button>
                  {user.role === 'client' ? (
                    <button
                      className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                      onClick={() => {
                        setDropdownOpen(false)
                        router.push("/my-jobs")
                      }}
                    >
                      My Jobs
                    </button>) : (<>
                      <button
                        className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                        onClick={() => {
                          setDropdownOpen(false)
                          router.push("/saved-job")
                        }}
                      >
                        Saved Jobs</button>
                      <button
                        className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                        onClick={() => {
                          setDropdownOpen(false)
                          router.push("/applied-jobs")
                        }}
                      >
                        Applied Jobs</button>
                    </>)}

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
              <button onClick={() => router.push("/signup?role=helper")} className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50">Become a helper</button>
              <button onClick={() => router.push("/signup?role=client")} className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90">Post a mini‑job</button>

            </>
          )}
        </div>
      </div>
    </header>
  );
}
