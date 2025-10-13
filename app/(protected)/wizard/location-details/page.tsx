"use client";
import { Card } from "@/components/ui/card";
import { WizardDirection } from "@/components/wizard/WizardDirection";
import { WizardHeader } from "@/components/wizard/WizardHeader";
import { WizardInput } from "@/components/wizard/WizardInput";
import { WizardNavigation } from "@/components/wizard/WizardNavigation";
import { WizardSelectSearch } from "@/components/wizard/WizardSelectSearch";
import { WizardInputSearch } from "@/components/wizard/WizardInputSearch";
import { useJobWizard } from "@/lib/context/job-wizard-context";
import { useJobCollections, useUpdateJob } from "@/lib/react-query/queries/useJob";
import { useZipcodes } from "@/lib/react-query/queries/collection";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = searchParams.get("slug");

    const { formData, updateForm, jobId } = useJobWizard();
    const updateJobMutation = useUpdateJob(jobId ?? undefined);
    const { data: basicCollections } = useJobCollections();
    const { mutateAsync: fetchZipcodes } = useZipcodes();

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showErrors, setShowErrors] = useState(false);

    /* -------------------------- Options and Validation -------------------------- */
    const countryOptions =
        basicCollections?.countries?.map((c: any) => ({
            label: c.name,
            value: String(c.id),
        })) || [
        ];

    const validateFields = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.country_id || formData.country_id === "")
            newErrors.country_id = "Country is required";

        if (!formData.postal_code || formData.postal_code.trim() === "")
            newErrors.postal_code = "Postal Code is required";

        if (!formData.street || formData.street.trim() === "")
            newErrors.street = "Street is required";

        if (!formData.city || formData.city.trim() === "")
            newErrors.city = "City is required";

        if (!formData.state || formData.state.trim() === "")
            newErrors.state = "State is required";

        setErrors(newErrors);
        return newErrors;
    };

    const handleFieldChange = (field: string, value: string) => {
        updateForm({ [field]: value });
        setErrors((prev) => {
            const updated = { ...prev };
            delete updated[field];
            if (value.trim() === "")
                updated[field] = `${field.replace("_", " ")} is required`;
            return updated;
        });
    };

    /* -------------------------- Fetch ZIP Options -------------------------- */
    const fetchZipOptions = async (query: string) => {
        if (!query || query.trim().length < 2) return [];
        try {
            const res = await fetchZipcodes({
                zip: query,
                country: formData.country_id,
            });

            const zips =
                res?.data?.zipcode?.map((z: any) => ({
                    label: `${z.zipcode} - ${z.street}`,
                    value: z.zipcode,
                    meta: {
                        id: String(z.id),
                        zipcode: z.zipcode,
                        city: z.city,
                        state: z.state,
                        street: z.street,
                        latitude: z.latitude,
                        longitude: z.longitude,
                    },
                })) || [];
            return zips;
        } catch (err) {
            console.error("Zip fetch failed:", err);
            return [];
        }
    };

    const handleZipSelect = (meta: any) => {
        if (!meta) return;
        updateForm({
            postal_code: meta.zipcode,
            city: meta.city,
            state: meta.state,
            street: meta.street || "",
            lat: String(meta.latitude || ""),
            lng: String(meta.longitude || ""),
        });
    };

    /* -------------------------- Navigation -------------------------- */
    const handleNext = async () => {
        const newErrors = validateFields();
        if (Object.keys(newErrors).length > 0) {
            setShowErrors(true);
            return;
        }

        const payload = {
            country_id: formData.country_id,
            postal_code: formData.postal_code,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            lat: formData.lat || "",
            lng: formData.lng || "",
        };

        if (jobId) {
            await updateJobMutation.mutateAsync(payload, {
                onSuccess: () => {
                    toast.success("Location updated successfully!");
                    router.push(`/wizard/pricing-details?slug=${slug}`);
                },
                onError: () => toast.error("Failed to update location."),
            });
        }
    };

    const handlePrev = () => router.push(`/wizard/job-details?slug=${slug}`);

    const isNextLoading = updateJobMutation.isPending;

    const handleCountryChange = (v: string) => {
        // Update the selected country
        handleFieldChange("country_id", v);

        // Reset all dependent fields (ZIP, Street, City, etc.)
        updateForm({
            postal_code: "",
            street: "",
            city: "",
            state: "",
            lat: "",
            lng: "",
        });

        // Optionally, clear any previous errors on those fields
        setErrors((prev) => {
            const updated = { ...prev };
            delete updated.postal_code;
            delete updated.street;
            delete updated.city;
            delete updated.state;
            return updated;
        });
    };


    /* -------------------------- Render -------------------------- */
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Header */}
                <section className="lg:col-span-3 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Post a mini-job</h2>
                    </div>
                </section>

                <Card className="lg:col-span-3 space-y-4">
                    <div className="grid grid-cols-12 gap-4">
                        {/* Sidebar */}
                        <div className="col-span-12 sm:col-span-6 lg:col-span-5 bg-gray-100 p-6">
                            <div className="flex flex-wrap justify-center lg:flex-col gap-2 lg:space-y-4">
                                <WizardNavigation
                                    title="Basic Details"
                                    description="Provide the main information"
                                    count={1}
                                    current={false}
                                    finished
                                />
                                <WizardNavigation
                                    title="Job Details"
                                    description="Provide detailed information"
                                    count={2}
                                    current={false}
                                    finished
                                />
                                <WizardNavigation
                                    title="Location Details"
                                    description="Provide location details"
                                    count={3}
                                    current
                                    finished={false}
                                />
                                <WizardNavigation
                                    title="Pricing Details"
                                    description="Set the pricing for this job"
                                    count={4}
                                    current={false}
                                    finished={false}
                                />
                                <WizardNavigation
                                    title="Work Details"
                                    description="Provide work details"
                                    count={5}
                                    current={false}
                                    finished={false}
                                />
                                <WizardNavigation
                                    title="Contact Details"
                                    description="Provide how applicants can reach you"
                                    count={6}
                                    current={false}
                                    finished={false}
                                />
                            </div>
                        </div>

                        {/* Main Form */}
                        <div className="col-span-12 sm:col-span-6 lg:col-span-7 bg-white p-6">
                            <WizardHeader
                                title="Location Details"
                                description="Provide location details"
                            />

                            <div className="mt-5 space-y-4">
                                {/* Country & Postal Code */}
                                <div className="flex flex-col md:flex-row gap-3">
                                    <WizardSelectSearch
                                        label="Country"
                                        value={formData.country_id || ""}
                                        onChange={handleCountryChange}
                                        options={countryOptions}
                                        required
                                        error={showErrors ? errors.country_id : ""}
                                    />


                                    <WizardInputSearch
                                        label="Postal Code"
                                        placeholder="Type postal code"
                                        value={formData.postal_code || ""}
                                        onChangeValue={(v) => handleFieldChange("postal_code", v)}
                                        fetchOptions={fetchZipOptions}
                                        onSelectOption={handleZipSelect}
                                        required
                                        error={showErrors ? errors.postal_code : ""}
                                    />
                                </div>

                                {/* Street, City, State */}
                                <div className="flex flex-col md:flex-row gap-3">
                                    <WizardInput
                                        label="Street"
                                        placeholder="Essen"
                                        value={formData.street || ""}
                                        onChange={(v) => handleFieldChange("street", v)}
                                        required
                                        error={showErrors ? errors.street : ""}
                                    />
                                    <WizardInput
                                        label="City"
                                        placeholder="Berlin"
                                        value={formData.city || ""}
                                        onChange={(v) => handleFieldChange("city", v)}
                                        required
                                        error={showErrors ? errors.city : ""}
                                    />
                                    <WizardInput
                                        label="State"
                                        placeholder="Nordrhein-Westfalen"
                                        value={formData.state || ""}
                                        onChange={(v) => handleFieldChange("state", v)}
                                        required
                                        error={showErrors ? errors.state : ""}
                                    />
                                </div>

                                {/* Latitude & Longitude (Optional) */}
                                <div className="flex flex-col md:flex-row gap-3">
                                    <WizardInput
                                        label="Latitude"
                                        placeholder="51.4535"
                                        value={formData.lat || ""}
                                        onChange={(v) => updateForm({ lat: v })}
                                    />
                                    <WizardInput
                                        label="Longitude"
                                        placeholder="7.0102"
                                        value={formData.lng || ""}
                                        onChange={(v) => updateForm({ lng: v })}
                                    />
                                </div>

                                {/* Navigation */}
                                <WizardDirection
                                    prev
                                    next
                                    onPrev={handlePrev}
                                    onNext={handleNext}
                                    isNextLoading={isNextLoading}
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </main>
        </div>
    );
}
