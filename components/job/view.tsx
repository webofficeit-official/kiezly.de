"use client";

import React, { useEffect, useState } from "react";
import {
    Briefcase,
    MapPin,
    Clock,
    Share2,
    Bookmark,
    Building2,
    DollarSign,
    GraduationCap,
    CheckCircle2,
    ExternalLink,
    BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { useParams, useRouter } from "next/navigation";
import { useJob } from "@/lib/react-query/queries/useJob";
import { Loader } from "../ui/loader";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { JobList } from "@/lib/types/job";
import { addJobAsFavorite, getSavedJobs, unsaveJobAsFavorite } from "@/lib/react-query/api-handler/job-save-api";
import { useAuth } from "@/lib/context/auth-context";
import { useApplyJob } from "@/lib/react-query/queries/apply-job";
import Input from "../shared-ui/input/input";
import toast from "react-hot-toast";

// Extend dayjs with the plugin
dayjs.extend(relativeTime);



export default function JobDetail() {

    const [submitted, setSubmitted] = React.useState(false);
    const [open, setOpen] = React.useState(false);

    const [savedJobs, setSavedJobs] = React.useState([]);
    const [coverNote, setCoverNote] = useState('');
    const [proposedRate, setProposedRate] = useState('');
    const { user } = useAuth() // Get user from useUser hook
    const router = useRouter();
    const applyJobMutation = useApplyJob();

    useEffect(() => {
        getSavedJobs().then((data) => {
            setSavedJobs(data.jobs)
        }).catch((err) => console.log(err))
    }, [])

    const { slug } = useParams(); // get /jobs/[slug]
    const { data, isLoading, isError } = useJob(slug as string);

    if (isLoading) return <Loader />;
    if (isError) return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-red-600 text-lg">Failed to load job.</p>
        </div>
    )

    const jobDetails = data?.job;



    const handleApplySubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Simulate a submit and show a success state
        if (user && jobDetails) {
            if (!jobDetails?.id) return;
            applyJobMutation.mutate(
                {
                    jobId: jobDetails.id,
                    cover_note: coverNote,
                    proposed_rate: proposedRate,
                },
                {
                    onSuccess: (data) => {
                        toast.success("Application submitted successfully!");
                        setCoverNote("");
                        setProposedRate("");
                        setOpen(false);
                        setSubmitted(true);
                    },
                    onError: (error: any) => {
                        toast.error(error?.message || "Failed to submit application. Please try again.");
                    },
                }
            );
        }
    };

    const handleSaveJob = async (jobId: string) => {
        try {
            setSavedJobs((prev) => [...prev, { id: jobId } as JobList]);
            await addJobAsFavorite({ jobId });
        } catch (error) {
            console.error("Failed to save job:", error);
            setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
        }
    };

    const handleUnSaveJob = async (jobId: string) => {
        try {
            setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
            await unsaveJobAsFavorite(jobId);
        } catch (error) {
            console.error("Failed to save job:", error);
            setSavedJobs((prev) => [...prev, { id: jobId } as JobList]);
        }
    };



    return (
        <main className="flex-1 min-h-screen mx-auto max-w-6xl px-4 py-8">
            {/* Success banner after submit */}
            {submitted && (
                <div className="mb-6 rounded-2xl border bg-green-50 p-4 text-sm text-green-900">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Your application has been submitted. We'll get back to you soon!</span>
                    </div>
                </div>
            )}

            {/* Top section */}
            <section className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
                {/* Left: main content */}
                <div>
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
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
                                        <Button variant="outline" className="rounded-xl" onClick={() => handleUnSaveJob(jobDetails.id)}><BookmarkCheck className="mr-2 h-4 w-4" /> Saved</Button>
                                    ) : (
                                        <Button variant="outline" className="rounded-xl" onClick={() => handleSaveJob(jobDetails.id)}><Bookmark className="mr-2 h-4 w-4" /> Save</Button>
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
                        </CardHeader>

                        <Separator />

                        <CardContent className="prose prose-sm max-w-none py-6">
                            <h3 className="">About the role</h3>
                            <div dangerouslySetInnerHTML={{ __html: jobDetails?.description || "" }} />
                        </CardContent>
                    </Card>

                    {/* Family card */}
                    <div className="mt-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">About {jobDetails?.company}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                {/* <p>
                                    We are a friendly household seeking occasional support with our two kids. We value reliability, warmth, and open communication. Our home is non-smoking and located near tram/bus connections.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Badge variant="outline">2 children (3 & 6)</Badge>
                                    <Badge variant="outline">Non-smoking home</Badge>
                                    <Badge variant="outline">Pet: friendly Labrador</Badge>
                                </div> */}
                                <a href="#" className="inline-flex items-center gap-2 text-sm font-medium hover:underline">
                                    View similar babysitting jobs <ExternalLink className="h-4 w-4" />
                                </a>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right: sticky apply panel */}


                <aside className="lg:sticky lg:top-6">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Ready to apply?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {user ? (
                                // If user is logged in
                                <Dialog open={open} onOpenChange={setOpen}>
                                    <DialogTrigger asChild>
                                        <Button data-testid="apply-now" className="w-full rounded-2xl">
                                            Apply Now
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>Apply to {jobDetails.title}</DialogTitle>
                                            <DialogDescription>
                                                Please share your note and proposed rate.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <form onSubmit={handleApplySubmit} className="space-y-4">
                                            <div className="grid gap-3">
                                                {/* Cover Note */}
                                                <Textarea
                                                    label="Cover Note"
                                                    value={coverNote}        // state for cover note
                                                    onChange={setCoverNote} // function to update state
                                                    placeholder="A short note…"
                                                />

                                                {/* Proposed Rate */}
                                                <div className="grid gap-1">
                                                    <Input
                                                        label="Proposed Rate"
                                                        value={proposedRate}
                                                        onChange={setProposedRate}
                                                        type="number"
                                                        placeholder="e.g., 18"
                                                        min={0}
                                                    // error={error} // pass the error state here
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-2 pt-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setOpen(false)}
                                                    className="rounded-xl"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" className="rounded-xl">
                                                    Submit Application
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>

                                </Dialog>
                            ) : (
                                // If no user, show signup prompt
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Please{' '}
                                        <span
                                            className="text-blue-500 cursor-pointer"
                                            onClick={() => router.push('/signup')}
                                        >
                                            sign up
                                        </span>{' '}
                                        to apply for this job.
                                    </p>
                                    <Button
                                        onClick={() => router.push('/signup')}
                                        className="w-full rounded-2xl"
                                    >
                                        Sign Up
                                    </Button>
                                </div>
                            )}

                            <p className="text-xs text-muted-foreground">
                                By applying, you agree to our Terms and acknowledge our Privacy Policy.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Mini facts */}
                    <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                        {jobDetails?.police_verified && (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" /> Police Verified
                            </div>
                        )}
                        {jobDetails?.first_aid_verified && (
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" /> First-aid certified preferred
                            </div>
                        )}
                    </div>
                </aside>

            </section>
        </main>
    );
}


function Textarea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <label className="block text-sm">
            <span className="mb-1 block text-gray-700">{label}</span>
            <textarea className="w-full rounded-xl border px-3 py-2 outline-none focus:border-black" rows={4} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        </label>
    );
}