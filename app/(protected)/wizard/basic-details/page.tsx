"use client";
import { Card } from "@/components/ui/card";
import { WizardDirection } from "@/components/wizard/WizardDirection";
import { WizardHeader } from "@/components/wizard/WizardHeader";
import { WizardInput } from "@/components/wizard/WizardInput";
import { WizardMultiSelect } from "@/components/wizard/WizardMultiSelect";
import { WizardNavigation } from "@/components/wizard/WizardNavigation";
import { WizardSelect } from "@/components/wizard/WizardSelect";
import { Euro } from "lucide-react";
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
                        <div className="grid grid-cols-12">
                            <div className="col-span-5 bg-gray-100 p-6">
                                {/* Wizard Navigation */}
                                <WizardNavigation title="Basic Details" description="Provide the main information" count={1} current={true} finished={false} />
                                <WizardNavigation title="Job Details" description="Provide detailed information" count={2} current={false} finished={false} />
                                <WizardNavigation title="Location Details" description="Provide location details" count={3} current={false} finished={false} />
                                <WizardNavigation title="Pricing Details" description="Set the pricing for this job" count={4} current={false} finished={false} />
                                <WizardNavigation title="Work Details" description="Provide work details" count={5} current={false} finished={false} />
                                <WizardNavigation title="Contact Details" description="Provide how applicants can reach you" count={6} current={false} finished={false} />
                            </div>
                            <div className="col-span-7 p-6">
                                {/* --- Header --- */}
                                <WizardHeader title="Basic Details" description="Provide the main information" />

                                {/* Form */}
                                <div className="mt-5">
                                    <div className="flex justify-between">
                                        <WizardInput label="Title" placeholder="Babysitting job in Berlin" value='' onChange={() => { }} />
                                        <WizardInput label="Subtitle" placeholder="" value='' onChange={() => { }} />
                                    </div>
                                    <WizardInput label="Slug" placeholder="babisitting-job-in-berlin" value='' onChange={() => { }} />
                                    <div className="flex justify-between">
                                        <WizardSelect
                                            label="Job Category"
                                            value='1'
                                            onChange={() => { }}
                                            options={[
                                                {
                                                    label: "Childcare",
                                                    value: '1'
                                                },
                                                {
                                                    label: "Cleaning",
                                                    value: '3'
                                                },
                                                {
                                                    label: "Pet Care",
                                                    value: '2'
                                                }
                                            ]}
                                        />
                                        <WizardMultiSelect
                                            label="Tags"
                                            values={['1', '2']}
                                            onChange={() => { }}
                                            options={[
                                                {
                                                    label: "First Aid",
                                                    value: '1'
                                                },
                                                {
                                                    label: "German B1",
                                                    value: '3'
                                                },
                                                {
                                                    label: "Driver License",
                                                    value: '2'
                                                }
                                            ]}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-3">
                                        <WizardMultiSelect
                                            label="Job Type"
                                            values={['Part time', 'On Demand']}
                                            onChange={() => { }}
                                            options={[
                                                {
                                                    label: "Part time",
                                                    value: 'Part time'
                                                },
                                                {
                                                    label: "On Demand",
                                                    value: 'On Demand'
                                                },
                                                {
                                                    label: "Full time",
                                                    value: 'Full time'
                                                }
                                            ]}
                                        />
                                        <WizardMultiSelect
                                            label="Experience Level"
                                            values={['Middle', 'Experienced']}
                                            onChange={() => { }}
                                            options={[
                                                {
                                                    label: "Junior",
                                                    value: 'Junior'
                                                },
                                                {
                                                    label: "Middle",
                                                    value: 'Middle'
                                                },
                                                {
                                                    label: "Experienced",
                                                    value: 'Experienced'
                                                }
                                            ]}
                                        />
                                    </div>
                                    <WizardDirection next nextLink="/wizard/job-details" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </main>
            </div>
        </>
    );
}