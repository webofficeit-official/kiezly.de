'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation';
import { RichList } from '@/components/ui/rich-list';
import { useLocalizedRouter } from '@/lib/useLocalizedRouter';
import { useT } from '../layout';

export default function DatenschutzPage() {
    const router = useRouter();
    const { push } = useLocalizedRouter();
    const t = useT("privacy");
    const lists = t("lists") || [];

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
            <main className="mx-auto max-w-6xl px-4 py-6">
                <div className="mb-4">
                    <h1 className="text-2xl font-semibold">{t("header")}</h1>
                </div>

                <div className="mt-6">
                    <Card>
                        <CardContent className="p-5 text-sm text-neutral-700 space-y-2">
                            <div
                                className={`w-full inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium transition-colors rounded-lg rounded-full px-3 py-2 bg-gray-50 text-gray-600 border border-gray-200`}
                            >
                                {t("description")}
                            </div>

                            {lists.map((list: any, i: number) => {
                                return (
                                    <TitleDescription key={i} title={`${i + 1}. ${list.title}`} description={list.description} />

                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    <button onClick={() => push("/")} className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90">
                        {t("go-back")} <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
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