"use client";

import React, { useEffect, useState } from "react";
import { useMyApplications } from "@/lib/react-query/queries/apply-job";
import { MyApplications } from "@/lib/types/apply-job";
import { formatDate } from "date-fns";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useT } from "@/app/[locale]/layout";

const isNew = (createdAt: string) => {
  const hours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  return hours <= 72;
};

export default function AppliedJobList() {
  const [applications, setApplications] = useState<MyApplications[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const [status, setStatus] = useState("");
  const { push, prefetch } = useLocalizedRouter();

  const t = useT("jobs");

  const perPageOptions = [
    { label: "5", value: "5" },
    { label: "10", value: "10" },
    { label: "25", value: "25" },
    { label: "50", value: "50" },
  ];

  const statusOptions = [
    { label: t("applied.status.options.all"), value: "" },
    { label: t("applied.status.options.applied"), value: "applied" },
    { label: t("applied.status.options.shortlisted"), value: "shortlisted" },
    { label: t("applied.status.options.accepted"), value: "accepted" },
    { label: t("applied.status.options.rejected"), value: "rejected" },
    { label: t("applied.status.options.withdrawn"), value: "withdrawn" },
  ];

  const { data: mpApplications, isLoading } = useMyApplications(status, page, pageSize);

  useEffect(() => {
    if (mpApplications) {
      setApplications(mpApplications.applications);
      setTotalPages(mpApplications.total_pages);
      setTotalApplications(mpApplications.total_items || 0);
    }
  }, [mpApplications]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  const activeStatusLabel = statusOptions.find((s) => s.value === status)?.label ?? "";

  return (
    <div className="min-h-screen" style={{ background: "var(--kz-bg2)" }}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* ── Page header ──────────────────────────────────────── */}
        <header className="kz-fade-up">
          <p className="kz-section-label mb-3">Dashboard</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--kz-text)] tracking-tight">
                {t("applied.title")}
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--kz-muted)" }}>
                {totalApplications > 0
                  ? `${totalApplications} application${totalApplications !== 1 ? "s" : ""} found`
                  : "Track your job applications"}
              </p>
            </div>

            {/* Per-page select */}
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--kz-muted)" }}>
              <span>Show</span>
              <select
                value={String(pageSize)}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="rounded-lg border px-2 py-1.5 text-sm font-medium bg-white focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--kz-border2)",
                  color: "var(--kz-text)",
                }}
              >
                {perPageOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <span>per page</span>
            </div>
          </div>
        </header>

        {/* ── Status filter tabs ────────────────────────────────── */}
        <div className="kz-fade-up kz-d1 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 min-w-max">
            {statusOptions.map((opt) => {
              const active = opt.value === status;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150"
                  style={
                    active
                      ? {
                          background: "var(--kz-text)",
                          color: "#fff",
                        }
                      : {
                          background: "white",
                          color: "var(--kz-muted)",
                          border: "1px solid var(--kz-border2)",
                        }
                  }
                >
                  {opt.value && <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(opt.value)}`} />}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Cards grid ──────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse space-y-3"
                style={{ borderColor: "var(--kz-border)" }}>
                <div className="flex justify-between">
                  <div className="h-4 w-24 rounded-md bg-gray-100" />
                  <div className="h-5 w-20 rounded-full bg-gray-100" />
                </div>
                <div className="h-5 w-3/4 rounded-md bg-gray-100 mt-4" />
                <div className="h-4 w-full rounded-md bg-gray-100" />
                <div className="h-4 w-2/3 rounded-md bg-gray-100" />
                <div className="flex gap-2 mt-2">
                  <div className="h-5 w-14 rounded-full bg-gray-100" />
                  <div className="h-5 w-14 rounded-full bg-gray-100" />
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-gray-100 mt-4">
                  <div className="h-5 w-20 rounded-md bg-gray-100" />
                  <div className="h-8 w-20 rounded-full bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState status={activeStatusLabel} t={t} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {applications.map((app, idx) => (
              <ApplicationCard
                key={app.id}
                app={app}
                statusOptions={statusOptions}
                push={push}
                prefetch={prefetch}
                t={t}
                animDelay={idx < 5 ? `kz-d${Math.min(idx + 1, 5) as 1 | 2 | 3 | 4 | 5}` : ""}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────── */}
        {totalPages > 1 && (
          <nav
            className="flex items-center justify-between pt-2"
            aria-label={t("applied.pagination.aria-label")}
          >
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: "var(--kz-border2)", color: "var(--kz-text)", background: "white" }}
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t("applied.pagination.prev")}
            </button>

            <div className="flex items-center gap-1" data-testid="pager">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
                .map((n) => (
                  <button
                    key={n}
                    onClick={() => handlePageChange(n)}
                    className="w-9 h-9 rounded-full text-sm font-medium transition-all"
                    style={
                      n === page
                        ? { background: "var(--kz-text)", color: "#fff" }
                        : { color: "var(--kz-muted)", background: "transparent" }
                    }
                  >
                    {n}
                  </button>
                ))}
            </div>

            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: "var(--kz-border2)", color: "var(--kz-text)", background: "white" }}
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              {t("applied.pagination.next")}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </nav>
        )}
      </main>
    </div>
  );
}

/* ── Application card ──────────────────────────────────────── */
function ApplicationCard({
  app,
  statusOptions,
  push,
  prefetch,
  t,
  animDelay,
}: {
  app: MyApplications;
  statusOptions: { label: string; value: string }[];
  push: (path: string) => void;
  prefetch: (path: string) => void;
  t: (key: string) => string;
  animDelay: string;
}) {
  const handleNav = () => push(`/jobs/${app.job.slug}`);
  const handlePrefetch = () => prefetch(`/jobs/${app.job.slug}`);

  return (
    <article
      className={`bg-white rounded-2xl border flex flex-col justify-between overflow-hidden group hover:shadow-lg transition-all duration-200 kz-fade-up ${animDelay}`}
      style={{ borderColor: "var(--kz-border)" }}
    >
      {/* Top accent bar based on status */}
      <div className="h-1 w-full" style={{ background: getStatusAccentColor(app.status) }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Meta row */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium" style={{ color: "var(--kz-muted)" }}>
            {formatDate(app.created_at, "dd MMM, yyyy")}
          </span>
          <span className={getStatusBadgeClasses(app.status)}>
            {statusOptions.find((s) => s.value === app.status)?.label}
          </span>
        </div>

        {/* Title */}
        <h3
          className="mt-3 font-display text-base font-semibold leading-snug line-clamp-2 cursor-pointer group-hover:text-[var(--kz-accent)] transition-colors"
          style={{ color: "var(--kz-text)" }}
          onClick={handleNav}
          onMouseEnter={handlePrefetch}
        >
          {app.job.title}
        </h3>

        {/* Cover note */}
        {app.cover_note && (
          <div
            className="mt-2 text-xs line-clamp-3 leading-relaxed"
            style={{ color: "var(--kz-muted)" }}
            dangerouslySetInnerHTML={{ __html: app.cover_note }}
          />
        )}

        {/* Tags */}
        {app.job.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {app.job.tags.slice(0, 4).map((tag, i) => (
              <span key={i} className="kz-tag-green">
                {tag.name}
              </span>
            ))}
            {app.job.tags.length > 4 && (
              <span className="kz-tag-green">+{app.job.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div
          className="flex items-center justify-between mt-5 pt-4"
          style={{ borderTop: "1px solid var(--kz-border)" }}
        >
          <div>
            <p className="text-xs" style={{ color: "var(--kz-muted)" }}>
              {t("applied.proposed-rate.label")}
            </p>
            <p className="font-display text-sm font-bold mt-0.5" style={{ color: "var(--kz-text)" }}>
              {app.proposed_rate}
            </p>
          </div>

          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{ background: "var(--kz-accent)", color: "#fff" }}
            onMouseEnter={handlePrefetch}
            onClick={handleNav}
          >
            {t("applied.view")}
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */
function EmptyState({ status, t }: { status: string; t: (k: string) => string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 kz-fade-up kz-d2">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "var(--kz-bg3)" }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M4 7h20M4 14h14M4 21h9"
            stroke="var(--kz-muted)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="font-display text-base font-semibold" style={{ color: "var(--kz-text)" }}>
        {t("applied.no-jobs")}
      </h3>
      {status && (
        <p className="mt-1 text-sm" style={{ color: "var(--kz-muted)" }}>
          No {status.toLowerCase()} applications yet
        </p>
      )}
    </div>
  );
}

/* ── Status helpers ──────────────────────────────────────────── */
function getStatusBadgeClasses(status: string) {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold";
  switch (status.toLowerCase()) {
    case "accepted":
      return `${base} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200`;
    case "shortlisted":
      return `${base} bg-amber-50 text-amber-700 ring-1 ring-amber-200`;
    case "applied":
      return `${base} bg-blue-50 text-blue-700 ring-1 ring-blue-200`;
    case "rejected":
      return `${base} bg-red-50 text-red-600 ring-1 ring-red-200`;
    case "withdrawn":
      return `${base} bg-gray-100 text-gray-500 ring-1 ring-gray-200`;
    default:
      return `${base} bg-gray-100 text-gray-500`;
  }
}

function getStatusAccentColor(status: string) {
  switch (status.toLowerCase()) {
    case "accepted":    return "var(--kz-green)";
    case "shortlisted": return "#f59e0b";
    case "applied":     return "#3b82f6";
    case "rejected":    return "#ef4444";
    case "withdrawn":   return "var(--kz-border2)";
    default:            return "var(--kz-border2)";
  }
}

function getStatusDotColor(status: string) {
  switch (status.toLowerCase()) {
    case "accepted":    return "bg-emerald-500";
    case "shortlisted": return "bg-amber-400";
    case "applied":     return "bg-blue-500";
    case "rejected":    return "bg-red-500";
    case "withdrawn":   return "bg-gray-400";
    default:            return "bg-gray-300";
  }
}
