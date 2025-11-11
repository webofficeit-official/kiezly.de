"use client";
import { useT } from "@/app/[locale]/layout";
import { Card } from "@/components/ui/card";
import { StepSidebar } from "@/components/wizard/StepSidebar";
import { WizardDirection } from "@/components/wizard/WizardDirection";
import { WizardHeader } from "@/components/wizard/WizardHeader";
import { WizardInput } from "@/components/wizard/WizardInput";
import { WizardNavigation } from "@/components/wizard/WizardNavigation";
import { WizardSelect } from "@/components/wizard/WizardSelect";
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

/* ----------------------------- Type Definitions ----------------------------- */
interface Country {
  id: string | number;
  name: string;
  code?: string;
  currency?: string;
}

/* ----------------------------- Component ----------------------------- */
export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const { push } = useLocalizedRouter();
  const t = useT("post-job");

  const { formData, updateForm, jobId, setJobId, mode, setMode,version } =
    useJobWizard();
  const { data: basicCollections } = useJobCollections();
  const updateJobMutation = useUpdateJob(jobId ?? undefined);

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
    category_id: job.category_id ? String(job.category_id) : "",
    tag_ids: job.tags?.map((t: any) => String(t.id)) || [],
    job_type: job.job_type || [],
    job_experience: job.job_experience || [],
    status: job.status || "draft",
    description: job.description || "",
    tasks: job.tasks || "",
    requirements: job.requirements || "",
    languages: job.tags?.map((t: any) => String(t.id)) || [],
    country: job.country || "",
    postal_code: job.postal_code || "",
    street: job.street || "",
    city: job.city || "",
    state: job.state || "",
    lat: job.lat || "",
    lng: job.lng || "",
    currency: job.currency || "",
    price_type: job.price_type || "fixed",
    price_value: job.price_value || "",
    price_min: job.price_min || "",
    price_max: job.price_max || "",
  });

  /* ----------------------------- Data Mapping ----------------------------- */
  const countries: Country[] = basicCollections?.countries || [];

  const currencyOptions = countries
    .filter((c) => !!c.currency)
    .map((c) => ({
      label: c.currency as string,
      value: c.currency as string,
    }))
    .filter((v, i, self) => i === self.findIndex((x) => x.value === v.value));

  /* ----------------------------- Auto-Detect Currency ----------------------------- */
  useEffect(() => {
    if (!countries.length) return;

    // if a country exists but no currency set, auto-set it
    if (formData.country && !formData.currency) {
      const selectedCountry = countries.find(
        (c) => String(c.id) === String(formData.country)
      );
      if (selectedCountry?.currency) {
        updateForm({
          currency: selectedCountry.currency,
          price_type: formData.price_type || "fixed",
        });
      }
    }
  }, [countries, formData?.country, loading]);

  /* ----------------------------- Validation ----------------------------- */
  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currency || formData.currency === "")
      newErrors.currency =  t("pricing.validation.currency_required");

    if (!formData.price_type || formData.price_type === "")
      newErrors.price_type = t("pricing.validation.price_type_required");

    if (formData.price_type === "fixed") {
      if (!formData.price_value || Number(formData.price_value) <= 0)
        newErrors.price_value = t("pricing.validation.fixed_gt_zero");
    }

    if (formData.price_type === "range") {
      if (
        formData.price_min === "" ||
        formData.price_min === undefined ||
        Number(formData.price_min) < 0
      )
        newErrors.price_min =  t("pricing.validation.min_gte_zero");

      if (
        formData.price_max === "" ||
        formData.price_max === undefined ||
        Number(formData.price_max) < Number(formData.price_min)
      )
        newErrors.price_max = t("pricing.validation.max_gte_min");
    }

    setErrors(newErrors);
    return newErrors;
  };

  /* ----------------------------- Handlers ----------------------------- */
  const handleFieldChange = (field: string, value: string) => {
    updateForm({ [field]: value });
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handlePriceTypeChange = (value: string) => {
    handleFieldChange("price_type", value);
    if (value === "fixed") updateForm({ price_min: "", price_max: "" });
    if (value === "range") updateForm({ price_value: 1 });
  };

  /* ----------------------------- Navigation ----------------------------- */
  const handleNext = async () => {
    const newErrors = validateFields();
    if (Object.keys(newErrors).length > 0) {
      setShowErrors(true);
      toast.error(t("common.fix_errors"));
      return;
    }

    const payload = {
      currency: formData.currency,
      price_type: formData.price_type,
      price_value: formData.price_value || 1,
      price_min: formData.price_min || null,
      price_max: formData.price_max || null,
      status: formData.status ? formData.status : "draft",
    };

    try {
      if (jobId) {
        await updateJobMutation.mutateAsync(payload, {
          onSuccess: () => {
            // toast.success("Pricing details updated successfully!");
            push(`/post-job/work-details?slug=${slug}`);
          },
          onError: () => toast.error(t("pricing.toasts.update_failure")),
        });
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handlePrev = () => push(`/post-job/location-details?slug=${slug}`);

  /* ----------------------------- Derived ----------------------------- */
  const isFixed = formData.price_type === "fixed";
  const isRange = formData.price_type === "range";

  const symbol =
    formData.currency === "EUR"
      ? "€"
      : formData.currency === "USD"
      ? "$"
      : formData.currency === "INR"
      ? "₹"
      : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading pricing details...
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
              <StepSidebar current="pricing" slug={formData?.slug || slug} />
            </div>

            {/* Main Form */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-7 bg-white p-6">
              <WizardHeader
                 title={t("pricing.header.title")}
                description={t("pricing.header.description")}
              />

              <div className="mt-5 space-y-4">
                {/* Currency + Price Type */}
                <div className="flex flex-col md:flex-row gap-3">
                  <WizardSelect
                    label={t("pricing.fields.currency")}
                    value={formData.currency || ""}
                    onChange={(v) => handleFieldChange("currency", v)}
                    options={currencyOptions}
                    required
                    error={showErrors ? errors.currency : ""}
                  />

                  <WizardSelect
                     label={t("pricing.fields.price_type")}
                    value={formData.price_type || "fixed"}
                    onChange={(v) => handlePriceTypeChange(v)}
                    options={[
                      { label: "Fixed", value: "fixed" },
                      { label: "Range", value: "range" },
                    ]}
                    required
                    error={showErrors ? errors.price_type : ""}
                  />
                </div>

                {/* Fixed Price */}
                {isFixed && (
                  <div className="flex flex-col md:flex-row">
                    <WizardInput
                      label={`${t("pricing.fields.price_value")} (${symbol})`}
                      placeholder="50"
                      value={formData.price_value || ""}
                      onChange={(v) => handleFieldChange("price_value", v)}
                      required
                      error={showErrors ? errors.price_value : ""}
                    />
                  </div>
                )}

                {/* Range Price */}
                {isRange && (
                  <div className="flex flex-col md:flex-row gap-3">
                    <WizardInput
                      label={`${t("pricing.fields.price_min")} (${symbol})`}
                      placeholder="10"
                      value={formData.price_min || ""}
                      onChange={(v) => handleFieldChange("price_min", v)}
                      required
                      error={showErrors ? errors.price_min : ""}
                    />
                    <WizardInput
                      label={`${t("pricing.fields.price_max")} (${symbol})`}
                      placeholder="100"
                      value={formData.price_max || ""}
                      onChange={(v) => handleFieldChange("price_max", v)}
                      required
                      error={showErrors ? errors.price_max : ""}
                    />
                  </div>
                )}

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
