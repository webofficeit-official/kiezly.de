"use client";
import { Card } from "@/components/ui/card";
import { WizardDirection } from "@/components/wizard/WizardDirection";
import { WizardHeader } from "@/components/wizard/WizardHeader";
import { WizardMultiSelect } from "@/components/wizard/WizardMultiSelect";
import { WizardNavigation } from "@/components/wizard/WizardNavigation";
import { WizardRichText } from "@/components/wizard/WizardRichText";
import React from "react";

export default function Page() {
    return (
        <>
            <div className="min-h-screen bg-gray-50 text-gray-900">
                <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Post Job */}
                    <section className="lg:col-span-3 space-y-4">
                        {/* Header */}
                        <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">Post a mini-job</h2>
                            </div>
                            <div className="flex items-center gap-4 w-45">
                            </div>
                        </div>
                    </section>
                    <Card className="lg:col-span-3 space-y-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 sm:col-span-6 lg:col-span-5 bg-gray-100 p-6">
                                <div className="flex flex-wrap justify-center lg:flex-col gap-2  justify-between lg:space-x-0 lg:space-y-4">
                                    <WizardNavigation title="Basic Details" description="Provide the main information" count={1} current={false} finished={true} />
                                    <WizardNavigation title="Job Details" description="Provide detailed information" count={2} current={true} finished={false} />
                                    <WizardNavigation title="Location Details" description="Provide location details" count={3} current={false} finished={false} />
                                    <WizardNavigation title="Pricing Details" description="Set the pricing for this job" count={4} current={false} finished={false} />
                                    <WizardNavigation title="Work Details" description="Provide work details" count={5} current={false} finished={false} />
                                    <WizardNavigation title="Contact Details" description="Provide how applicants can reach you" count={6} current={false} finished={false} />
                                </div>
                            </div>

                            <div className="col-span-12 sm:col-span-6 lg:col-span-7 bg-white p-6">
                                {/* --- Header --- */}
                                <WizardHeader title="Job Details" description="Provide detailed information" />

                                {/* Form */}
                                <div className="mt-5">
                                    <WizardRichText
                                        label="Job Description"
                                        value="asdasd"
                                        onChange={() => { }}
                                        placeholder="Write the job description here..."
                                    />
                                    <WizardMultiSelect
                                        label="Languages"
                                        values={['1', '2']}
                                        onChange={() => { }}
                                        options={[
                                            {
                                                label: "German",
                                                value: '1'
                                            },
                                            {
                                                label: "English",
                                                value: '2'
                                            },
                                            {
                                                label: "Hindi",
                                                value: '3'
                                            }
                                        ]}
                                    />
                                    <div className="flex flex-col md:flex-row">
                                        <WizardRichText
                                            label="Requirements"
                                            value=""
                                            onChange={() => { }}
                                            placeholder="Write the Requirements here..."
                                        />
                                        <WizardRichText
                                            label="Tasks"
                                            value=""
                                            onChange={() => { }}
                                            placeholder="Write the Tasks here..."
                                        />
                                    </div>
                                    <WizardDirection next prev prevLink="/wizard/basic-details" nextLink="/wizard/location-details" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </main>
            </div>
        </>
    );
}