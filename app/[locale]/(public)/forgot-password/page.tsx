"use client";
import ForgotPassword from "@/components/password-reset/password-forgot";
import React, { Suspense } from "react";

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-4">
      {/* This wrapper controls height + centering */}
      <div className="min-h-[82svh] grid place-items-center py-10">
        {/* Cap the form/card width so it fits nicely */}
        <div className="w-full max-w-md">
          <Suspense fallback={<div>Loading...</div>}>
            <ForgotPassword />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
