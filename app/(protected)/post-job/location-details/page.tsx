"use client";
import { Card } from "@/components/ui/card";
import { WizardDirection } from "@/components/wizard/WizardDirection";
import { WizardHeader } from "@/components/wizard/WizardHeader";
import { WizardInput } from "@/components/wizard/WizardInput";
import { WizardNavigation } from "@/components/wizard/WizardNavigation";
import { WizardSelectSearch } from "@/components/wizard/WizardSelectSearch";
import { WizardInputSearch } from "@/components/wizard/WizardInputSearch";
import { useJobWizard } from "@/lib/context/job-wizard-context";
import {
  useJob,
  useJobCollections,
  useUpdateJob,
} from "@/lib/react-query/queries/useJob";
import { useZipcodes } from "@/lib/react-query/queries/collection";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const { formData, updateForm, jobId, setJobId, mode, setMode } = useJobWizard();
  const updateJobMutation = useUpdateJob(jobId ?? undefined);
  const { data: basicCollections } = useJobCollections();
  const { mutateAsync: fetchZipcodes } = useZipcodes();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ----------------------------- Fetch Existing Job ----------------------------- */
  const { data: existingJob, isLoading } = useJob(slug || "");

  useEffect(() => {
    if (slug && existingJob?.job) {
      setMode("edit");
      setJobId(existingJob.job.id);
      updateForm(normalizeJobForForm(existingJob.job));
    } else if (!slug) {
      setMode("create");
    }
  }, [slug, existingJob]);

  const normalizeJobForForm = (job: any) => ({
    title: job.title || "",
    slug: job.slug || "",
    subtitle: job.subtitle || "",
    status: job.status || "draft",
    description: job.description || "",
    tasks: job.tasks || "",
    requirements: job.requirements || "",
    languages: job.languages?.map((l: any) => String(l.id)) || [],
    country_id: job.country_id ? String(job.country_id) : "",
    postal_code: job.postal_code || "",
    street: job.street || "",
    city: job.city || "",
    state: job.state || "",
    lat: job.lat || "",
    lng: job.lng || "",
  });

  /* -------------------------- Country Options -------------------------- */
  const countryOptions =
    basicCollections?.countries?.map((c: any) => ({
      label: c.name,
      value: String(c.id),
      code: c.code,
    })) || [];

  /* -------------------------- Default Country Logic -------------------------- */
  useEffect(() => {
    // only set default if not editing or country missing
    if (countryOptions.length > 0 && !formData.country_id) {
      if (existingJob?.job?.country_id) {
        // if edit mode and backend has country_id
        updateForm({ country_id: String(existingJob.job.country_id) });
      } else {
        // default Germany for new job or missing value
        const germany = countryOptions.find(
          (c) =>
            c.label.toLowerCase() === "germany" || c.code?.toLowerCase() === "de"
        );
        if (germany) {
          updateForm({ country_id: germany.value });
        }
      }
    }
  }, [countryOptions, formData.country_id, existingJob]);

  /* -------------------------- Validation -------------------------- */
  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.country_id) newErrors.country_id = "Country is required";
    if (!formData.postal_code?.trim())
      newErrors.postal_code = "Postal Code is required";
    if (!formData.street?.trim()) newErrors.street = "Street is required";
    if (!formData.city?.trim()) newErrors.city = "City is required";
    if (!formData.state?.trim()) newErrors.state = "State is required";
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
          label: z.street
            ? `${z.zipcode} - ${z.street}`
            : `${z.zipcode} - ${z.city}`,
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

  /* -------------------------- When ZIP is Selected -------------------------- */
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

    // Remove validation errors after auto-fill
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.postal_code;
      delete updated.street;
      delete updated.city;
      delete updated.state;
      return updated;
    });
  };

  /* -------------------------- Country Change -------------------------- */
  const handleCountryChange = (v: string) => {
    handleFieldChange("country_id", v);
    updateForm({
      postal_code: "",
      street: "",
      city: "",
      state: "",
      lat: "",
      lng: "",
    });
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.postal_code;
      delete updated.street;
      delete updated.city;
      delete updated.state;
      return updated;
    });
  };

  /* -------------------------- Navigation -------------------------- */
  const handleNext = async () => {
    const newErrors = validateFields();
    if (Object.keys(newErrors).length > 0) {
      setShowErrors(true);
      toast.error("Please fill all required fields.");
      return;
    }

    const payload = {
      country: formData.country_id,
      postal_code: formData.postal_code,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      lat: formData.lat || "",
      lng: formData.lng || "",
      status: formData.status ? formData.status : "draft",
    };

    try {
      if (jobId) {
        await updateJobMutation.mutateAsync(payload, {
          onSuccess: () => {
            router.push(`/post-job/pricing-details?slug=${slug}`);
          },
          onError: () => toast.error("Failed to update location details."),
        });
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handlePrev = () => router.push(`/post-job/job-details?slug=${slug}`);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading location details...
      </div>
    );
  }

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
              <div className="flex flex-wrap justify-center lg:flex-col gap-2  justify-between lg:space-x-0 lg:space-y-4">
                <WizardNavigation title="Basic Details" description="Provide the main information" count={1} current={false} finished={true} />
                <WizardNavigation title="Job Details" description="Provide detailed information" count={2} current={false} finished={true} />
                <WizardNavigation title="Location Details" description="Provide location details" count={3} current={true} finished={false} />
                <WizardNavigation title="Pricing Details" description="Set the pricing for this job" count={4} current={false} finished={false} />
                <WizardNavigation title="Work Details" description="Provide work details" count={5} current={false} finished={false} />
                <WizardNavigation title="Contact Details" description="Provide how applicants can reach you" count={6} current={false} finished={false} />
              </div>
            </div>

            {/* Main Form */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-7 bg-white p-6">
              <WizardHeader title="Location Details" description="Provide the location details for your job" />

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
                    disabled={!formData.country_id}
                    error={showErrors ? errors.postal_code : ""}
                  />
                </div>

                {/* Street, City, State */}
                <div className="flex flex-col md:flex-row gap-3">
                  <WizardInput label="Street" placeholder="Essen" value={formData.street || ""} onChange={(v) => handleFieldChange("street", v)} required error={showErrors ? errors.street : ""} />
                  <WizardInput label="City" placeholder="Berlin" value={formData.city || ""} onChange={(v) => handleFieldChange("city", v)} required error={showErrors ? errors.city : ""} />
                  <WizardInput label="State" placeholder="Nordrhein-Westfalen" value={formData.state || ""} onChange={(v) => handleFieldChange("state", v)} required error={showErrors ? errors.state : ""} />
                </div>

                {/* Latitude & Longitude */}
                <div className="flex flex-col md:flex-row gap-3">
                  <WizardInput label="Latitude" placeholder="51.4535" value={formData.lat || ""} onChange={(v) => updateForm({ lat: v })} />
                  <WizardInput label="Longitude" placeholder="7.0102" value={formData.lng || ""} onChange={(v) => updateForm({ lng: v })} />
                </div>

                {/* Navigation */}
                <WizardDirection prev onPrev={handlePrev} next onNext={handleNext} isNextLoading={updateJobMutation.isPending} />
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
