'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation';
import { useLocalizedRouter } from '@/lib/useLocalizedRouter';

export default function ImpressumPage() {
    const router = useRouter();
    const { push } = useLocalizedRouter();

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
            <main className="mx-auto max-w-6xl px-4 py-6">
                <div className="mb-4">
                    <h1 className="text-2xl font-semibold">Impressum</h1>
                </div>

                <div className="mt-6">
                    <Card>
                        <CardContent className="p-5 text-sm text-neutral-700 space-y-2">
                            <div
                                className={`w-full inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium transition-colors rounded-lg rounded-full px-3 py-2 bg-gray-50 text-gray-600 border border-gray-200`}
                            >
                                <b>Stand</b>: 16. Oktober 2025
                            </div>
                            <div className='py-1'>
                                <h3 className='text-lg font-medium text-gray-800 mb-1'>Angaben gemäß § 5 TMG</h3>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    Sivaprasad Sisupalan<br />
                                    Speckenkamp 12<br />
                                    38162 Sülfeld, Deutschland
                                </p>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    Telefon: <a href="tel:+4915779151890">+49 1577 9151890</a><br />
                                    E-Mail: <a href="mailto:sivaprasad.s88@gmail.com">sivaprasad.s88@gmail.com</a><br />
                                    Webseite: <a href="https://kiezly.de">https://kiezly.de</a>
                                </p>
                            </div>
                            <div className='py-1'>
                                <h3 className='text-lg font-medium text-gray-800 mb-1'>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
                                <p className="text-gray-700 text-sm leading-relaxed">Sivaprasad Sisupalan (Anschrift wie oben)</p>
                            </div>
                            <div className='py-1'>
                                <h3 className='text-lg font-medium text-gray-800 mb-1'>Hinweis zum Status</h3>
                                <p className="text-gray-700 text-sm leading-relaxed">Diese Website ist ein <strong>privates, nicht-kommerzielle­s Projekt</strong> und befindet sich in der
                                    Entwicklung.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="mb-4 mt-4">
                    <h1 className="text-2xl font-semibold">Legal Notice (English)</h1>
                </div>

                <div className="mt-6">
                    <Card>
                        <CardContent className="p-5 text-sm text-neutral-700 space-y-2">
                            <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium transition-colors rounded-lg rounded-full px-3 py-2 bg-gray-50 text-gray-600 border border-gray-200`}
                            >
                                English translation for convenience. German version above is legally authoritative.
                            </span>
                            <div className='py-1'>
                                <h3 className='text-lg font-medium text-gray-800 mb-1'>According to § 5 TMG</h3>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    Sivaprasad Sisupalan<br />
                                    Speckenkamp 12<br />
                                    38162 Sülfeld, Germany
                                </p>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    Phone: <a href="tel:+4915779151890">+49 1577 9151890</a><br />
                                    Email: <a href="mailto:sivaprasad.s88@gmail.com">sivaprasad.s88@gmail.com</a><br />
                                    Website: <a href="https://kiezly.de">https://kiezly.de</a>
                                </p>
                            </div>
                            <div className='py-1'>
                                <h3 className='text-lg font-medium text-gray-800 mb-1'>Responsible for Content (§ 55 II RStV)</h3>
                                <p className="text-gray-700 text-sm leading-relaxed">Sivaprasad Sisupalan (same address)</p>
                            </div>
                            <div className='py-1'>
                                <h3 className='text-lg font-medium text-gray-800 mb-1'>Status Note</h3>
                                <p className="text-gray-700 text-sm leading-relaxed">This site is a <strong>private, non-commercial project</strong> under development.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    <button onClick={() => push("/")} className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90">
                        Back to home <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                </div>
            </main>
        </div>
    )
}