import React from "react";
import { Button } from "@/components/ui/button";
import {
    Briefcase,
    MapPin,
    Clock,
    Share2,
    Bookmark,
    Building2,
    DollarSign,
    CheckCircle2,
    BookmarkCheck,
    Ban,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { addJobAsFavorite, unsaveJobAsFavorite } from "@/lib/react-query/api-handler/job-save-api";
import { useT } from "@/app/[locale]/layout";
import ReportJob from "./report-job";
// Extend dayjs with the plugin
dayjs.extend(relativeTime);


export default function JobHeader({ job, savedJobs, setSavedJobs, user }) {

    const jobDetails = job || {};

    const handleSaveJob = async () => {
        try {
            setSavedJobs(prev => [...prev, { id: job.id }]);
            if (user) {
                await addJobAsFavorite({ jobId: job.id });
            } else {
                const localStoredJobs = localStorage.getItem("saved-jobs")
                let savedJobsLocal = []
                if (localStoredJobs) {
                    savedJobsLocal = JSON.parse(localStoredJobs)
                }
                localStorage.setItem('saved-jobs', JSON.stringify([...savedJobsLocal, { id: job.id }]))
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
            setSavedJobs(prev => prev.filter(j => j.id !== job.id));
            if (user) {
                await unsaveJobAsFavorite(job.id);
            } else {
                const localStoredJobs = localStorage.getItem("saved-jobs")
                let savedJobsLocal = []
                if (localStoredJobs) {
                    savedJobsLocal = JSON.parse(localStoredJobs)
                }
                localStorage.setItem('saved-jobs', JSON.stringify(savedJobsLocal.filter((j) => j.id !== job.id)))
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
                <div>
                    <h1 data-testid="job-title" className="text-2xl font-semibold tracking-tight">{jobDetails?.title}</h1>
                    {jobDetails?.subtitle && (
                        <h2 className="text-sm text-muted-foreground mt-1">
                            {jobDetails.subtitle}
                        </h2>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {jobDetails?.company && (<span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" />{jobDetails?.company}</span>)}
                        {(jobDetails?.street || jobDetails?.city || jobDetails?.state || jobDetails?.postal_code || jobDetails?.country) && (
                            <span className="inline-flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {[
                                    jobDetails?.street,
                                    jobDetails?.city,
                                    jobDetails?.state,
                                    jobDetails?.postal_code,
                                    jobDetails?.country
                                ].filter(Boolean).join(", ")}
                            </span>
                        )}

                        {jobDetails?.job_type && (<span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4" /> {jobDetails?.job_types?.join(", ")} {jobDetails?.job_experiences ? `. ${jobDetails?.job_experiences}` : ""}</span>)}
                        <span className="inline-flex items-center">
                            {jobDetails?.price_type === "range" && jobDetails?.price_min && jobDetails?.price_max
                                ? `${jobDetails?.currency} ${jobDetails?.price_min}–${jobDetails?.price_max}`
                                : jobDetails?.price_value
                                    ? `${jobDetails?.currency} ${jobDetails?.price_value}`
                                    : t("detail.header.not-specified")}
                        </span>
                        {jobDetails?.price_type && <span className="inline-flex items-center">/ {jobDetails?.price_type}</span>}
                        <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{t("detail.header.posted")} {dayjs(jobDetails?.created_at).fromNow()}</span>

                        {jobDetails?.category?.name && (
                            <span className="inline-flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> {jobDetails.category.name}
                            </span>
                        )}

                        {jobDetails?.starts_at && (
                            <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {t("detail.header.start")}: {dayjs(jobDetails.starts_at).format("MMM D, YYYY")}
                            </span>
                        )}

                        {jobDetails?.ends_at && (
                            <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {t("detail.header.end")}: {dayjs(jobDetails.ends_at).format("MMM D, YYYY")}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl"><Share2 className="mr-2 h-4 w-4" /> {t("detail.header.share")}</Button>
                    {savedJobs.some((j) => j.id === jobDetails.id) ? (
                        <Button variant="outline" className="rounded-xl" onClick={() => handleUnsave()}><BookmarkCheck className="mr-2 h-4 w-4" /> {t("detail.header.saved")}</Button>
                    ) : (
                        <Button variant="outline" className="rounded-xl" onClick={() => handleSaveJob()}><Bookmark className="mr-2 h-4 w-4" /> {t("detail.header.save")}</Button>
                    )}
                    <ReportJob 
                        jobId={jobDetails.id}
                        t={t}
                    />
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {jobDetails.tags.length > 0 && jobDetails.tags.map((t, index) => (

                    <Badge key={index} variant="secondary" className="rounded-full px-3 py-1">
                        {t?.name}
                    </Badge>

                ))}
            </div>
        </>
    );
}
