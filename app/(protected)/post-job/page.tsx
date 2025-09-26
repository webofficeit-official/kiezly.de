"use client";
import CreateJobForm from "@/components/job/add";
import React, { Suspense } from "react";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreateJobForm />
        </Suspense>
    );
}