"use client";

import { useAuth } from "@/lib/context/auth-context";
import {
  getNotifications,
  updateNotification,
} from "@/lib/react-query/queries/user/notifications";
import { Notification } from "@/lib/types/notifications";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Bell,
  Languages,
  LanguagesIcon,
  ShieldCheck,
  User,
  X,
  Menu,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useT } from "@/app/[locale]/layout";
import LocalizedLink from "@/lib/localizedLink";
import socket from "@/lib/socket";
const LOCALES = ["en", "de"] as const;
const DEFAULT = "de";

export default function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [latestThree, setLatestThree] = useState([]);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [activeLanguag, setActiveLanguage] = useState("");
  const pathname = usePathname();

  // ====================== MOBILE DRAWER STATE (NEW) ======================
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileUserSubOpen, setMobileUserSubOpen] = useState(false);
  const drawerPanelRef = useRef<HTMLDivElement | null>(null);
  // ======================================================================

  //  header avatar dropdown state + ref
  const [mobileHeaderDDOpen, setMobileHeaderDDOpen] = useState(false);
  const headerDDRef = useRef<HTMLDivElement | null>(null);

  const t = useT("header");
  const { push } = useLocalizedRouter();

  dayjs.extend(relativeTime);

  const not = getNotifications();
  const uNot = updateNotification();

  useEffect(() => {
    not.mutate(
      {},
      {
        onSuccess: (data) => {
          setLatestThree(data?.data.notifications.slice(-3));
          setNotifications(data?.data.notifications);
          setNotificationsCount(
            data?.data.notifications.filter((n) => !n.status).length
          );
        },
        onError: (err) => {
          console.log(err);
        },
      }
    );
  }, []);

  useEffect(() => {
    socket.on("connect", () =>
      console.log(`Connected to socket: ${socket.id}`)
    );

    socket.on("notification", (data) => {
      console.log(data);
      setNotifications((prev) => {
        const updated = [data, ...prev];
        // 2. Update latest three (most recent 3)
        setLatestThree(updated.slice(0, 3));
        // 3. Update count (if you track unread via a property like status = false)
        setNotificationsCount(updated.filter((n) => !n.status).length);
        return updated;
      });
    });
    return () => {
      socket.off("notification");
    };
  }, []);

  const updateNot = (id: string) => {
    uNot.mutate(id, {
      onSuccess: (data) => {
        latestThree.find((l) => (l.id == id ? (l.status = true) : ""));
        notifications.find((l) => (l.id == id ? (l.status = true) : ""));
        setNotificationsCount(notificationsCount - 1);
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  useEffect(() => {
    const seg = pathname.split("/").filter(Boolean)[0];
    setActiveLanguage(LOCALES.includes(seg as any) ? seg : DEFAULT);
  }, [pathname]);

  const handleChange = (next: "en" | "de") => {
    // Remember for a year (readable by middleware & server)
    document.cookie = `NEXT_LOCALE=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;

    const parts = pathname.split("/").filter(Boolean);
    const rest = LOCALES.includes(parts[0] as any) ? parts.slice(1) : parts;

    // Keep the rest of the path/query/hash
    const search = window.location.search || "";
    const hash = window.location.hash || "";

    router.replace(`/${next}/${rest.join("/")}${search}${hash}`);
  };

  // Close drawer on route change
  useEffect(() => {
    if (mobileOpen) setMobileOpen(false);
    setMobileUserSubOpen(false);
  }, [pathname]);

  // Click outside to close drawer
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!mobileOpen) return;
      const t = e.target as Node;
      if (drawerPanelRef.current && !drawerPanelRef.current.contains(t)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [mobileOpen]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const displayName =
    user?.display_name ||
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!mobileHeaderDDOpen) return;
      const t = e.target as Node;
      if (headerDDRef.current && !headerDDRef.current.contains(t)) {
        setMobileHeaderDDOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [mobileHeaderDDOpen]);

  // Also close it when navigating
  useEffect(() => {
    setMobileHeaderDDOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <LocalizedLink href="/" className="font-semibold hover:opacity-80">
              Kiezly.de
            </LocalizedLink>
          </div>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <LocalizedLink href="/how-it-works" className="hover:opacity-80">
              {t("how-it-works")}
            </LocalizedLink>
            <LocalizedLink href="/#categories" className="hover:opacity-80">
              {t("categories")}
            </LocalizedLink>
            <LocalizedLink href="/#trust" className="hover:opacity-80">
              {t("trust-safety")}
            </LocalizedLink>
            <LocalizedLink href={"/jobs"} className="hover:opacity-80">
              {t("jobs")}
            </LocalizedLink>
          </nav>
          <div className="flex items-center gap-2 relative">
            <div className="relative mr-2">
              <button
                onClick={() => setLanguageOpen(!languageOpen)}
                className={`relative inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition`}
                aria-label="Notifications"
                aria-expanded={languageOpen}
              >
                <LanguagesIcon className="h-6 w-6 text-gray-700" />
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {(LOCALES.includes(activeLanguag as any)
                    ? activeLanguag
                    : DEFAULT
                  ).toUpperCase()}
                </span>
              </button>
              {/* Dropdown */}
              {languageOpen && (
                <div className="absolute right-0 top-full mt-2 w-12 rounded-lg border bg-white shadow-md z-50">
                  {LOCALES.map((locale) => (
                    <button
                      key={locale}
                      onClick={() => {
                        setLanguageOpen(false);
                        handleChange(locale);
                      }}
                      className={`block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left border-b border-gray-100 ${
                        activeLanguag == locale && "bg-gray-200"
                      }`}
                    >
                      {locale.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {user ? (
              <>
                <div className="relative mr-2">
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition"
                    aria-label="Notifications"
                    aria-expanded={notificationOpen}
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
                    <div
                      className="absolute right-0 top-full mt-2 w-72 rounded-lg border bg-white shadow-md z-50
                max-h-[70vh] overflow-auto" // [UPDATED] allow scrolling on small screens
                    >
                      {latestThree.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          {t("no-notifications")}
                        </div>
                      ) : (
                        latestThree.map((n: any, i: number) => (
                          <button
                            key={i}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                            onClick={() => {
                              setNotificationOpen(false);
                              updateNot(n.id);
                              push(n.link);
                            }}
                          >
                            <p className="font-bold text-gray-900 text-sm flex justify-between">
                              <span>{n.title}</span>
                              {!n.status && (
                                <span className="inline-block w-2 h-2 bg-amber-500 rounded-full" />
                              )}
                            </p>

                            {/* [UPDATED] show description on all sizes (was hidden on mobile) */}
                            {n.description && (
                              <p className="mt-0.5 text-xs text-gray-600">
                                {n.description}
                              </p>
                            )}

                            {/* [UPDATED] show timestamp on all sizes (was hidden on mobile) */}
                            <div className="mt-0.5 text-[11px] text-gray-500 text-right">
                              {n?.created_at
                                ? dayjs(n?.created_at).fromNow()
                                : null}
                            </div>
                          </button>
                        ))
                      )}

                      <button
                        className="block w-full text-center px-4 py-2 text-sm hover:bg-gray-50"
                        onClick={() => {
                          setNotificationOpen(false);
                          setIsModalOpen(true);
                        }}
                      >
                        <span className="text-sm font-semibold text-gray-800">
                          {t("view-all-notifications")}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
                {/* Avatar button */}
                {user?.role === "client" && (
                  <>
                    <LocalizedLink
                      href="/post-job/basic-details"
                      className="hidden md:inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90"
                    >
                      {t("post-mini-job")}
                    </LocalizedLink>
                  </>
                )}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="hidden md:flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1 text-sm font-medium hover:bg-gray-100"
                >
                  {user?.avatar_url ? (
                    <>
                      <img
                        src={user?.avatar_url || "https://placehold.co/96x96"}
                        alt={user?.display_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white">
                        {(user?.avatar_url ||
                          "https://placehold.co/96x96")?.[0].toUpperCase() || (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                    </>
                  )}

                  <span>
                    {user?.display_name ||
                      `${user?.first_name} ${user?.last_name}`}
                  </span>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 rounded-lg border bg-white shadow-md z-50 hidden md:block">
                    <button
                      className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                      onClick={() => {
                        setDropdownOpen(false);
                        push("/my-profile");
                      }}
                    >
                      {t("my-profile")}
                    </button>
                    <button
                      className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                      onClick={() => {
                        setDropdownOpen(false);
                        push("/change-password");
                      }}
                    >
                      {t("change-password")}
                    </button>
                    {user && user?.role === "client" ? (
                      <button
                        className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                        onClick={() => {
                          setDropdownOpen(false);
                          push("/my-jobs");
                        }}
                      >
                        {t("my-jobs")}
                      </button>
                    ) : (
                      <>
                        <button
                          className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                          onClick={() => {
                            setDropdownOpen(false);
                            push("/saved-job");
                          }}
                        >
                          {t("saved-jobs")}
                        </button>
                        <button
                          className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                          onClick={() => {
                            setDropdownOpen(false);
                            push("/applied-jobs");
                          }}
                        >
                          {t("applied-jobs")}
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      {t("logout")}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <LocalizedLink
                  href="/signup?role=helper"
                  className="hidden md:inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50"
                >
                  {t("become-helper")}
                </LocalizedLink>
                <LocalizedLink
                  href="/signup?role=client"
                  className="hidden md:inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90"
                >
                  {t("post-mini-job")}
                </LocalizedLink>
              </>
            )}

            {/* =================== HAMBURGER =================== */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => {
                setMobileOpen(true);
                setLanguageOpen(false);
                setNotificationOpen(false);
                setDropdownOpen(false);
              }}
            >
              <Menu className="h-6 w-6" />
            </button>
            {/* ====================================================== */}
          </div>
        </div>
      </header>

      {/* =================== MOBILE DRAWER  =================== */}
      <div
        className={`fixed inset-0 z-[80] md:hidden ${
          mobileOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />
        {/* Panel */}
        <aside
          ref={drawerPanelRef}
          className={`absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-xl transition-transform ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
        >
          {/* Drawer header */}
          {/* <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <LocalizedLink
                href="/"
                className="font-semibold hover:opacity-80"
                onClick={() => setMobileOpen(false)}
              >
                Kiezly.de
              </LocalizedLink>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <button
                  onClick={() => setMobileUserSubOpen((v) => !v)}
                  aria-label="User menu"
                  aria-expanded={mobileUserSubOpen}
                  className="inline-flex items-center justify-center rounded-full h-9 w-9 overflow-hidden border hover:bg-gray-50"
                  title={
                    user?.display_name ||
                    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`
                  }
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-700">
                      {(user?.display_name ||
                        `${user?.first_name ?? ""}${user?.last_name ?? ""}` ||
                        "U")[0].toUpperCase()}
                    </span>
                  )}
                </button>
              )}

              <button
                className="rounded-md p-2 hover:bg-gray-100"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div> */}

          {/* Drawer header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            {/* LEFT: Logo / Title */}
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <LocalizedLink
                href="/"
                className="font-semibold hover:opacity-80"
                onClick={() => setMobileOpen(false)}
              >
                Kiezly.de
              </LocalizedLink>
            </div>

            {/* RIGHT: Avatar + Close button */}
            <div ref={headerDDRef} className="relative flex items-center gap-2">
              {/* Avatar Button */}
              {user && (
                <button
                  onClick={() => setMobileHeaderDDOpen((v) => !v)}
                  aria-label="User menu"
                  aria-expanded={mobileHeaderDDOpen}
                  className="inline-flex items-center justify-center rounded-full h-9 w-9 overflow-hidden border hover:bg-gray-50"
                  title={
                    user?.display_name ||
                    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`
                  }
                >
                  {user?.avatar_url ? (
                    <img
                      src={user?.avatar_url}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-700">
                      {(user?.display_name ||
                        `${user?.first_name ?? ""}${user?.last_name ?? ""}` ||
                        "U")[0].toUpperCase()}
                    </span>
                  )}
                </button>
              )}

              {/* Close button */}
              <button
                className="rounded-md p-2 hover:bg-gray-100"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>

              {/* Avatar Dropdown */}
              {user && mobileHeaderDDOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 rounded-lg border bg-white shadow-lg z-50"
                  role="menu"
                  aria-label="Mobile header user menu"
                >
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-semibold">
                      {user?.display_name ||
                        `${user?.first_name ?? ""} ${user?.last_name ?? ""}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(user?.first_name || "") + " " + (user?.last_name || "")}
                    </p>
                  </div>

                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => {
                      setMobileHeaderDDOpen(false);
                      setMobileOpen(false);
                      push("/my-profile");
                    }}
                    role="menuitem"
                  >
                    {t("my-profile")}
                  </button>

                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => {
                      setMobileHeaderDDOpen(false);
                      setMobileOpen(false);
                      push("/change-password");
                    }}
                    role="menuitem"
                  >
                    {t("change-password")}
                  </button>

                  {user?.role === "client" ? (
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                      onClick={() => {
                        setMobileHeaderDDOpen(false);
                        setMobileOpen(false);
                        push("/my-jobs");
                      }}
                      role="menuitem"
                    >
                      {t("my-jobs")}
                    </button>
                  ) : (
                    <>
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        onClick={() => {
                          setMobileHeaderDDOpen(false);
                          setMobileOpen(false);
                          push("/saved-job");
                        }}
                        role="menuitem"
                      >
                        {t("saved-jobs")}
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        onClick={() => {
                          setMobileHeaderDDOpen(false);
                          setMobileOpen(false);
                          push("/applied-jobs");
                        }}
                        role="menuitem"
                      >
                        {t("applied-jobs")}
                      </button>
                    </>
                  )}

                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => {
                      setMobileHeaderDDOpen(false);
                      setMobileOpen(false);
                      logout();
                    }}
                    role="menuitem"
                  >
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Drawer content */}
          <div className="p-4 space-y-6 overflow-y-auto">
            {user && (
              <>
                <div className="rounded-lg border">
                  <button
                    className="w-full px-3 py-3 flex items-center gap-3 hover:bg-gray-50"
                    // onClick={() => setMobileUserSubOpen((v) => !v)}
                    aria-expanded={mobileUserSubOpen}
                  >
                    {user?.avatar_url ? (
                      <img
                        src={user?.avatar_url || "https://placehold.co/96x96"}
                        alt={displayName || "avatar"}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                        {(displayName?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold">{displayName}</p>
                      <p className="text-xs text-gray-500">
                        {(user?.first_name || "") +
                          " " +
                          (user?.last_name || "")}
                      </p>
                    </div>
                    {/* {mobileUserSubOpen ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )} */}
                  </button>

                  {/* {mobileUserSubOpen && (
                    <div className="border-t">
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        onClick={() => {
                          push("/my-profile");
                          setMobileOpen(false);
                        }}
                      >
                        {t("my-profile")}
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        onClick={() => {
                          push("/change-password");
                          setMobileOpen(false);
                        }}
                      >
                        {t("change-password")}
                      </button>

                      {user.role === "client" ? (
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                          onClick={() => {
                            push("/my-jobs");
                            setMobileOpen(false);
                          }}
                        >
                          {t("my-jobs")}
                        </button>
                      ) : (
                        <>
                          <button
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                            onClick={() => {
                              push("/saved-job");
                              setMobileOpen(false);
                            }}
                          >
                            {t("saved-jobs")}
                          </button>
                          <button
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                            onClick={() => {
                              push("/applied-jobs");
                              setMobileOpen(false);
                            }}
                          >
                            {t("applied-jobs")}
                          </button>
                        </>
                      )}

                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        onClick={() => {
                          logout();
                          setMobileOpen(false);
                        }}
                      >
                        {t("logout")}
                      </button>
                    </div>
                  )} */}
                </div>
              </>
            )}
            {user && (
              <>
                <nav className="space-y-2">
                  <LocalizedLink
                    href="/my-profile"
                    className="block rounded-lg px-3 py-2 hover:bg-gray-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("my-profile")}
                  </LocalizedLink>

                  <LocalizedLink
                    href="/change-password"
                    className="block rounded-lg px-3 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setMobileOpen(false);
                    }}
                  >
                    {t("change-password")}
                  </LocalizedLink>

                  {user?.role === "client" ? (
                    <LocalizedLink
                      href="/my-jobs"
                      className="block rounded-lg px-3 py-1 hover:bg-gray-100"
                      onClick={() => {
                        setMobileOpen(false);
                      }}
                    >
                      {t("my-jobs")}
                    </LocalizedLink>
                  ) : (
                    <>
                      <LocalizedLink
                        href="/saved-job"
                        className="block rounded-lg px-3 py-1 hover:bg-gray-100"
                        onClick={() => {
                          setMobileOpen(false);
                        }}
                      >
                        {t("saved-jobs")}
                      </LocalizedLink>
                      <LocalizedLink
                        href="/applied-jobs"
                        className="block rounded-lg px-3 py-1 hover:bg-gray-100"
                        onClick={() => {
                          setMobileOpen(false);
                        }}
                      >
                        {t("applied-jobs")}
                      </LocalizedLink>
                    </>
                  )}

                  {user && (
                    <button
                      className="w-full text-left px-3 py-2 rounded-lg border text-sm text-sm hover:bg-gray-50 bg-gray-900 text-white border-gray-900"
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                    >
                      {t("logout")}
                    </button>
                  )}
                </nav>

                <div className="flex items-center gap-0 my-4">
                  <div className="flex-1 border-t border-gray-200"></div>
                  {/* <span className="text-xs uppercase text-gray-400"></span> */}
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
              </>
            )}

            <nav className="space-y-2">
              {!user && (
                <>
                  <div className="grid grid-cols-1 gap-2">
                    <LocalizedLink
                      href="/signin"
                      className="inline-flex items-center justify-center rounded-xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90"
                    >
                      {t("signin")}
                    </LocalizedLink>
                  </div>
                  <div className="flex items-center gap-0 my-4">
                    <div className="flex-1 border-t border-gray-200"></div>
                    {/* <span className="text-xs uppercase text-gray-400"></span> */}
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>
                </>
              )}

              <LocalizedLink
                href="/how-it-works"
                className="block rounded-lg px-3 py-2 hover:bg-gray-100"
                onClick={() => setMobileOpen(false)}
              >
                {t("how-it-works")}
              </LocalizedLink>
              <LocalizedLink
                href="/#categories"
                className="block rounded-lg px-3 py-2 hover:bg-gray-100"
                onClick={() => setMobileOpen(false)}
              >
                {t("categories")}
              </LocalizedLink>
              <LocalizedLink
                href="/#trust"
                className="block rounded-lg px-3 py-2 hover:bg-gray-100"
                onClick={() => setMobileOpen(false)}
              >
                {t("trust-safety")}
              </LocalizedLink>
              <LocalizedLink
                href="/jobs"
                className="block rounded-lg px-3 py-2 hover:bg-gray-100"
                onClick={() => setMobileOpen(false)}
              >
                {t("jobs")}
              </LocalizedLink>
            </nav>

            {user && user?.role === "client" && (
              <>
                <div className="flex items-center gap-0 my-4">
                  <div className="flex-1 border-t border-gray-200"></div>
                  {/* <span className="text-xs uppercase text-gray-400"></span> */}
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <LocalizedLink
                    href="/post-job/basic-details"
                    className="inline-flex items-center rounded-xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90"
                  >
                    {t("post-mini-job")}
                  </LocalizedLink>
                </div>
              </>
            )}

            {user ? (
              <></>
            ) : (
              <>
                <div className="flex items-center gap-0 my-4">
                  <div className="flex-1 border-t border-gray-200"></div>
                  {/* <span className="text-xs uppercase text-gray-400"></span> */}
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <LocalizedLink
                    href="/signup?role=helper"
                    className="inline-flex items-center rounded-xl text-sm font-medium px-3 py-2 transition-colors border bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("become-helper")}
                  </LocalizedLink>
                  <LocalizedLink
                    href="/signup?role=client"
                    className="inline-flex items-center rounded-xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("post-mini-job")}
                  </LocalizedLink>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
      {/* ========================================================== */}

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setIsModalOpen(false)}
            ></div>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            {/* 2. Modal Panel (The actual content box) */}
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* Header */}
              <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between">
                <h3
                  className="text-lg leading-6 font-bold text-gray-900"
                  id="modal-title"
                >
                  {t("notifications")}
                </h3>
                <X
                  className="h-6 w-6 text-black-300 border border-gray-200 cursor-pointer rounded-lg"
                  onClick={() => setIsModalOpen(false)}
                />
              </div>

              {/* Body/Content */}
              <div
                className="px-2 py-2 space-y-1 overflow-auto"
                style={{ maxHeight: "500px" }}
              >
                {notifications.map((n, i) => (
                  <button
                    key={i}
                    className={`block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left border-b border-gray-100`}
                    onClick={() => {
                      setNotificationOpen(false);
                      setIsModalOpen(false);
                      updateNot(n.id);
                      push(n.link);
                    }}
                  >
                    <p className="font-bold text-gray-900 text-sm flex justify-between">
                      <span>{n.title}</span>
                      {!n.status && (
                        <span className="inline-block w-2 h-2 bg-amber-500 rounded-full"></span>
                      )}
                    </p>
                    <p className="hidden lg:flex text-xs text-gray-600">
                      {n.description}
                    </p>
                    <div className="hidden lg:flex text-xs text-gray-600 text-right">
                      {dayjs(n?.created_at)?.fromNow()}
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer/Actions */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsModalOpen(false)}
                >
                  {t("close")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
