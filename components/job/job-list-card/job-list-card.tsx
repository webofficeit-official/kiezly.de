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
  const { push,prefetch } = useLocalizedRouter();

  const isNew = (created_at: string) => {
    if (!created_at) return false;
    const createdAt = new Date(created_at).getTime();
    const now = Date.now();
    const diffHours = (now - createdAt) / (1000 * 60 * 60);
    return diffHours <= 72;
  };

  const t = useT("jobs");

  return (
    <section className="lg:col-span-2 space-y-4">
      {/* Stats + controls */}
      <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t("list.total-jobs", { total })}</h2>
          <p className="text-sm text-gray-600">
            {t("list.page-out-of", { page, totalPages })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            label={t("list.per-page.label")}
            value={String(pageSize)}
            onChange={(v: string) => {
              const newSize = Number(v);
              setPageSize(newSize);
              setPage(1);
            }}
            options={perPageOptions}

          />
        </div>
      </div>

      {/* Job Results */}
      <div className="relative">

        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <article
              key={job.id}
              className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
            >
              {/* Main content */}
              <div className="flex-1 min-w-0">
                <h3
                  className="text-base sm:text-lg font-semibold truncate cursor-pointer"
                   onMouseEnter={() => prefetch(`/jobs/${job.slug}`)}
                  onClick={() => push(`/jobs/${job.slug}`)}
                >
                  {job.title}
                </h3>
                {job.subtitle && (
                  <p className="text-sm text-gray-500">{job.subtitle}</p>
                )}

                <div className="mt-1 text-sm text-gray-700 flex flex-wrap gap-x-3 gap-y-1">
                  <span className="inline-flex items-center">
                    {job?.price_type === "range" &&
                      job?.price_min &&
                      job?.price_max
                      ? `${job.currency} ${job.price_min} – ${job.price_max}`
                      : job?.price_value
                        ? `${job.currency} ${job.price_value}`
                        : t("list.Not specified")}
                    {job?.price_type && (
                      <span className="inline-flex items-center gap-1">
                        / {job.price_type}
                      </span>
                    )}
                  </span>
                  <span>
                    •{" "}
                    {[
                      job?.street,
                      job?.city,
                      job?.state,
                      job?.postal_code,
                      job?.countries?.name,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                  {job?.distance && (
                    <span>• {(job.distance / 1000).toFixed(2)}  {t("list.away")}</span>
                  )}
                  {job?.category_name && <span>• {job.category_name}</span>}
                  {job?.job_type && <span>• {job.job_type.join(", ")}</span>}
                  {job?.job_experience?.length > 0 && (
                    <span>• {job.job_experience.join(", ")}</span>
                  )}
                  {job?.starts_at && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />  {t("list.start")}:{" "}
                      {dayjs(job.starts_at).format("MMM D, YYYY")}
                    </span>
                  )}
                  {job?.ends_at && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />  {t("list.end")}:{" "}
                      {dayjs(job.ends_at).format("MMM D, YYYY")}
                    </span>
                  )}
                </div>

                {/* Job tag badges */}
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {job.tags?.length > 0 &&
                    job.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 bg-gray-100 rounded-full"
                      >
                        {tag.name}
                      </span>
                    ))}
                </div>

                <div
                  className="mt-2 text-sm text-gray-600 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </div>

              {/* Right-side controls */}
              <div className="flex flex-col justify-between items-end min-h-[80px]">
                <div className="text-xs text-gray-500">
                  {isNew(job?.created_at) ? (
                    <Button
                      variant="outline"
                      className="rounded-xl px-2 text-xs flex items-center gap-1 bg-green-100 mr-1 hover:bg-green-100"
                    >
                      <span className="h-3"> {t("list.new")}</span>
                    </Button>
                  ) : (
                    `${t("list.posted")} ${new Date(job?.created_at).toLocaleDateString()}`
                  )}

                  {savedJobs.some((j) => j.id === job.id) ? (
                    <Button
                      variant="default"
                      className="rounded-xl px-2 py-1 text-xs flex items-center gap-1 bg-green-50 text-green-700 border border-green-200"
                      onClick={() => handleUnSaveJob(job.id)}
                    >
                      <BookmarkCheck className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="rounded-xl px-2 py-1 text-xs flex items-center gap-1"
                      onClick={() => handleSaveJob(job.id)}
                    >
                      <Bookmark className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <button
                  className="mt-2 inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                  onMouseEnter={() => prefetch(`/jobs/${job.slug}`)}
                  onClick={() => push(`/jobs/${job.slug}`)}
                >
                  {t("list.view")}
                </button>
              </div>
            </article>
          ))}

          {jobs.length === 0 && (
            <div className="bg-white rounded-2xl border p-6 text-center text-sm text-gray-600">
              {t("list.no-jobs")}
            </div>
          )}
        </div>

      </div>

      {/* Pagination */}
      <nav
        className="flex items-center justify-between gap-2"
        aria-label={t("list.pagination.aria-label")}
      >
        <button
          className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          {t("list.pagination.prev")}
        </button>
        <div className="flex items-center gap-1" data-testid="pager">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
            .map((n) => (
              <button
                key={n}
                className={`rounded-xl border px-3 py-2 text-sm ${n === page ? "bg-black text-white" : ""
                  }`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
        </div>
        <button
          className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          {t("list.pagination.next")}
        </button>
      </nav>
    </section>
  );
}
