import JobFilterPage from "@/components/job/list";
import { Loader } from "@/components/ui/loader";
import React, { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<Loader text="Loading jobs..." />}>
      <JobFilterPage />
    </Suspense>
    )
}