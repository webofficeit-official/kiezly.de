"use client";

import { Card } from "@/components/ui/card";
import { WizardDateInput } from "@/components/wizard/WizardDateInput";
import { WizardDirection } from "@/components/wizard/WizardDirection";
import { WizardHeader } from "@/components/wizard/WizardHeader";
import { WizardNavigation } from "@/components/wizard/WizardNavigation";
import { WizardSelect } from "@/components/wizard/WizardSelect";
import { WizardSwitch } from "@/components/wizard/WizardSwitch";
import { useJobWizard } from "@/lib/context/job-wizard-context";
import {
  useJob,
  useJobCollections,
  useUpdateJob,
} from "@/lib/react-query/queries/useJob";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useT } from "@/app/[locale]/layout";
import { StepSidebar } from "@/components/wizard/StepSidebar";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const { formData, updateForm, jobId, setJobId, mode, setMode,version } =
    useJobWizard();
  const { data: basicCollections } = useJobCollections();
  const { data: existingJob } = useJob(slug || "");
  const updateJobMutation = useUpdateJob(jobId ?? undefined);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const { push } = useLocalizedRouter();
  const t = useT("post-job");

  /* ----------------------------- Fetch Existing Job ----------------------------- */
  useEffect(() => {
    if (slug && existingJob?.job) {
      setMode("edit");
      setJobId(existingJob.job.id);
      updateForm(mapJobToForm(existingJob.job));
    } else if (!slug) {
      setMode("create");
    }
  }, [slug, existingJob]);

  const mapJobToForm = (job: any) => ({
    // basic
    title: job.title ?? "",
    slug: job.slug ?? "",
    subtitle: job.subtitle ?? "",
    category_id: job.category_id ? String(job.category_id) : "",
    tag_ids: job.tags?.map((t: any) => String(t.id)) ?? [],
    job_type: job.job_type ?? [],
    job_experience: job.job_experience ?? [],
    status: job.status ?? "draft",

    // details
    description: job.description || "",
    tasks: job.tasks || "",
    requirements: job.requirements || "",
    languages: job.job_languages?.map((t: any) => String(t.id)) || [],

    //location
    country_id: job.country_id ? String(job.country_id) : "",
    postal_code: job.postal_code || "",
    street: job.street || "",
    city: job.city || "",
    state: job.state || "",
    lat: job.lat || "",
    lng: job.lng || "",

    //pricing
    currency: job.currency || "",
    price_type: job.price_type || "fixed",
    price_value: job.price_value || "",
    price_min: job.price_min || "",
    price_max: job.price_max || "",
    //work
    work_mode: job.work_mode || "",
    starts_at: job.starts_at ? job.starts_at.split("T")[0] : "", // format yyyy-mm-dd
    ends_at: job.ends_at ? job.ends_at.split("T")[0] : "",
    first_aid_verified: !!job.first_aid_verified,
    police_verified: !!job.police_verified,

    //contact
    contact_method: job.contact_method || "email_relay",
    contact_email: job.contact_email || "",
    contact_phone: job.contact_phone || "",
    contact_link: job.contact_link || "",
  });
  /* ----------------------------- Normalize job ----------------------------- */
  const normalizeJobForForm = (job: any) => ({
    work_mode: job.work_mode || "",
    starts_at: job.starts_at ? job.starts_at.split("T")[0] : "", // format yyyy-mm-dd
    ends_at: job.ends_at ? job.ends_at.split("T")[0] : "",
    first_aid_verified: !!job.first_aid_verified,
    police_verified: !!job.police_verified,
  });

  /* ----------------------------- Validation ----------------------------- */
  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.work_mode) newErrors.work_mode = t("work.validation.work_mode_required");

    if (!formData.starts_at) newErrors.starts_at = t("work.validation.start_required");

    if (formData.ends_at && formData.starts_at) {
      const start = new Date(formData.starts_at);
      const end = new Date(formData.ends_at);
      if (end < start)
        newErrors.ends_at =  t("work.validation.end_after_start");
    }

    setErrors(newErrors);
    return newErrors;
  };

  /* ----------------------------- Field Change ----------------------------- */
  const handleFieldChange = (field: string, value: any) => {
    updateForm({ [field]: value });
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  /* ----------------------------- Save & Navigation ----------------------------- */
  const handleNext = async () => {
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setShowErrors(true);
      toast.error(t("common.fix_errors"));
      return;
    }

    const payload = {
      work_mode: formData.work_mode,
      starts_at: formData.starts_at
        ? new Date(formData.starts_at).toISOString()
        : null,
      ends_at: formData.ends_at
        ? new Date(formData.ends_at).toISOString()
        : null,
      first_aid_verified: formData.first_aid_verified || false,
      police_verified: formData.police_verified || false,
      status: formData.status ? formData.status : "draft",
    };

    try {
      if (jobId) {
        await updateJobMutation.mutateAsync(payload, {
          onSuccess: () => {
            // toast.success("Work details updated successfully!");
            push(`/post-job/contact-details?slug=${slug}`);
          },
          onError: () => toast.error(t("work.toasts.update_failure")),
        });
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handlePrev = () => push(`/post-job/pricing-details?slug=${slug}`);

  /* ----------------------------- Derived ----------------------------- */
  const workModeOptions =
    basicCollections?.jobMode?.map((mode) => ({
      label: t(`work.work_mode_options.${mode.key}`),
      value: mode.key,
    })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading work details...
      </div>
    );
  }

  /* ----------------------------- Render ----------------------------- */
  return (
    <div  key={version} className="min-h-screen bg-gray-50 text-gray-900">
      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Header */}
        <section className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold"> {t("page_title")}</h2>
          </div>
        </section>

        <Card className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-12 gap-4">
            {/* Sidebar */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-5 bg-gray-100 p-6">
            <StepSidebar current="work" slug={formData?.slug || slug} />
            </div>

            {/* Main Form */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-7 bg-white p-6">
              <WizardHeader
                 title={t("work.header.title")}
                description={t("work.header.description")}
              />

              <div className="mt-5 space-y-4">
                {/* Work Mode */}
                <div className="flex flex-col md:flex-row">
                  <WizardSelect
                    label={t("work.fields.work_mode")}
                    value={formData.work_mode || ""}
                    onChange={(v) => handleFieldChange("work_mode", v)}
                    options={workModeOptions}
                    required
                    error={showErrors ? errors.work_mode : ""}
                  />
                </div>

                {/* Dates */}
                <div className="flex flex-col md:flex-row gap-3">
                  <WizardDateInput
                    label={t("work.fields.start_date")}
                    value={formData.starts_at || ""}
                    onChange={(v) => handleFieldChange("starts_at", v)}
                    required
                    error={showErrors ? errors.starts_at : ""}
                  />
                  <WizardDateInput
                    label={t("work.fields.end_date")}
                    value={formData.ends_at || ""}
                    onChange={(v) => handleFieldChange("ends_at", v)}
                    required={false}
                    error={showErrors ? errors.ends_at : ""}
                  />
                </div>

                {/* Switches */}
                <div className="flex flex-col md:flex-row gap-3">
                  <WizardSwitch
                    label={t("work.fields.first_aid")}
                    checked={!!formData.first_aid_verified}
                    onChange={(v) => handleFieldChange("first_aid_verified", v)}
                  />
                  <WizardSwitch
                    label={t("work.fields.police")}
                    checked={!!formData.police_verified}
                    onChange={(v) => handleFieldChange("police_verified", v)}
                  />
                </div>

                {/* Navigation */}
                <WizardDirection
                  prev
                  onPrev={handlePrev}
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
  );
}
