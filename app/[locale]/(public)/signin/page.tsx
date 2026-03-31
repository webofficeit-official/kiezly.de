"use client";
import React, { Suspense } from "react";
import Signin from "@/components/signin/signin";


export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Signin />
    </Suspense>
  );
}