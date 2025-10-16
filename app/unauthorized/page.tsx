'use client';

import { Lock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5 text-center">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
          <Lock className="h-7 w-7" />
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-900">
          Unauthorized Access
        </h1>

        {/* Subtitle */}
        <p className="mt-2 text-sm text-gray-600">
          You don’t have permission to view this page.
          <br />
          Please sign in with the correct account or create a new one.
        </p>

        {/* CTA buttons */}
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
         
        </div>

        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="mt-8 inline-flex items-center text-sm text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Go back
        </button>
      </div>
    </main>
  );
}
