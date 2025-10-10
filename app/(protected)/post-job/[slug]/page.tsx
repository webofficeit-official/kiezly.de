"use client";
import CreateJobForm from "@/components/job/add";
import CreateEditJobForm from "@/components/job/create";
import { Loader } from "@/components/ui/loader";
import { useJob } from "@/lib/react-query/queries/useJob";
import { useParams } from "next/navigation";
import React, { Suspense } from "react";

export default function Page() {
    const params = useParams();
    const slugParam  = params.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
    const { data, isLoading, isError,refetch  } = useJob(slug || ""); // use your React Query fetch

    if (isLoading || !data) return <Loader />;
    if (isLoading) return <Loader />;
    return <CreateEditJobForm mode="edit" initialData={data}  refetchJob={refetch}/>


}