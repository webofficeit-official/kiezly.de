"use client";
import { useT } from "@/app/[locale]/layout";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { StepSidebar } from "@/components/wizard/StepSidebar";
import { WizardDirection } from "@/components/wizard/WizardDirection";
import { WizardHeader } from "@/components/wizard/WizardHeader";
import { WizardMultiSelect } from "@/components/wizard/WizardMultiSelect";
import { WizardNavigation } from "@/components/wizard/WizardNavigation";
import { WizardRichText } from "@/components/wizard/WizardRichText";
import { useJobWizard } from "@/lib/context/job-wizard-context";
import {
  useJob,
  useJobCollections,
  useUpdateJob,
} from "@/lib/react-query/queries/useJob";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const { formData, updateForm, jobId, setJobId, mode, setMode,version } =
    useJobWizard();
  const { data: basicCollections } = useJobCollections();
  const updateJobMutation = useUpdateJob(jobId ?? undefined);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const { push } = useLocalizedRouter();
  const t = useT("post-job");
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
    category_id: job.category_id ? String(job.category_id) : "",
    tag_ids: job.tags?.map((t: any) => String(t.id)) || [],
    job_type: job.job_type || [],
    job_experience: job.job_experience || [],
    status: job.status || "draft",
    description: job.description || "",
    tasks: job.tasks || "",
    requirements: job.requirements || "",
    languages: job.job_languages?.map((t: any) => String(t.id)) || []
  });
  /* ----------------------------- Options ----------------------------- */
  const languageOptions =
    basicCollections?.languages?.map((lang) => ({
      label: lang.name,
      value: String(lang.id),
    })) || [];

  const selectedLanguageOptions = languageOptions.filter((opt) =>
    (formData?.languages || []).map(String).includes(opt.value)
  );
  /* ----------------------------- Validation ----------------------------- */
  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description || formData.description.trim() === "") {
      newErrors.description = t("details.validation.description_required");
    } else {
      const text = formData.description.replace(/<(.|\n)*?>/g, "").trim();
      if (!text)
        newErrors.description = t("details.validation.description_empty");
    }

    setErrors(newErrors);
    return newErrors;
  };

  /* ----------------------------- Field Change ----------------------------- */
  const handleFieldChange = (field: string, value: any) => {
    updateForm({ [field]: value });

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  /* ----------------------------- Handle Next ----------------------------- */
  const handleNext = async () => {
    const validationErrors = validateStep();
    if (Object.keys(validationErrors).length > 0) {
      setShowErrors(true);
      toast.error(t("common.fix_errors"));
      return;
    }

    const payload = {
      description: formData.description,
      tasks: formData.tasks,
      requirements: formData.requirements,
      languages: formData.languages || [],
      status: formData.status ? formData.status : "draft",
    };

    try {
      if (jobId) {
        await updateJobMutation.mutateAsync(payload, {
          onSuccess: () => {
            // toast.success("Job details updated!");
            push(`/post-job/location-details?slug=${formData.slug || slug}`);
          },
          onError: () => toast.error("Failed to update job details."),
        });
      }
    } catch (err) {
      console.error("Error updating job details:", err);
    }
  };

  /* ----------------------------- Render ----------------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        <Loader />
      </div>
    );
  }

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
            <StepSidebar current="details" slug={formData?.slug || slug} />
            </div>

            {/* Main Form */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-7 bg-white p-6">
              <WizardHeader
                title={t("details.header.title")}
                description={t("details.header.description")}
              />

              <div className="mt-5 space-y-4">
                {/* Description */}
                <WizardRichText
                  label={t("details.fields.description")}
                  value={formData?.description || ""}
                  onChange={(v) => handleFieldChange("description", v)}
                  placeholder={t("details.placeholders.description")}
                  required
                  error={showErrors ? errors.description : ""}
                />

                {/* Languages */}
                <WizardMultiSelect
                  label={t("details.fields.languages")}
                  values={formData?.languages || []}
                  onChange={(v) => updateForm({ languages: v })}
                  options={languageOptions || []}
                />

                {/* Requirements & Tasks */}
                <div className="flex flex-col md:flex-row gap-3">
                  <WizardRichText
                    label={t("details.fields.requirements")}
                    value={formData?.requirements || ""}
                    onChange={(v) => updateForm({ requirements: v })}
                    placeholder={t("details.placeholders.requirements")}
                  />
                  <WizardRichText
                    label={t("details.fields.tasks")}
                    value={formData?.tasks || ""}
                    onChange={(v) => updateForm({ tasks: v })}
                    placeholder={t("details.placeholders.tasks")}
                  />
                </div>

                {/* Navigation */}
                <WizardDirection
                  prev
                  prevLink={`/post-job/basic-details?slug=${
                    formData?.slug || slug
                  }`}
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
