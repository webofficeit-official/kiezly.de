'use client'

import React from 'react'
import { ShieldCheck, FileText, Send, CheckCircle2, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <a href="/" className="font-semibold">Mini-Helfer</a>
          </div>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="/how-it-works" className="hover:opacity-80">How it works</a>
            <a href="/#categories" className="hover:opacity-80">Categories</a>
            <a href="/#trust" className="hover:opacity-80">Trust & Safety</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="/" className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50">Back to home</a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">How it works</h1>
          <p className="text-neutral-600">Simple, fast, and built for mini‑jobs in Germany.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="h-full">
            <CardContent className="p-5">
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white"><FileText className="h-4 w-4"/></div>
              <h3 className="font-medium">1) Post your job</h3>
              <p className="mt-1 text-sm text-neutral-600">Describe the tasks, time and pay. We surface your job to relevant local helpers.</p>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardContent className="p-5">
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white"><Send className="h-4 w-4"/></div>
              <h3 className="font-medium">2) Compare applicants</h3>
              <p className="mt-1 text-sm text-neutral-600">Review ratings, badges, distance and response rate. Chat to align on details.</p>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardContent className="p-5">
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white"><ShieldCheck className="h-4 w-4"/></div>
              <h3 className="font-medium">3) Hire with confidence</h3>
              <p className="mt-1 text-sm text-neutral-600">Confirm the booking and follow our mini‑job checklist (rates, registration, monthly cap).</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Fees & payment</CardTitle></CardHeader>
            <CardContent className="p-5 text-sm text-neutral-700 space-y-2">
              <p>• Posting a job is free. You only pay your helper directly according to the agreed rate.</p>
              <p>• Agree on hourly vs fixed price before the work starts. Keep a simple log of hours.</p>
              <p>• Cash or bank transfer are common for household mini‑jobs; keep receipts for your records.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Trust & safety</CardTitle></CardHeader>
            <CardContent className="p-5 text-sm text-neutral-700 space-y-2">
              <p className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4"/> Check profiles for badges like ID and First Aid.</p>
              <p className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4"/> Use in‑app chat to clarify tasks, tools and expectations.</p>
              <p className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4"/> Share only what’s necessary and arrange a brief intro meeting if helpful.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Mini‑job checklist (Germany)</CardTitle></CardHeader>
            <CardContent className="p-5 text-sm text-neutral-700 space-y-2">
              <p className="text-xs text-neutral-500">This is for information only and not legal advice.</p>
              <p>• Ensure the hourly rate meets or exceeds the legal minimum wage.</p>
              <p>• If it’s a recurring household mini‑job, register via Haushaltsscheck when required.</p>
              <p>• Keep monthly earnings within the mini‑job threshold to maintain status.</p>
              <p>• Clarify liability/accident coverage as applicable for household work.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <a href="/" className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90">
            Back to home <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </main>
    </div>
  )
}
