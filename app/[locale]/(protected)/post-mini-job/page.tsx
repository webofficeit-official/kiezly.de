"use client";
import CreateEditJobForm from "@/components/job/create";
import React, { Suspense } from "react";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>         
           <CreateEditJobForm mode="create"/>
        </Suspense>
    );
}