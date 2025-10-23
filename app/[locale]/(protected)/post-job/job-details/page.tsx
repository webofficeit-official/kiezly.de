"use client";
import { useT } from "@/app/[locale]/layout";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
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

  const { formData, updateForm, jobId, setJobId, mode, setMode } =
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
    languages: job.languages?.map((t: any) => String(t.id)) || [],
  });
  /* ----------------------------- Options ----------------------------- */
  const languageOptions =
    basicCollections?.languages?.map((lang) => ({
      label: lang.name,
      value: String(lang.id),
    })) || [];

  /* ----------------------------- Validation ----------------------------- */
  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description || formData.description.trim() === "") {
      newErrors.description = "Job description is required.";
    } else {
      const text = formData.description.replace(/<(.|\n)*?>/g, "").trim();
      if (!text) newErrors.description = "Job description cannot be empty.";
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
      toast.error("Please fix the required fields.");
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
      } else {
        push(`/post-job/location-details?slug=${formData.slug || slug}`);
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
    <div className="min-h-screen bg-gray-50 text-gray-900">
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
              <div className="flex flex-wrap justify-center lg:flex-col gap-2 lg:space-y-4">
                <WizardNavigation
                  title={t("basic.header.title")}
                  description={t("basic.header.description")}
                  count={1}
                  current={false}
                  finished
                />
                <WizardNavigation
                  title={t("details.header.title")}
                  description={t("details.header.sidebar_description")}
                  count={2}
                  current
                  finished={false}
                />
                <WizardNavigation
                  title={t("location.header.title")}
                  description={t("location.header.description")}
                  count={3}
                  current={false}
                  finished={false}
                />
                <WizardNavigation
                  title={t("pricing.header.title")}
                  description={t("pricing.header.description")}
                  count={4}
                  current={false}
                  finished={false}
                />
                <WizardNavigation
                  title={t("work.header.title")}
                  description={t("work.header.sidebar_description")}
                  count={5}
                  current={false}
                  finished={false}
                />
                <WizardNavigation
                  title={t("contact.header.title")}
                  description={t("contact.header.description")}
                  count={6}
                  current={false}
                  finished={false}
                />
              </div>
            </div>

            {/* Main Form */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-7 bg-white p-6">
              <WizardHeader
                title="Job Details"
                description="Provide detailed information about the job"
              />

              <div className="mt-5 space-y-4">
                {/* Description */}
                <WizardRichText
                  label="Job Description"
                  value={formData?.description || ""}
                  onChange={(v) => handleFieldChange("description", v)}
                  placeholder="Write the job description here..."
                  required
                  error={showErrors ? errors.description : ""}
                />

                {/* Languages */}
                <WizardMultiSelect
                  label="Languages"
                  values={formData?.languages || []}
                  onChange={(v) => updateForm({ languages: v })}
                  options={languageOptions || []}
                />

                {/* Requirements & Tasks */}
                <div className="flex flex-col md:flex-row gap-3">
                  <WizardRichText
                    label="Requirements"
                    value={formData?.requirements || ""}
                    onChange={(v) => updateForm({ requirements: v })}
                    placeholder="Write the requirements here..."
                  />
                  <WizardRichText
                    label="Tasks"
                    value={formData?.tasks || ""}
                    onChange={(v) => updateForm({ tasks: v })}
                    placeholder="Write the tasks here..."
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
