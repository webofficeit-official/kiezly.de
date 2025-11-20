"use client";

import { Card } from "@/components/ui/card";
import { WizardDirection } from "@/components/wizard/WizardDirection";
import { WizardHeader } from "@/components/wizard/WizardHeader";
import { WizardInput } from "@/components/wizard/WizardInput";
import { WizardSelect } from "@/components/wizard/WizardSelect";
import { WizardNavigation } from "@/components/wizard/WizardNavigation";
import { useJobWizard } from "@/lib/context/job-wizard-context";
import { useJob, useUpdateJob } from "@/lib/react-query/queries/useJob";
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
  const { push } = useLocalizedRouter();
  const t = useT("post-job");

  const { formData, updateForm, jobId, setJobId, mode, setMode,version } =
    useJobWizard();
  const { data: existingJob } = useJob(slug || "");
  const updateJobMutation = useUpdateJob(jobId ?? undefined);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [contactMethod, setContactMethod] = useState<string>(
    formData.contact_method || "email_relay"
  );

  /* ----------------------------- Fetch Existing Job ----------------------------- */
  useEffect(() => {
    if (slug && existingJob?.job) {
      setMode("edit");
      setJobId(existingJob.job.id);
      updateForm(mapJobToForm(existingJob.job));
      setContactMethod(existingJob.job.contact_method || "email_relay");
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

  /* ----------------------------- Normalize Data ----------------------------- */
  const normalizeJobForForm = (job: any) => ({
    contact_method: job.contact_method || "email_relay",
    contact_email: job.contact_email || "",
    contact_phone: job.contact_phone || "",
    contact_link: job.contact_link || "",
  });

  /* ----------------------------- Validation ----------------------------- */
  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    if (!contactMethod) newErrors.contact_method = t("contact.validation.method_required");

    if (
      ["email_relay", "direct_email"].includes(contactMethod) &&
      !formData.contact_email?.trim()
    ) {
      newErrors.contact_email = t("contact.validation.email_required");
    } else if (
      ["email_relay", "direct_email"].includes(contactMethod) &&
      formData.contact_email
    ) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contact_email)) {
        newErrors.contact_email = t("contact.validation.email_invalid");
      }
    }

    if (contactMethod === "phone" && !formData.contact_phone?.trim()) {
      newErrors.contact_phone = t("contact.validation.phone_required");
    }

    if (contactMethod === "external_link") {
      if (!formData.contact_link?.trim()) {
        newErrors.contact_link = t("contact.validation.link_required");
      } else {
        try {
          const url = new URL(formData.contact_link.trim());
          // allow only http and https
          if (!["http:", "https:"].includes(url.protocol)) {
            newErrors.contact_link = t("contact.validation.link_protocol");
          }
        } catch {
          newErrors.contact_link =
            t("contact.validation.link_invalid");
        }
      }
    }

    setErrors(newErrors);
    return newErrors;
  };

  /* ----------------------------- Handle Change ----------------------------- */
  const handleFieldChange = (field: string, value: string) => {
    updateForm({ [field]: value });
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  /* ----------------------------- Save & Navigation ----------------------------- */
  const handleSave = async () => {
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setShowErrors(true);
      toast.error(t("common.fix_errors"));
      return;
    }

    const payload = {
      contact_method: contactMethod,
      contact_email: formData.contact_email || "",
      contact_phone: formData.contact_phone || "",
      contact_link: formData.contact_link || "",
      status: formData.status === "draft" ? "pending_review" : formData.status,
    };

    try {
      if (jobId) {
        await updateJobMutation.mutateAsync(payload, {
          onSuccess: () => {
            toast.success(t("contact.toasts.save_success"));
            push(`/jobs/${slug}`); // redirect to job page or summary
          },
          onError: () => toast.error(t("contact.toasts.save_failure")),
        });
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handlePrev = () => push(`/post-job/work-details?slug=${slug}`);

  /* ----------------------------- Render ----------------------------- */
  return (
    <>
      <div  key={version} className="min-h-screen bg-gray-50 text-gray-900">
        <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Header */}
          <section className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold"> {t("page_title")}</h2>
              </div>
            </div>
          </section>

          <Card className="lg:col-span-3 space-y-4">
            <div className="grid grid-cols-12 gap-4">
              {/* Sidebar */}
              <div className="col-span-12 sm:col-span-6 lg:col-span-5 bg-gray-100 p-6">
                <StepSidebar current="contact" slug={formData?.slug || slug} />
              </div>

              {/* Main Form */}
              <div className="col-span-12 sm:col-span-6 lg:col-span-7 bg-white p-6">
                <WizardHeader
                  title={t("contact.header.title")}
                  description={t("contact.header.description")}
                />

                <div className="mt-5">
                  <div className="flex flex-col md:flex-row gap-3">
                    <WizardSelect
                      label={t("contact.fields.contact_method")}
                      value={contactMethod}
                      onChange={(e) => {
                        setContactMethod(e);
                        updateForm({ contact_method: e });
                      }}
                      options={[
                        { label: t(`contact.methods.email_relay`), value: "email_relay" },
                        { label: t(`contact.methods.direct_email`), value: "direct_email" },
                        { label: t(`contact.methods.phone`), value: "phone" },
                        { label: t(`contact.methods.external_link`), value: "external_link" },
                      ]}
                      required
                      error={showErrors ? errors.contact_method : ""}
                    />

                    {/* Conditional Inputs */}
                    {(contactMethod === "email_relay" ||
                      contactMethod === "direct_email") && (
                      <WizardInput
                        label={t("contact.fields.email")}
                        placeholder="you@example.com"
                        value={formData.contact_email || ""}
                        onChange={(v) => handleFieldChange("contact_email", v)}
                        required
                        error={showErrors ? errors.contact_email : ""}
                      />
                    )}

                    {contactMethod === "phone" && (
                      <WizardInput
                        label={t("contact.fields.phone")}
                        placeholder="+49 123 456 7890"
                        value={formData.contact_phone || ""}
                        onChange={(v) => handleFieldChange("contact_phone", v)}
                        required
                        error={showErrors ? errors.contact_phone : ""}
                      />
                    )}

                    {contactMethod === "external_link" && (
                      <WizardInput
                       label={t("contact.fields.link")}
                        placeholder="https://example.com"
                        value={formData.contact_link || ""}
                        onChange={(v) => handleFieldChange("contact_link", v)}
                        required
                        error={showErrors ? errors.contact_link : ""} 
                      />
                    )}
                  </div>

                  {/* Navigation */}
                  <WizardDirection
                    prev
                    onPrev={handlePrev}
                    save
                    onSave={handleSave}
                    isNextLoading={updateJobMutation.isPending}
                    mode={jobId ? "edit" : mode}
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
