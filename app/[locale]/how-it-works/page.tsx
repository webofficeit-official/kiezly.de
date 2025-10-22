'use client'

import React from 'react'
import { ShieldCheck, FileText, Send, CheckCircle2, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation';
import { useLocalizedRouter } from '@/lib/useLocalizedRouter';
import { useT } from '../layout';
import * as Icons from "lucide-react";

export default function HowItWorksPage() {
  const { push } = useLocalizedRouter();
  const t = useT("howItWorks");
  const steps = t('steps') || []
  const feesPayment = t('fees-payment.points') || []
  const trustSafety = t('trust-safety.points') || []
  const checklist = t('checklist.list') || []

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">{t('header')}</h1>
          <p className="text-neutral-600">{t('subheader')}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {Array.isArray(steps)&&steps.map((step: any, i: number) => {
            const IconComponent = getIcon(step.icon);

            return (
              <Card key={i} className="h-full">
                <CardContent className="p-5">
                  <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white">
                    <IconComponent className="h-4 w-4" /> {/* ✅ dynamic icon */}
                  </div>
                  <h3 className="font-medium">{i + 1}) {step.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('fees-payment.title')}</CardTitle></CardHeader>
            <CardContent className="p-5 text-sm text-neutral-700 space-y-2">
              {Array.isArray(feesPayment) &&
                feesPayment.map((line, idx) => (
                  <p key={idx}>• {line}</p>
                ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">{t('trust-safety.title')}</CardTitle></CardHeader>
            <CardContent className="p-5 text-sm text-neutral-700 space-y-2">
              {Array.isArray(trustSafety) &&
                trustSafety.map((line, idx) => (
                  <p key={idx} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4" />  {line}</p>
                ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('checklist.title')}</CardTitle></CardHeader>
            <CardContent className="p-5 text-sm text-neutral-700 space-y-2">
              <p className="text-xs text-neutral-500">{t('checklist.description')}</p>
              {Array.isArray(checklist) &&
                checklist.map((line, idx) => (
                  <p key={idx}>• {line}</p>
                ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <button onClick={() => push("/")} className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90">
            {t('go-back')} <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  )
}

export function getIcon(name: string): React.ElementType {
  return (Icons[name] as React.ElementType) || Icons.FileText;
}