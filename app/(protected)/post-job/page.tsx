"use client";
import CreateJobForm from "@/components/job/add";
import CreateEditJobForm from "@/components/job/create";
import React, { Suspense } from "react";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            {/* <CreateJobForm /> */}
           <CreateEditJobForm/>
        </Suspense>
    );
}