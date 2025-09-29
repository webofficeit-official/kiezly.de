"use client";
import CreateJobForm from "@/components/job/add";
import CreateEditJobForm from "@/components/job/create";
import { Loader } from "@/components/ui/loader";
import { useJob } from "@/lib/react-query/queries/useJob";
import { useParams } from "next/navigation";
import React, { Suspense } from "react";

export default function Page() {
    const params = useParams();
    const slug = params.slug;

    
    // fetch the job
     const { data, isLoading, isError } = useJob(slug as string); // use your React Query fetch


    if (isLoading) return <Loader />;
    return (
        <Suspense fallback={<Loader />}>
            {/* <CreateJobForm />  */}
            <CreateEditJobForm mode="edit" initialData={data} />
        </Suspense>
    );
}