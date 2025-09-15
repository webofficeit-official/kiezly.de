"use client";
import React, { Suspense } from "react";
import Signup from "@/components/signup/signup";


export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <Signup />
      </Suspense>
    </main>
  );
}
