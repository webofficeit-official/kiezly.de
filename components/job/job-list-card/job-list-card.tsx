"use client";
import React from "react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobList } from "@/lib/types/job";
import { Select } from "../job-filter-select/select-option";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useT } from "@/app/[locale]/layout";
const perPageOptions = [
  { label: "5", value: "5" },
  { label: "10", value: "10" },
  { label: "25", value: "25" },
  { label: "50", value: "50" },
];

type Props = {
  jobs: JobList[];
  total: number;
  totalPages: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  savedJobs: JobList[];
  handleSaveJob: (jobId: string) => Promise<void>;
  handleUnSaveJob: (jobId: string) => Promise<void>;
};

export function JobResults({
  jobs,
  total,
  totalPages,
  page,
  setPage,
  pageSize,
  setPageSize,
  savedJobs,
  handleSaveJob,
  handleUnSaveJob,
}: Props) {
  const router = useRouter();
  const { push, prefetch } = useLocalizedRouter();

  const isNew = (created_at: string) => {
    if (!created_at) return false;
    const createdAt = new Date(created_at).getTime();
    const now = Date.now();
    const diffHours = (now - createdAt) / (1000 * 60 * 60);
    return diffHours <= 72;
  };

  const t = useT("jobs");

  return (
    <section className="space-y-4">
      {/* Stats + controls */}
      <div
        className="flex items-center justify-between px-5 py-4 rounded-[10px]"
        style={{ background: '#fff', border: '1px solid rgba(0,0,0,.07)' }}
      >
        <div>
          <h2 className="font-display font-bold text-[15px] text-[#111110]">
            {t("list.total-jobs", { total })}
          </h2>
          <p className="text-[12px] mt-[2px]" style={{ color: 'rgba(17,17,16,.45)' }}>
            {t("list.page-out-of", { page, totalPages })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            label={t("list.per-page.label")}
            value={String(pageSize)}
            onChange={(v: string) => { setPageSize(Number(v)); setPage(1); }}
            options={perPageOptions}
          />
        </div>
      </div>

      {/* Job cards */}
      <div className="grid grid-cols-1 gap-3">
        {jobs.map((job) => (
          <article
            key={job.id}
            className="flex flex-col sm:flex-row gap-4 p-5 rounded-[10px] transition-all cursor-pointer"
            style={{ background: '#fff', border: '1px solid rgba(0,0,0,.07)' }}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,.13)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,.06)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,.07)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Mobile: top row */}
              <div className="sm:hidden mb-2 flex items-center justify-between">
                {isNew(job?.created_at) ? (
                  <span className="kz-tag-green">{t("list.new")}</span>
                ) : (
                  <span className="text-[11px]" style={{ color: 'rgba(17,17,16,.35)' }}>
                    {t("list.posted")} {new Date(job?.created_at).toLocaleDateString()}
                  </span>
                )}
                <button
                  className="p-1.5 rounded-[6px] transition-colors"
                  style={{ border: '1px solid rgba(0,0,0,.1)', background: 'transparent' }}
                  onClick={() => savedJobs.some((j) => j.id === job.id) ? handleUnSaveJob(job.id) : handleSaveJob(job.id)}
                >
                  {savedJobs.some((j) => j.id === job.id)
                    ? <BookmarkCheck className="h-3.5 w-3.5" style={{ color: '#1a9e5f' }} />
                    : <Bookmark className="h-3.5 w-3.5" style={{ color: 'rgba(17,17,16,.45)' }} />
                  }
                </button>
              </div>

              {/* Title */}
              <h3
                className="font-display font-bold text-[16px] text-[#111110] truncate hover:text-[#e8622a] transition-colors"
                onMouseEnter={() => prefetch(`/jobs/${job.slug}`)}
                onClick={() => push(`/jobs/${job.slug}`)}
              >
                {job.title}
              </h3>
              {job.subtitle && (
                <p className="text-[13px] mt-[2px]" style={{ color: 'rgba(17,17,16,.45)' }}>{job.subtitle}</p>
              )}

              {/* Meta row */}
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px]" style={{ color: 'rgba(17,17,16,.55)' }}>
                <span className="font-semibold" style={{ color: '#1a9e5f' }}>
                  {job?.price_type === "range" && job?.price_min && job?.price_max
                    ? `${job.currency} ${job.price_min} – ${job.price_max}`
                    : job?.price_value
                    ? `${job.currency} ${job.price_value}`
                    : t("list.Not specified")}
                  {job?.price_type && ` / ${job.price_type}`}
                </span>
                {[job?.street, job?.city, job?.state, job?.postal_code, job?.countries?.name].filter(Boolean).length > 0 && (
                  <span>· {[job?.street, job?.city, job?.state, job?.postal_code, job?.countries?.name].filter(Boolean).join(", ")}</span>
                )}
                {job?.distance && <span>· {(job.distance / 1000).toFixed(2)} {t("list.away")}</span>}
                {job?.category_name && <span>· {job.category_name}</span>}
                {job?.job_types && <span>· {job.job_types.join(", ")}</span>}
                {job?.starts_at && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {t("list.start")}: {dayjs(job.starts_at).format("MMM D, YYYY")}
                  </span>
                )}
                {job?.ends_at && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {t("list.end")}: {dayjs(job.ends_at).format("MMM D, YYYY")}
                  </span>
                )}
              </div>

              {/* Tags */}
              {job.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {job.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-[3px] text-[11px] font-medium rounded-full"
                      style={{ background: '#f7f7f5', color: 'rgba(17,17,16,.55)', border: '1px solid rgba(0,0,0,.07)' }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              <div
                className="mt-2 text-[13px] line-clamp-2 leading-[1.6]"
                style={{ color: 'rgba(17,17,16,.5)' }}
                dangerouslySetInnerHTML={{ __html: job.description }}
              />

              {/* Mobile view button */}
              <div className="sm:hidden mt-3">
                <button
                  className="inline-flex items-center justify-center h-[34px] px-4 rounded-[7px] text-[12px] font-medium text-[#111110] transition-colors"
                  style={{ border: '1px solid rgba(0,0,0,.13)', background: 'transparent' }}
                  onMouseEnter={() => prefetch(`/jobs/${job.slug}`)}
                  onClick={() => push(`/jobs/${job.slug}`)}
                >
                  {t("list.view")} →
                </button>
              </div>
            </div>

            {/* Right side (desktop) */}
            <div className="hidden sm:flex flex-col justify-between items-end gap-3 min-w-[110px]">
              <div className="flex flex-col items-end gap-2">
                {isNew(job?.created_at) ? (
                  <span className="kz-tag-green">{t("list.new")}</span>
                ) : (
                  <span className="text-[11px]" style={{ color: 'rgba(17,17,16,.35)' }}>
                    {t("list.posted")} {new Date(job?.created_at).toLocaleDateString()}
                  </span>
                )}
                <button
                  className="p-1.5 rounded-[6px] transition-colors"
                  style={{ border: '1px solid rgba(0,0,0,.1)', background: 'transparent' }}
                  onClick={() => savedJobs.some((j) => j.id === job.id) ? handleUnSaveJob(job.id) : handleSaveJob(job.id)}
                >
                  {savedJobs.some((j) => j.id === job.id)
                    ? <BookmarkCheck className="h-4 w-4" style={{ color: '#1a9e5f' }} />
                    : <Bookmark className="h-4 w-4" style={{ color: 'rgba(17,17,16,.45)' }} />
                  }
                </button>
              </div>
              <button
                className="inline-flex items-center justify-center h-[34px] px-4 rounded-[7px] text-[12px] font-semibold text-white transition-colors"
                style={{ background: '#e8622a', border: 'none' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#d4561f'; prefetch(`/jobs/${job.slug}`); }}
                onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#e8622a'; }}
                onClick={() => push(`/jobs/${job.slug}`)}
              >
                {t("list.view")} →
              </button>
            </div>
          </article>
        ))}

        {jobs.length === 0 && (
          <div
            className="rounded-[10px] p-12 text-center"
            style={{ background: '#f7f7f5', border: '1px solid rgba(0,0,0,.07)' }}
          >
            <div className="text-[32px] mb-3">🔍</div>
            <p className="font-display font-semibold text-[15px] text-[#111110] mb-1">{t("list.no-jobs")}</p>
            <p className="text-[13px]" style={{ color: 'rgba(17,17,16,.45)' }}>Versuche andere Filter oder eine andere Suche.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <nav className="flex items-center justify-between gap-2 pt-2" aria-label={t("list.pagination.aria-label")}>
        <button
          className="h-[36px] px-4 rounded-[7px] text-[13px] font-medium transition-colors disabled:opacity-30"
          style={{ border: '1px solid rgba(0,0,0,.13)', background: 'transparent', color: 'rgba(17,17,16,.65)' }}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          ← {t("list.pagination.prev")}
        </button>
        <div className="flex items-center gap-1" data-testid="pager">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
            .map((n) => (
              <button
                key={n}
                className="h-[36px] w-[36px] rounded-[7px] text-[13px] font-medium transition-colors"
                style={{
                  border: '1px solid rgba(0,0,0,.13)',
                  background: n === page ? '#111110' : 'transparent',
                  color: n === page ? '#fff' : 'rgba(17,17,16,.65)',
                }}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
        </div>
        <button
          className="h-[36px] px-4 rounded-[7px] text-[13px] font-medium transition-colors disabled:opacity-30"
          style={{ border: '1px solid rgba(0,0,0,.13)', background: 'transparent', color: 'rgba(17,17,16,.65)' }}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          {t("list.pagination.next")} →
        </button>
      </nav>
    </section>
  );
}
