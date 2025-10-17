"use client";

import { Suspense } from "react";
import VerifyEmailPage from "@/components/verify-email/verifyEmail";

export default function VerifyPage() {


  return <main className="mx-auto max-w-6xl px-4">
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailPage/>
    </Suspense>
  </main>
}
