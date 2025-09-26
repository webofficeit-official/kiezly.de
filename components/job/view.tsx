"use client";

import React from "react";
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
    Home,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import { useJob } from "@/lib/react-query/queries/useJob";
import { Loader } from "../ui/loader";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend dayjs with the plugin
dayjs.extend(relativeTime);



export default function JobDetail() {

    const [submitted, setSubmitted] = React.useState(false);
    const [open, setOpen] = React.useState(false);

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
        setSubmitted(true);
        setOpen(false);
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
                                    <Button variant="outline" className="rounded-xl"><Bookmark className="mr-2 h-4 w-4" /> Save</Button>
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
                            {/* removed part */}
                            {/* <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button data-testid="apply-now" className="w-full rounded-2xl">Apply Now</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Apply to {job.title}</DialogTitle>
                                        <DialogDescription>
                                            Please share your details, availability, and attach your CV/references. Fields marked with * are required.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <form onSubmit={handleApplySubmit} className="space-y-4">
                                        <div className="grid gap-3">
                                            <div className="grid gap-1">
                                                <Label htmlFor="name">Full Name *</Label>
                                                <Input id="name" name="name" placeholder="Your full name" required />
                                            </div>
                                            <div className="grid gap-1">
                                                <Label htmlFor="email">Email *</Label>
                                                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                                            </div>
                                            <div className="grid gap-1">
                                                <Label htmlFor="phone">Phone</Label>
                                                <Input id="phone" name="phone" type="tel" placeholder="Optional" />
                                            </div>
                                            <div className="grid gap-1">
                                                <Label htmlFor="availability">Availability *</Label>
                                                <Input id="availability" name="availability" placeholder="e.g., Mon–Thu 18:00–21:00; weekends flexible" required />
                                            </div>
                                            <div className="grid gap-1">
                                                <Label htmlFor="rate">Expected hourly rate</Label>
                                                <Input id="rate" name="rate" type="number" step="0.5" placeholder="e.g., 18" />
                                            </div>
                                            <div className="grid gap-1">
                                                <Label htmlFor="resume">CV / Police Certificate (PDF) *</Label>
                                                <Input id="resume" name="resume" type="file" accept=".pdf" required />
                                            </div>
                                            <div className="grid gap-1">
                                                <Label htmlFor="cover">Cover Letter</Label>
                                                <Textarea id="cover" name="cover" placeholder="A short note…" className="min-h-[120px]" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 pt-2">
                                            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
                                            <Button type="submit" className="rounded-xl">Submit Application</Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog> */}

                            <Button className="w-full rounded-2xl" aria-label="Apply with Kiezly Profile">
                                Apply with Kiezly Profile
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                By applying, you agree to our Terms and acknowledge our Privacy Policy.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Mini facts */}
                    <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                        {jobDetails?.police_verified &&(<div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Police Verified</div>)}
                        {jobDetails?.first_aid_verified&& (<div className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> First-aid certified preferred</div>)}
                    </div>
                </aside>
            </section>
        </main>
    );
}