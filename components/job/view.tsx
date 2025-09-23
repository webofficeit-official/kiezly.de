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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
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

// Drop this file into a Next.js route (e.g., app/jobs/[id]/page.tsx) and it will render a modern Job Detail screen
// with an inline "Apply" flow using shadcn/ui components + Tailwind. Everything is client-side for mock/demo.

export default function JobDetail() {
    
    const [submitted, setSubmitted] = React.useState(false);
    const [open, setOpen] = React.useState(false);

    const { id } = useParams(); // get /jobs/[id]
    const { data, isLoading, isError } = useJob(id as string);

    if (isLoading) return <Loader/>;
    if (isError) return <p className="p-8 text-red-600">Failed to load job.</p>;

    const jobDetails= data?.job;

     const job = {
        title: "Babysitter / Childcare Helper",
        company: "The Müller Family",
        location: "Braunschweig, Germany (Gliesmarode)",
        type: "Part-time / On-demand",
        level: "Experienced",
        salary: "€15–€20 / hour",
        posted: "3 days ago",
        tags: [
            "Babysitting",
            "Childcare",
            "First Aid",
            "German A2+",
            "Evenings & Weekends",
        ],
        description:
            "We are looking for a warm, reliable babysitter to look after two children (3 and 6) a few evenings per week and occasional weekends. Tasks include playtime, simple meals, bedtime routine, and light tidying related to the children.",
        responsibilities: [
            "Engage kids with age-appropriate play and activities.",
            "Prepare simple meals/snacks and assist with feeding.",
            "Handle bath and bedtime routine; read stories.",
            "Ensure safety at all times and keep common areas tidy.",
            "Communicate updates to parents via WhatsApp/SMS.",
        ],
        requirements: [
            "Proven babysitting/childcare experience with references.",
            "Valid first-aid certificate for children (or willingness to obtain).",
            "Clean police clearance (Führungszeugnis) preferred.",
            "Basic German (A2+) or good English; friendly and patient.",
            "Non-smoker; comfortable with a friendly dog.",
        ],
        benefits: [
            "Flexible scheduling; mostly evenings/weekends",
            "Fair hourly rate; transport reimbursement by arrangement",
            "Snacks/meal provided during longer shifts",
            "Friendly, respectful family environment",
        ],
    } as const;

    const handleApplySubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Simulate a submit and show a success state
        setSubmitted(true);
        setOpen(false);
    };



    return (
        <main className="mx-auto max-w-6xl px-4 py-8">
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
                                    <h1 data-testid="job-title" className="text-2xl font-semibold tracking-tight">{jobDetails.title}</h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                        <span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" />{job.company}</span>
                                        <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
                                        <span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.type} · {job.level}</span>
                                        <span className="inline-flex items-center gap-1"><DollarSign className="h-4 w-4" />{job.salary}</span>
                                        <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />Posted {dayjs(jobDetails.created_at).fromNow()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" className="rounded-xl"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                                    <Button variant="outline" className="rounded-xl"><Bookmark className="mr-2 h-4 w-4" /> Save</Button>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {job.tags.map((t) => (
                                    <>
                                        {/* <Badge key={t} variant="secondary" className="rounded-full px-3 py-1"> */}
                                        {t}
                                        {/* </Badge> */}
                                    </>
                                ))}
                            </div>
                        </CardHeader>

                        {/* <Separator /> */}

                        <CardContent className="prose prose-sm max-w-none py-6">
                            <h3>About the role</h3>
                            <p>{job.description}</p>

                            <h3>Responsibilities</h3>
                            <ul>
                                {job.responsibilities.map((r) => (
                                    <li key={r}>{r}</li>
                                ))}
                            </ul>

                            <h3>Requirements</h3>
                            <ul>
                                {job.requirements.map((r) => (
                                    <li key={r}>{r}</li>
                                ))}
                            </ul>

                            <h3>Benefits</h3>
                            <ul>
                                {job.benefits.map((b) => (
                                    <li key={b}>{b}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Family card */}
                    <div className="mt-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">About {job.company}</CardTitle>
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
                        <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> ID verified family</div>
                        <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> First-aid certified preferred</div>
                    </div>
                </aside>
            </section>
        </main>
    );
}