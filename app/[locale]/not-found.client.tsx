'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { RichList } from '@/components/ui/rich-list';
import { useLocalizedRouter } from '@/lib/useLocalizedRouter';
import { useT } from './layout';

export default function NotFoundClient() {
    const { push } = useLocalizedRouter();
    const t = useT("404");

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 mt-10">
            <main className="mx-auto max-w-6xl px-4 py-6">
                <div className="mt-6">
                    <Card>
                        <CardContent className="p-4 p-5 space-y-2 text-center text-neutral-700 text-sm">
                            <div className="mb-4 p-10">
                                <h1 className="font-bold" style={{ fontSize: '100px' }}>{t("title")}</h1>
                            </div>
                            <div className="mb-4 p-0.5">
                                <h1 className="font-semibold text-2xl text-gray-500">{t("subtitle")}</h1>
                            </div>
                            <div
                                className="mb-4 font-medium text-[0.875rem] text-muted-foreground"
                                dangerouslySetInnerHTML={{ __html: t("description") || "" }}
                            />

                            <div className="mt-8">
                                <button onClick={() => push("/")} className="bg-neutral-900 border border-neutral-900 font-medium hover:opacity-90 inline-flex items-center justify-center mt-5 px-3 py-2 rounded-2xl text-sm text-white transition-colors">
                                    {t("go-back")} <ArrowRight className="ml-2 h-4 w-4" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
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