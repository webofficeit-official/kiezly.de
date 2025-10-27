"use client";
import React, { Suspense } from "react";
import Signin from "@/components/signin/signin";


export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <Signin />
      </Suspense>
    </main>
  );
}