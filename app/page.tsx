'use client'

import React from 'react'
import { Baby, Dog, Leaf, PartyPopper, ShoppingCart, Users, Sparkles, ShieldCheck, MapPin, Search, ArrowRight, CheckCircle2, Clock, FileText, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const CATEGORIES = [
  { key: 'childcare', label: 'Childcare', icon: Baby },
  { key: 'cleaning', label: 'Cleaning', icon: Sparkles },
  { key: 'petcare', label: 'Pet care', icon: Dog },
  { key: 'seniors', label: 'Senior support', icon: Users },
  { key: 'errands', label: 'Errands', icon: ShoppingCart },
  { key: 'garden', label: 'Garden', icon: Leaf },
  { key: 'events', label: 'Events', icon: PartyPopper },
]

export default function Page() {
  const [what, setWhat] = React.useState('')
  const [where, setWhere] = React.useState('')
  const doSearch = () => { /* demo only */ }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white text-neutral-900">
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
      <a href="#" className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50">Become a helper</a>
      <a href="#" className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90">Post a mini‑job</a>
    </div>
  </div>
</header>

      <section className="mx-auto max-w-6xl px-4 pb-10 pt-12">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              Find trusted help for <span className="underline decoration-neutral-300">everyday mini‑jobs</span>
            </h1>
            <p className="mt-3 text-neutral-600 md:text-lg">
              Babysitting, cleaning, pet sitting, senior support and more — book local, verified helpers in minutes.
            </p>

            <Card className="mt-6 shadow-sm">
              <CardContent className="p-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <Label className="mb-1">What</Label>
                    <div className="relative">
                      <Input placeholder="e.g., Babysitting" value={what} onChange={(e)=>setWhat(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && doSearch()} />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1">Where</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                      <Input className="pl-9" placeholder="City or postcode" value={where} onChange={(e)=>setWhere(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && doSearch()} />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full" onClick={doSearch}><Search className="mr-2 h-4 w-4" /> Search</Button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-neutral-500">Tip: use your neighborhood (e.g., "Braunschweig, Weststadt") to see nearby helpers.</p>
              </CardContent>
            </Card>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-600">
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> ID verified</span>
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> First Aid badge</span>
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Police certificate (optional)</span>
            </div>
          </div>

          <div className="">
            <Card className="rounded-3xl border-neutral-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-neutral-700">Popular right now near you</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3">
                {CATEGORIES.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="rounded-2xl border p-3 hover:shadow-sm">
                    <div className="mb-2 flex items-center gap-2"><Icon className="h-4 w-4" /><span className="text-sm font-medium">{label}</span></div>
                    <div className="text-xs text-neutral-500">from €15/h</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Teaser that links to the dedicated page */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <p className="text-neutral-600">Simple, fast, and built for mini‑jobs in Germany.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="h-full">
            <CardContent className="p-5">
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white"><FileText className="h-4 w-4"/></div>
              <h3 className="font-medium">1) Post your job</h3>
              <p className="mt-1 text-sm text-neutral-600">Describe tasks, time, and pay. Auto‑invite nearby helpers.</p>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardContent className="p-5">
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white"><Send className="h-4 w-4"/></div>
              <h3 className="font-medium">2) Compare applicants</h3>
              <p className="mt-1 text-sm text-neutral-600">See distance, ratings, badges, and response rate. Chat to align.</p>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardContent className="p-5">
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white"><ShieldCheck className="h-4 w-4"/></div>
              <h3 className="font-medium">3) Hire with confidence</h3>
              <p className="mt-1 text-sm text-neutral-600">After hiring, follow the household mini‑job checklist & stay within the monthly cap.</p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6">
          <a href="/how-it-works" className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90">
            Learn more <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">Browse categories</h2>
          <p className="text-neutral-600">From quick chores to recurring help.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map(({ key, label, icon: Icon }) => (
            <Card key={key} className="group hover:shadow-sm">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white"><Icon className="h-4 w-4" /></div>
                  <h3 className="font-medium">{label}</h3>
                </div>
                <p className="text-sm text-neutral-600">Typical tasks · from €15/h</p>
                <div className="mt-3">
                  <button className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50">Post a {label} job</button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="trust" className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">Trust & Safety</h2>
          <p className="text-neutral-600">Verification and guidance tailored to German mini‑jobs.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white"><CheckCircle2 className="h-4 w-4"/></div>
              <h3 className="font-medium">Verified badges</h3>
              <p className="mt-1 text-sm text-neutral-600">ID check, First Aid, and optional enhanced police certificate (for childcare) highlighted on profiles.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white"><Clock className="h-4 w-4"/></div>
              <h3 className="font-medium">Clear rates & availability</h3>
              <p className="mt-1 text-sm text-neutral-600">Filter by distance, time window, price, languages, and badges. Keep everything local.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white"><ShieldCheck className="h-4 w-4"/></div>
              <h3 className="font-medium">Mini‑job guidance</h3>
              <p className="mt-1 text-sm text-neutral-600">In‑app checklist for Haushaltsscheck registration, minimum wage, and monthly cap reminders.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-6">
        <Card className="border-neutral-200 bg-gradient-to-br from-neutral-50 to-white">
          <CardContent className="flex flex-col items-start gap-3 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold">Ready to find help?</h3>
              <p className="text-neutral-600">Post your mini‑job for free — start getting applications today.</p>
            </div>
            <div className="flex gap-2">
              <a href="#" className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90">Post a mini‑job</a>
              <a href="#" className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50">Become a helper</a>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t">
  <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-neutral-600 md:flex-row">
    <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /><span>Mini-Helfer</span></div>
    <div className="flex flex-wrap items-center gap-4">
      <a className="hover:opacity-80" href="#">Impressum</a>
      <a className="hover:opacity-80" href="#">Privacy</a>
      <a className="hover:opacity-80" href="#">Terms</a>
    </div>
  </div>
</footer>
    </div>
  )
}
