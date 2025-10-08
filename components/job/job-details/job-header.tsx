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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { addJobAsFavorite, unsaveJobAsFavorite } from "@/lib/react-query/api-handler/job-save-api";
// Extend dayjs with the plugin
dayjs.extend(relativeTime);


export default function JobHeader({ job, savedJobs, setSavedJobs }) {

    const jobDetails = job || {};
 
    const handleSaveJob = async () => {
        setSavedJobs(prev => [...prev, { id: job.id }]);
        await addJobAsFavorite({ jobId: job.id });
    };

    const handleUnsave = async () => {
        setSavedJobs(prev => prev.filter(j => j.id !== job.id));
        await unsaveJobAsFavorite(job.id);
    };

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

                        {jobDetails?.job_type && (<span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4" /> {jobDetails?.job_type.join(", ")} {jobDetails?.job_experience ? `. ${jobDetails?.job_experience}` : ""}</span>)}
                        <span className="inline-flex items-center gap-1"><DollarSign className="h-4 w-4" />
                            {jobDetails?.price_min && jobDetails?.price_max
                                ? `${jobDetails?.currency} ${jobDetails?.price_min}–${jobDetails?.price_max}`
                                : jobDetails?.price_min
                                    ? `${jobDetails?.currency} ${jobDetails?.price_min}`
                                    : jobDetails?.price_max
                                        ? `${jobDetails?.currency} ${jobDetails?.price_max}`
                                        : "Not specified"}
                        </span>
                        {jobDetails?.price_type && <span className="inline-flex items-center gap-1">/ {jobDetails?.price_type}</span>}
                        <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />Posted {dayjs(jobDetails?.created_at).fromNow()}</span>

                        {jobDetails?.category?.name && (
                            <span className="inline-flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> {jobDetails.category.name}
                            </span>
                        )}

                        {jobDetails?.starts_at && (
                            <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Start: {dayjs(jobDetails.starts_at).format("MMM D, YYYY")}
                            </span>
                        )}

                        {jobDetails?.ends_at && (
                            <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" /> End: {dayjs(jobDetails.ends_at).format("MMM D, YYYY")}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                    {savedJobs.some((j) => j.id === jobDetails.id) ? (
                        <Button variant="outline" className="rounded-xl" onClick={() => handleUnsave()}><BookmarkCheck className="mr-2 h-4 w-4" /> Saved</Button>
                    ) : (
                        <Button variant="outline" className="rounded-xl" onClick={() => handleSaveJob()}><Bookmark className="mr-2 h-4 w-4" /> Save</Button>
                    )}
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {jobDetails.tags.length > 0 && jobDetails.tags.map((t) => (
                    <>
                        <Badge key={t} variant="secondary" className="rounded-full px-3 py-1">
                            {t?.name}
                        </Badge>
                    </>
                ))}
            </div>
        </>
    );
}
