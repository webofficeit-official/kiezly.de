'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation';
import { RichList } from '@/components/ui/rich-list';
import { useLocalizedRouter } from '@/lib/useLocalizedRouter';

export default function DatenschutzPage() {
    const router = useRouter();
    const { push } = useLocalizedRouter();

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
            <main className="mx-auto max-w-6xl px-4 py-6">
                <div className="mb-4">
                    <h1 className="text-2xl font-semibold">Datenschutzerklärung</h1>
                </div>

                <div className="mt-6">
                    <Card>
                        <CardContent className="p-5 text-sm text-neutral-700 space-y-2">
                            <div
                                className={`w-full inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium transition-colors rounded-lg rounded-full px-3 py-2 bg-gray-50 text-gray-600 border border-gray-200`}
                            >
                                <b>Stand</b>: 16. Oktober 2025
                            </div>
                            <TitleDescription title="1. Verantwortlicher" description={`<p>Sivaprasad Sisupalan<br />Speckenkamp 12, 38162 Sülfeld, Deutschland<br />E-Mail: <a href="mailto:sivaprasad.s88@gmail.com">sivaprasad.s88@gmail.com</a></p>`} />
                            <TitleDescription title={`2. Zweck & Rechtsgrundlagen`} description={`<p>Diese Website ist ein privates, nicht-kommerzielles Projekt. Datenverarbeitungen erfolgen nur, soweit dies zur <strong>Bereitstellung der Website</strong> erforderlich ist (Art. 6 Abs. 1 lit. f DSGVO – berechtigtes Interesse an einer sicheren, stabilen Auslieferung).</p>`} />
                            <TitleDescription title={`3. Server-Protokolle`} description={`<p>Beim Aufruf können technische Informationen verarbeitet werden (z B. IP-Adresse in gekürzter Form, Datum/Uhrzeit, angeforderte Ressourcen, User-Agent). Diese Daten dienen ausschließlich der technischen Bereitstellung, Fehlersuche und Sicherheit und werden nur so lange gespeichert, wie es zur Erreichung dieser Zwecke erforderlich ist.</p>`} />
                            <TitleDescription title={`4. Cookies & Tracking`} description={`<p><strong>Es werden keine Cookies zu Analyse-/Tracking-Zwecken gesetzt.</strong> Es werden keine externen Analytics-Dienste (z. B. Google Analytics) eingesetzt.</p>`} />
                            <TitleDescription title={`5. Empfänger & Drittlandtransfer`} description={`<p>Sofern ein Hosting-Dienstleister eingesetzt wird, erfolgt eine Verarbeitung beim Hosting-Provider ausschließlich zur Auslieferung dieser Website. Eine Übermittlung in Drittländer findet nicht statt, es sei denn, sie ist zur Auslieferung technisch erforderlich (z. B. Content-Delivery).</p>`} />
                            <TitleDescription title={`6. Ihre Rechte`} description={`<ul><li>Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch (Art. 15–21 DSGVO)</li><li>Beschwerderecht bei einer Datenschutzaufsichtsbehörde</li></ul><p>Zur Ausübung Ihrer Rechte genügt eine formlose E-Mail an: <a href="mailto:sivaprasad.s88@gmail.com">sivaprasad.s88@gmail.com</a>.</p>`} />
                            <TitleDescription title={`7. Externe Links`} description={`<p>Für Inhalte verlinkter externer Seiten wird keine Verantwortung übernommen.</p>`} />
                            <TitleDescription title={`8. Änderungen`} description={`<p>Diese Hinweise können angepasst werden, um technischen oder rechtlichen Änderungen Rechnung zu tragen.</p>`} />
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
                            <TitleDescription title={`1. Controller`} description={` <p>Sivaprasad Sisupalan – Speckenkamp 12, 38162 Sülfeld, Germany<br /> Email: <a href="mailto:sivaprasad.s88@gmail.com">sivaprasad.s88@gmail.com</a> </p>`} />
                            <TitleDescription title={`2. Purpose & Legal Basis`} description={`<p>Private, non-commercial site. Processing only as needed to operate the website securely and reliably (Art. 6(1)(f) GDPR – legitimate interest).</p>`} />
                            <TitleDescription title={`3. Server Logs`} description={`<p>Technical data (e.g., truncated IP, timestamp, requested resource, user agent) may be processed for delivery, troubleshooting, and security, and retained only as long as necessary.</p>`} />
                            <TitleDescription title={`4. Cookies & Tracking`} description={`<p><strong>No analytics or tracking cookies are used.</strong> No external analytics services are integrated. </p>`} />
                            <TitleDescription title={`5. Recipients & Transfers`} description={`<p>If a hosting provider is used, processing occurs solely to deliver this site. No third-country transfers occur except if technically necessary (e.g., CDN delivery).</p>`} />
                            <TitleDescription title={`6. Your Rights`} description={`<p>Access, rectification, deletion, restriction, objection, and complaint to a supervisory authority. Email requests to <a href="mailto:sivaprasad.s88@gmail.com">sivaprasad.s88@gmail.com</a>.</p>`} />
                            <TitleDescription title={`7. External Links`} description={`<p>No responsibility is assumed for third-party content.</p>`} />
                            <TitleDescription title={`8. Changes`} description={`<p>This notice may be updated to reflect technical or legal changes.</p>`} />
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    <button onClick={() => push("/")} className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90">
                        Back to home <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                </div>
            </main >
        </div >
    )
}

function TitleDescription({ title, description }) {
    return (
        <>
            <div className='py-1'>
                <h3 className='text-lg font-medium text-gray-800 mb-1'>{title}</h3>
                <RichList html={description} />
            </div>
        </>
    )
}