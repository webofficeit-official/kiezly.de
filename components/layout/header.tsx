"use client";

import { useAuth } from "@/lib/context/auth-context";
import {
  getNotifications,
  updateNotification,
  clearNotifications
} from "@/lib/react-query/queries/user/notifications";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Bell,
  ShieldCheck,
  User,
  X,
  Menu,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  BellOff,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useT } from "@/app/[locale]/layout";
import LocalizedLink from "@/lib/localizedLink";
import socket from "@/lib/socket";
import { useJobWizard } from "@/lib/context/job-wizard-context";
import { useQueryClient } from "@tanstack/react-query";
import { useCountTotalMessage } from "@/lib/react-query/queries/message";
import { MessageApiResponse } from "@/lib/types/message";
import { FaBroom } from "react-icons/fa";
const LOCALES = ["en", "de"] as const;
const DEFAULT = "de";

export default function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [latestThree, setLatestThree] = useState([]);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeLanguag, setActiveLanguage] = useState("");
  const { reset, clearForm } = useJobWizard();
  const pathname = usePathname();
  const qc = useQueryClient();

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
  const cNot = clearNotifications();

  useEffect(() => {
    if (!user) return;
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
          // console.log(err);
        },
      }
    );
  }, [user]);

  const queryClient = useQueryClient();

  const { data: count, isLoading: isCountChecking } = useCountTotalMessage(
    { enabled: true }
  );

  useEffect(() => {
    if (count?.data?.count !== undefined) {
      setMessageCount(count.data.count);
    }
  }, [count]);

  useEffect(() => {
    if (!user) return;

    socket.on("notification", (data) => {
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
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ["count-total-conversation"] });
    };

    socket.on("message", refresh);
    socket.on("messages-seen", refresh);

    return () => {
      socket.off("message", refresh);
      socket.off("messages-seen", refresh);
    };
  }, [user]);

  const updateNot = (id: string) => {
    uNot.mutate(id, {
      onSuccess: (data) => {
        latestThree.find((l) => (l.id == id ? (l.status = true) : ""));
        notifications.find((l) => (l.id == id ? (l.status = true) : ""));
        setNotificationsCount(
          notifications?.filter((n) => !n.status).length
        );
      },
      onError: (err) => {
        // console.log(err);
      },
    });
  };

  const clearAllNotifications = () => {
    cNot.mutate({}, {
      onSuccess: (data) => {
        setLatestThree([])
        setNotifications([])
        setNotificationsCount(0);
      },
      onError: (err) => {
        // console.log(err);
      },
    });
  }

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

  const handleStartNew = () => {
    reset();

    qc.removeQueries({ queryKey: ["job"] });
    push("/post-job/basic-details");
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[200]"
        style={{
          height: '68px',
          background: 'rgba(255,255,255,.97)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(0,0,0,.10)',
          boxShadow: '0 2px 20px rgba(0,0,0,.07)',
        }}
      >
        <div className="flex h-full items-center justify-between px-6 md:px-12">
          {/* Logo */}
          <LocalizedLink
            href="/"
            className="no-underline hover:opacity-80 transition-opacity flex items-center gap-2.5"
          >
            {/* Icon mark */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="7" fill="#e8622a"/>
              {/* Stylised "K": vertical bar + two diagonal arms */}
              <line x1="9" y1="7" x2="9" y2="21" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              <line x1="9" y1="14" x2="19" y2="7.5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              <line x1="9" y1="14" x2="19" y2="20.5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            {/* Wordmark */}
            <span
              className="font-display font-bold text-[#111110]"
              style={{ fontSize: '20px', letterSpacing: '-0.6px', lineHeight: 1 }}
            >
              kiezly
            </span>
          </LocalizedLink>

          {/* Centered nav links (desktop) */}
          <nav
            className="hidden md:flex items-center gap-9 absolute left-1/2 -translate-x-1/2"
          >
            <LocalizedLink
              href="/how-it-works"
              className="text-[14.5px] font-500 text-[rgba(17,17,16,.75)] hover:text-[#111110] transition-colors no-underline font-medium"
            >
              {t("how-it-works")}
            </LocalizedLink>
            <LocalizedLink
              href="/#categories"
              className="text-[14.5px] font-500 text-[rgba(17,17,16,.75)] hover:text-[#111110] transition-colors no-underline font-medium"
            >
              {t("categories")}
            </LocalizedLink>
            <LocalizedLink
              href="/#trust"
              className="text-[14.5px] font-500 text-[rgba(17,17,16,.75)] hover:text-[#111110] transition-colors no-underline font-medium"
            >
              {t("trust-safety")}
            </LocalizedLink>
            <LocalizedLink
              href="/jobs"
              className="text-[14.5px] font-500 text-[rgba(17,17,16,.75)] hover:text-[#111110] transition-colors no-underline font-medium"
            >
              {t("jobs")}
            </LocalizedLink>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 relative">
            {/* Language switcher */}
            {(() => {
              const LANG_OPTIONS = [
                { code: "de", label: "Deutsch", flag: "🇩🇪" },
                { code: "en", label: "English", flag: "🇬🇧" },
              ];
              const activeLang = LOCALES.includes(activeLanguag as any) ? activeLanguag : DEFAULT;
              const current = LANG_OPTIONS.find(l => l.code === activeLang) ?? LANG_OPTIONS[0];
              return (
                <div className="relative">
                  <button
                    onClick={() => setLanguageOpen(!languageOpen)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(17,17,16,.12)] bg-white px-3 py-1.5 text-[13px] font-medium text-[#111110] transition-all hover:border-[rgba(17,17,16,.25)] hover:bg-[#f7f7f5]"
                    aria-haspopup="listbox"
                    aria-expanded={languageOpen}
                  >
                    <span className="text-base leading-none">{current.flag}</span>
                    <span className="tracking-wide">{current.code.toUpperCase()}</span>
                    <ChevronDown
                      className="h-3.5 w-3.5 transition-transform duration-200"
                      style={{ transform: languageOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </button>
                  {languageOpen && (
                    <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-[#efefec] bg-white py-1.5 shadow-xl z-[300]">
                      {LANG_OPTIONS.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => { setLanguageOpen(false); handleChange(lang.code as "en" | "de"); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#f7f7f5]"
                        >
                          <span className="text-xl leading-none">{lang.flag}</span>
                          <div className="flex-1">
                            <p className="text-[13px] font-semibold text-[#111110]">{lang.label}</p>
                            <p className="text-[11px]" style={{ color: "rgba(17,17,16,.4)" }}>{lang.code.toUpperCase()}</p>
                          </div>
                          {activeLang === lang.code && (
                            <span className="h-1.5 w-1.5 rounded-full bg-kz-accent flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative inline-flex items-center justify-center p-2 rounded-full hover:bg-[#f7f7f5] transition"
                    aria-label="Notifications"
                    aria-expanded={notificationOpen}
                  >
                    <Bell className="h-5 w-5 text-[rgba(17,17,16,.6)]" />
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
                        <div className="px-6 py-10 flex flex-col items-center text-center gap-2 text-neutral-500">
                          <BellOff className="h-8 w-8 text-neutral-400" />

                          <h3 className="text-sm font-medium text-neutral-700">
                            {t("notifications.empty-title")}
                          </h3>

                          <p className="text-xs text-neutral-500 max-w-xs">
                            {t("notifications.empty-description")}
                          </p>
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

                      {notifications.length > 0 && <button
                        className="block w-full text-center px-4 py-2 text-sm hover:bg-gray-50"
                        onClick={() => {
                          setNotificationOpen(false);
                          setIsModalOpen(true);
                        }}
                      >
                        <span className="text-sm font-semibold text-gray-800">
                          {t("notifications.view-all")} ({notifications.length})
                        </span>
                      </button>}
                    </div>
                  )}
                </div>
                {/* Messages */}
                <div className="relative">
                  <button
                    onClick={() => push("/my-inbox")}
                    className="relative inline-flex items-center justify-center p-2 rounded-full hover:bg-[#f7f7f5] transition"
                    aria-label="Messages"
                  >
                    <MessageCircle className="h-5 w-5 text-[rgba(17,17,16,.6)]" />
                    {messageCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {messageCount > 9 ? "9+" : messageCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Post job CTA (client only) */}
                {user?.role === "client" && (
                  <button
                    onClick={handleStartNew}
                    className="hidden md:inline-flex items-center justify-center h-[34px] px-4 rounded-[6px] text-[13px] font-semibold bg-[#e8622a] text-white hover:bg-[#d4561f] transition-colors border-0"
                  >
                    {t("post-mini-job")}
                  </button>
                )}

                {/* User avatar + dropdown */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="hidden md:flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium hover:bg-[#f7f7f5] transition-colors"
                  style={{ borderColor: 'rgba(0,0,0,.13)' }}
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#efefec] flex items-center justify-center text-[#111110] text-xs font-semibold">
                      {(user?.display_name || user?.first_name || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-[13px] text-[#111110]">
                    {user?.display_name || `${user?.first_name} ${user?.last_name}`}
                  </span>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-44 rounded-[10px] bg-white shadow-lg z-50 hidden md:block overflow-hidden"
                    style={{ border: '1px solid rgba(0,0,0,.07)' }}
                  >
                    {[
                      { label: t("my-profile"), path: "/my-profile" },
                      { label: t("change-password"), path: "/change-password" },
                      ...(user?.role === "client"
                        ? [{ label: t("my-jobs"), path: "/my-jobs" }]
                        : [
                            { label: t("saved-jobs"), path: "/saved-job" },
                            { label: t("applied-jobs"), path: "/applied-jobs" },
                            { label: t("reported-jobs"), path: "/reported-jobs" },
                          ]),
                    ].map(({ label, path }) => (
                      <button
                        key={path}
                        className="block px-4 py-2.5 text-[13px] text-[rgba(17,17,16,.7)] hover:bg-[#f7f7f5] hover:text-[#111110] w-full text-left transition-colors border-b border-[rgba(0,0,0,.05)] last:border-b-0"
                        onClick={() => { setDropdownOpen(false); push(path); }}
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-[rgba(17,17,16,.7)] hover:bg-[#f7f7f5] hover:text-[#111110] transition-colors"
                    >
                      {t("logout")}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Guest CTAs */}
                <LocalizedLink
                  href="/signin"
                  className="hidden md:inline-flex items-center justify-center h-[34px] px-4 rounded-[6px] text-[13px] font-medium text-[rgba(17,17,16,.75)] hover:text-[#111110] transition-colors no-underline"
                >
                  {t("signin")}
                </LocalizedLink>
                <LocalizedLink
                  href="/signup?role=helper"
                  className="hidden md:inline-flex items-center justify-center h-[34px] px-4 rounded-[6px] text-[13px] font-medium text-[rgba(17,17,16,.55)] hover:text-[#111110] transition-colors no-underline"
                  style={{ border: '1px solid rgba(0,0,0,.13)', background: 'transparent' }}
                >
                  {t("become-helper")}
                </LocalizedLink>
                <LocalizedLink
                  href="/signup?role=client"
                  className="hidden md:inline-flex items-center justify-center h-[34px] px-4 rounded-[6px] text-[13px] font-semibold bg-[#e8622a] text-white hover:bg-[#d4561f] transition-colors no-underline border-0"
                >
                  {t("post-mini-job")}
                </LocalizedLink>
              </>
            )}

            {/* Hamburger */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-[#f7f7f5] transition"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => { setMobileOpen(true); setLanguageOpen(false); setNotificationOpen(false); setDropdownOpen(false); }}
            >
              <Menu className="h-5 w-5 text-[#111110]" />
            </button>
          </div>
        </div>
      </header>

      {/* =================== MOBILE DRAWER  =================== */}
      <div
        className={`fixed inset-0 z-[80] md:hidden ${mobileOpen ? "" : "pointer-events-none"
          }`}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"
            }`}
          onClick={() => setMobileOpen(false)}
        />
        {/* Panel */}
        <aside
          ref={drawerPanelRef}
          className={`absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-xl transition-transform ${mobileOpen ? "translate-x-0" : "translate-x-full"
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
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        onClick={() => {
                          setMobileHeaderDDOpen(false);
                          setMobileOpen(false);
                          push("/reported-jobs");
                        }}
                        role="menuitem"
                      >
                        {t("reported-jobs")}
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
                          <button
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                            onClick={() => {
                              push("/reported-jobs");
                              setMobileOpen(false);
                            }}
                          >
                            {t("reported-jobs")}
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
                      <LocalizedLink
                        href="/reported-jobs"
                        className="block rounded-lg px-3 py-1 hover:bg-gray-100"
                        onClick={() => {
                          setMobileOpen(false);
                        }}
                      >
                        {t("reported-jobs")}
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
                  <button
                    onClick={handleStartNew}
                    className="inline-flex items-center rounded-xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90"
                  >
                    {t("post-mini-job")}
                  </button>
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
                  {t("notifications.title")}
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
                {notifications.length > 0 ? notifications.map((n, i) => (
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
                )) : (
                  <div className="px-6 py-10 flex flex-col items-center text-center gap-2 text-neutral-500">
                    <BellOff className="h-8 w-8 text-neutral-400" />

                    <h3 className="text-sm font-medium text-neutral-700">
                      {t("notifications.empty-title")}
                    </h3>

                    <p className="text-xs text-neutral-500 max-w-xs">
                      {t("notifications.empty-description")}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer/Actions */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                {notifications.length > 0 && <Button
                  type="button"
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                  onClick={() => setConfirmOpen(true)}
                >
                  <FaBroom className="h-4 w-4" />
                  {t("notifications.clear-all")}
                </Button>}
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                  {t("close")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900">
              {t("notifications.clear-confirm-title")}
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              {t("notifications.clear-confirm-description")}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
              >
                {t("cancel")}
              </Button>

              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  clearAllNotifications();
                  setConfirmOpen(false);
                }}
              >
                {t("confirm")}
              </Button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
