'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation';
import { useLocalizedRouter } from '@/lib/useLocalizedRouter';

export default function TermsPage() {
    const router = useRouter();
    const { push } = useLocalizedRouter();

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
            <main className="mx-auto max-w-6xl px-4 py-6">
                <div className="mb-4">
                    <h1 className="text-2xl font-semibold">Nutzungsbedingungen</h1>
                </div>

                <div className="mt-6">
                    <Card>
                        <CardContent className="p-5 text-sm text-neutral-700 space-y-2">
                            <div
                                className={`w-full inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium transition-colors rounded-lg rounded-full px-3 py-2 bg-gray-50 text-gray-600 border border-gray-200`}
                            >
                                <b>Stand</b>: 16. Oktober 2025
                            </div>
                            <TitleDescription title="1. Geltungsbereich & Status" description="Diese Website ist ein <strong>privates, nicht-kommerzielles</strong> Projekt und befindet sich in der Entwicklung. Die Inhalte dienen ausschließlich Informationszwecken." />
                            <TitleDescription title="2. Haftung" description="Es wird keine Gewähr für Richtigkeit, Vollständigkeit oder Aktualität der Inhalte übernommen. Eine Haftung für Schäden aus der Nutzung der Inhalte ist ausgeschlossen, soweit gesetzlich zulässig." />
                            <TitleDescription title="3. Verfügbarkeit" description="Es besteht kein Anspruch auf ununterbrochene Verfügbarkeit. Wartungen, Aktualisierungen oder Störungen können zu Ausfällen führen." />
                            <TitleDescription title="4. Externe Links" description="Für Inhalte verlinkter externer Seiten sind ausschließlich deren Betreiber verantwortlich." />
                            <TitleDescription title="5. Urheberrecht" description="Alle Inhalte (Texte, Layout, ggf. Grafiken) sind urheberrechtlich geschützt. Eine Nutzung, Vervielfältigung oder Bearbeitung ist ohne vorherige Zustimmung nicht gestattet." />
                            <TitleDescription title="6. Änderungen" description="Diese Bedingungen können jederzeit angepasst werden. Maßgeblich ist die jeweils aktuelle Fassung." />
                        </CardContent>
                    </Card>
                </div>
                <div className="mb-4 mt-4">
                    <h1 className="text-2xl font-semibold">Terms of Use (English)</h1>
                </div>

                <div className="mt-6">
                    <Card>
                        <CardContent className="p-5 text-sm text-neutral-700 space-y-2">
                            <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium transition-colors rounded-lg rounded-full px-3 py-2 bg-gray-50 text-gray-600 border border-gray-200`}
                            >
                                English translation for convenience. German version above is legally authoritative.
                            </span>
                            <TitleDescription title="1. Scope & Status" description="This site is a <strong>private, non-commercial project</strong> under development. Content is for informational purposes only." />
                            <TitleDescription title="2. Liability" description="No warranty is given for accuracy, completeness, or timeliness. Liability for damages arising from use is excluded to the extent permitted by law." />
                            <TitleDescription title="3. Availability" description="No guarantee of uninterrupted availability. Maintenance, updates, or outages may occur." />
                            <TitleDescription title="4. External Links" description="Third-party sites are the sole responsibility of their operators." />
                            <TitleDescription title="5. Copyright" description="All content (text, layout, graphics) is protected by copyright and may not be used without prior permission." />
                            <TitleDescription title="6. Changes" description="These terms may be updated at any time. The current version applies." />
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

function TitleDescription({ title, description }) {
    return (
        <div className='py-1'>
            <h3 className='text-lg font-medium text-gray-800 mb-1'>{title}</h3>
            <div
                className="text-gray-700 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: description || "" }}
            />
        </div>
    )
}