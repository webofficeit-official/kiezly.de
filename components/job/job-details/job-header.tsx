import React from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  Share2,
  Bookmark,
  Building2,
  DollarSign,
  BookmarkCheck,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  addJobAsFavorite,
  unsaveJobAsFavorite,
} from "@/lib/react-query/api-handler/job-save-api";
import { useT } from "@/app/[locale]/layout";
import ReportJob from "./report-job";
// Extend dayjs with the plugin
dayjs.extend(relativeTime);

export default function JobHeader({ job, savedJobs, setSavedJobs, user }) {
  const jobDetails = job || {};

  const handleSaveJob = async () => {
    try {
      setSavedJobs((prev) => [...prev, { id: job.id }]);
      if (user) {
        await addJobAsFavorite({ jobId: job.id });
      } else {
        const localStoredJobs = localStorage.getItem("saved-jobs");
        let savedJobsLocal = [];
        if (localStoredJobs) {
          savedJobsLocal = JSON.parse(localStoredJobs);
        }
        localStorage.setItem(
          "saved-jobs",
          JSON.stringify([...savedJobsLocal, { id: job.id }])
        );
      }
    } catch (error) {
      console.error("Failed to save job:", error);
      setSavedJobs((prev) => prev.filter((j) => j.id !== job.id));
    }
  };

  const handleReportJob = async () => {
    try {
      // setSavedJobs(prev => [...prev, { id: job.id }]);
      // if (user) {
      //     await addJobAsFavorite({ jobId: job.id });
      // } else {
      //     const localStoredJobs = localStorage.getItem("saved-jobs")
      //     let savedJobsLocal = []
      //     if (localStoredJobs) {
      //         savedJobsLocal = JSON.parse(localStoredJobs)
      //     }
      //     localStorage.setItem('saved-jobs', JSON.stringify([...savedJobsLocal, { id: job.id }]))
      // }
    } catch (error) {
      console.error("Failed to save job:", error);
      setSavedJobs((prev) => prev.filter((j) => j.id !== job.id));
    }
  };

  const handleUnsave = async () => {
    try {
      setSavedJobs((prev) => prev.filter((j) => j.id !== job.id));
      if (user) {
        await unsaveJobAsFavorite(job.id);
      } else {
        const localStoredJobs = localStorage.getItem("saved-jobs");
        let savedJobsLocal = [];
        if (localStoredJobs) {
          savedJobsLocal = JSON.parse(localStoredJobs);
        }
        localStorage.setItem(
          "saved-jobs",
          JSON.stringify(savedJobsLocal.filter((j) => j.id !== job.id))
        );
      }
    } catch (error) {
      console.error("Failed to save job:", error);
      setSavedJobs((prev) => [...prev, { id: job.id }]);
    }
  };

  const t = useT("jobs");

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1
            data-testid="job-title"
            className="font-display font-bold text-[#111110] text-2xl tracking-tight leading-snug"
          >
            {jobDetails?.title}
          </h1>
          {jobDetails?.subtitle && (
            <p className="text-sm mt-1" style={{ color: "rgba(17,17,16,.5)" }}>
              {jobDetails.subtitle}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px]" style={{ color: "rgba(17,17,16,.5)" }}>
            {jobDetails?.company && (
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                {jobDetails?.company}
              </span>
            )}
            {(jobDetails?.street ||
              jobDetails?.city ||
              jobDetails?.state ||
              jobDetails?.postal_code ||
              jobDetails?.country) && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                {[
                  jobDetails?.street,
                  jobDetails?.city,
                  jobDetails?.state,
                  jobDetails?.postal_code,
                  jobDetails?.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            )}
            {jobDetails?.job_type && (
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
                {jobDetails?.job_types?.join(", ")}
                {jobDetails?.job_experiences ? ` · ${jobDetails?.job_experiences}` : ""}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#111110]">
              <DollarSign className="h-3.5 w-3.5 flex-shrink-0 text-kz-accent" />
              {jobDetails?.price_type === "range" &&
              jobDetails?.price_min &&
              jobDetails?.price_max
                ? `${jobDetails?.currency} ${jobDetails?.price_min}–${jobDetails?.price_max}`
                : jobDetails?.price_value
                ? `${jobDetails?.currency} ${jobDetails?.price_value}`
                : t("detail.header.not-specified")}
              {jobDetails?.price_type && <span className="font-normal" style={{ color: "rgba(17,17,16,.4)" }}>/ {jobDetails?.price_type}</span>}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              {t("detail.header.posted")} {dayjs(jobDetails?.created_at).fromNow()}
            </span>
            {jobDetails?.category?.name && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(232,98,42,.1)] px-2.5 py-0.5 text-[11px] font-semibold text-kz-accent">
                {jobDetails.category.name}
              </span>
            )}
            {jobDetails?.starts_at && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                {t("detail.header.start")}: {dayjs(jobDetails.starts_at).format("MMM D, YYYY")}
              </span>
            )}
            {jobDetails?.ends_at && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                {t("detail.header.end")}: {dayjs(jobDetails.ends_at).format("MMM D, YYYY")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="inline-flex items-center gap-1.5 rounded-full border border-[#d1d5db] bg-white px-3.5 py-2 text-[13px] font-medium text-[#374151] hover:bg-[#f7f7f5] transition-all"
          >
            <Share2 className="h-3.5 w-3.5" /> {t("detail.header.share")}
          </button>
          {savedJobs.some((j) => j.id === jobDetails.id) ? (
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-kz-accent bg-[rgba(232,98,42,.08)] px-3.5 py-2 text-[13px] font-medium text-kz-accent hover:bg-[rgba(232,98,42,.15)] transition-all"
              onClick={() => handleUnsave()}
            >
              <BookmarkCheck className="h-3.5 w-3.5" /> {t("detail.header.saved")}
            </button>
          ) : (
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d1d5db] bg-white px-3.5 py-2 text-[13px] font-medium text-[#374151] hover:bg-[#f7f7f5] transition-all"
              onClick={() => handleSaveJob()}
            >
              <Bookmark className="h-3.5 w-3.5" /> {t("detail.header.save")}
            </button>
          )}
          {user && user?.id != jobDetails?.client_id && <ReportJob jobId={jobDetails.id} t={t} />}
        </div>
      </div>

      {jobDetails.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {jobDetails.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-[#f7f7f5] border border-[#efefec] px-3 py-1 text-[12px] font-medium text-[#374151]"
            >
              {tag?.name}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
