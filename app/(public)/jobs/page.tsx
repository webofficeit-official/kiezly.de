"use client";
import JobFilterPage from "@/components/job/list";
import JobSkeleton from "@/components/shared-ui/skeleton/job-skeleton";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<JobSkeleton count={5} />}>
      <JobFilterPage />
    </Suspense>
  );
}
