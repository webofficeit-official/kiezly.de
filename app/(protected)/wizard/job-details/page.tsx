"use client";
import { Card } from "@/components/ui/card";
import { WizardDirection } from "@/components/wizard/WizardDirection";
import { WizardHeader } from "@/components/wizard/WizardHeader";
import { WizardMultiSelect } from "@/components/wizard/WizardMultiSelect";
import { WizardNavigation } from "@/components/wizard/WizardNavigation";
import { WizardRichText } from "@/components/wizard/WizardRichText";
import { useJobWizard } from "@/lib/context/job-wizard-context";
import { useJobCollections, useUpdateJob } from "@/lib/react-query/queries/useJob";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = searchParams.get("slug");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showErrors, setShowErrors] = useState(false);
    const { formData, updateForm, jobId, mode } = useJobWizard();
    const { data: basicCollections } = useJobCollections();
    const updateJobMutation = useUpdateJob(jobId ?? undefined);


    // --- Language options ---
    const languageOptions =
        basicCollections?.languages?.map((lang) => ({
            label: lang.name,
            value: String(lang.id),
        })) || [];


    const handleFieldChange = (field: string, value: any) => {
        updateForm({ [field]: value }); // always update form first

        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field]; // clear existing error first

            if (field === "description") {
                if (!value || value.trim() === "") newErrors.description = "Title is required";
                else {
                    // remove <p></p> or other empty HTML tags
                    const text = formData?.description?.replace(/<(.|\n)*?>/g, "").trim();
                    if (!text) newErrors.description = "Job description cannot be empty.";
                }
            }


            return newErrors;
        });
    };

    const handleNext = async () => {
        const validationErrors = validateStep();

        if (Object.keys(validationErrors).length > 0) {
            setShowErrors(true);
            return; // stop navigation
        }
        if (!jobId) {
            router.push(`/wizard/location-details?slug=${formData.slug}`);
            return;
        }

        await updateJobMutation.mutateAsync(
            {
                description: formData.description,
                tasks: formData.tasks,
                requirements: formData.requirements,
                languages: formData.languages || [],
            },
            {
                onSuccess: () => {
                    router.push(`/wizard/location-details?slug=${formData.slug}`);
                },
            }
        );
    };


    const validateStep = () => {
        const newErrors: Record<string, string> = {};

        // Check job description (RichText)
        if (!formData.description || formData.description.trim() === "") {
            newErrors.description = "Job description is required.";
        } else {
            // remove <p></p> or other empty HTML tags
            const text = formData.description.replace(/<(.|\n)*?>/g, "").trim();
            if (!text) newErrors.description = "Job description cannot be empty.";
        }



        setErrors(newErrors);
        return newErrors;
    };
    return (
        <>
            <div className="min-h-screen bg-gray-50 text-gray-900">
                <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Post Job */}
                    <section className="lg:col-span-3 space-y-4">
                        {/* Header */}
                        <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold"> Post a Mini-Job</h2>
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
                                        value={formData?.description || ""}
                                        onChange={(v) => handleFieldChange("description", v)}
                                        placeholder="Write the job description here..."
                                        required={true}
                                        error={errors?.description}
                                    />
                                    <WizardMultiSelect
                                        label="Languages"
                                        values={formData?.languages || []}
                                        onChange={(v) => updateForm({ languages: v })}
                                        options={languageOptions || []}
                                    />
                                    <div className="flex flex-col md:flex-row">
                                        <WizardRichText
                                            label="Requirements"
                                            value={formData?.requirements || ""}
                                            onChange={(v) => updateForm({ requirements: v })}
                                            placeholder="Write the Requirements here..."
                                        />
                                        <WizardRichText
                                            label="Tasks"
                                            value={formData?.tasks || ""}
                                            onChange={(v) => updateForm({ tasks: v })}
                                            placeholder="Write the Tasks here..."
                                        />
                                    </div>
                                    <WizardDirection
                                        prev
                                        prevLink={`/wizard/basic-details?slug=${formData?.slug || slug}`}
                                        next
                                        onNext={handleNext}
                                        isNextLoading={updateJobMutation.isPending}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </main>
            </div>
        </>
    );
}