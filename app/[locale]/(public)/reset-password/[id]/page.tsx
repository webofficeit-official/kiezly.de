"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import ResetPassword from "@/components/reset-password/reset-password";

export default function Page() {
  const { id } = useParams<{ id: string }>();

  return (
    <main className="mx-auto max-w-6xl px-4">
      <div className="min-h-[82svh] grid place-items-center py-10">
        <div className="w-full max-w-md">
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPassword id={id} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
