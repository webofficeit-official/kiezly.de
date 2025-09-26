"use client";
import React, { useState } from "react";
import { CreateJobData } from "@/lib/types/job";
import { useCreateJob, useUpdateJob } from "@/lib/react-query/queries/useJob";
import toast from "react-hot-toast";

// Dummy imports, replace with your actual components
import Input from "./Input";
import RichTextEditor from "./RichTextEditor";
import Select from "./Select";
import MultiSelect from "./MultiSelect";
import DateInput from "./DateInput";

const initialForm: CreateJobData = {
  title: "",
  category_id: null,
  job_type: [],
  country: "",
  city: "",
  street: "",
  description: "",
  tasks: "",
  languages: [],
  requirements: [],
  starts_at: undefined,
  ends_at: undefined,
  expected_hours: null,
  price_min: null,
  price_max: null,
  currency: "EUR",
  email: "",
  phone: "",
  privacy_mask_email: false,
  privacy_mask_phone: false
};

const steps = [
  "Basics",
  "Details",
  "Schedule",
  "Budget",
  "Contact & Privacy",
  "Review & Submit"
];

export default function JobWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateJobData>(initialForm);
  const [jobId, setJobId] = useState<number | null>(null);

  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();

  const handleChange = (key: keyof CreateJobData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = async () => {
    if (step === 0) {
      // Step 1: create job
      if (!form.title || !form.category_id || !form.job_type.length) {
        toast.error("Please fill in required basics");
        return;
      }
      createJobMutation.mutate(form, {
        onSuccess: data => {
          toast.success("Job created!");
          setJobId(data.id);
          setStep(prev => prev + 1);
        },
        onError: (err: any) => toast.error(err?.message || "Failed to create job")
      });
    } else {
      // Steps 2-5: update job
      if (!jobId) return;
      updateJobMutation.mutate({ id: jobId, ...form }, {
        onSuccess: () => {
          toast.success("Step saved!");
          setStep(prev => prev + 1);
        },
        onError: (err: any) => toast.error(err?.message || "Failed to save")
      });
    }
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-xl shadow space-y-6">
      <h2 className="text-xl font-semibold">{steps[step]}</h2>

      {/* Step Forms */}
      {step === 0 && (
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={v => handleChange("title", v)} required />
          <Select label="Category" value={form.category_id ? { id: form.category_id, name: "" } : null} onChange={opt => handleChange("category_id", opt?.id || null)} options={[{id:1,name:"Cat A"},{id:2,name:"Cat B"}]} required />
          <MultiSelect label="Job Type" options={[{id:"full-time",name:"Full-time"},{id:"part-time",name:"Part-time"}]} values={form.job_type} onChange={v => handleChange("job_type", v)} />
          <Input label="Country" value={form.country} onChange={v => handleChange("country", v)} />
          <Input label="City" value={form.city} onChange={v => handleChange("city", v)} />
          <Input label="Street" value={form.street} onChange={v => handleChange("street", v)} />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <RichTextEditor label="Description" value={form.description} onChange={v => handleChange("description", v)} />
          <Input label="Tasks" value={form.tasks} onChange={v => handleChange("tasks", v)} />
          <MultiSelect label="Languages" options={[{id:"en",name:"English"},{id:"de",name:"German"}]} values={form.languages} onChange={v => handleChange("languages", v)} />
          <MultiSelect label="Requirements" options={[{id:"req1",name:"Requirement 1"},{id:"req2",name:"Requirement 2"}]} values={form.requirements} onChange={v => handleChange("requirements", v)} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <DateInput label="One-time date/time" value={form.starts_at || ""} onChange={v => handleChange("starts_at", v)} />
          <Input type="number" label="Expected Hours" value={form.expected_hours || ""} onChange={v => handleChange("expected_hours", Number(v))} />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Input type="number" label="Hourly Rate / Fixed Budget Min" value={form.price_min || ""} onChange={v => handleChange("price_min", Number(v))} />
          <Input type="number" label="Max" value={form.price_max || ""} onChange={v => handleChange("price_max", Number(v))} />
          <Input label="Currency" value={form.currency} onChange={v => handleChange("currency", v)} />
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <Input label="Email" value={form.email} onChange={v => handleChange("email", v)} />
          <Input label="Phone" value={form.phone} onChange={v => handleChange("phone", v)} />
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.privacy_mask_email} onChange={e => handleChange("privacy_mask_email", e.target.checked)} />
            <span>Mask Email</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.privacy_mask_phone} onChange={e => handleChange("privacy_mask_phone", e.target.checked)} />
            <span>Mask Phone</span>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <h3 className="font-medium">Review Your Job:</h3>
          <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(form, null, 2)}</pre>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {step > 0 && <button onClick={prevStep} className="px-4 py-2 border rounded">Back</button>}
        <button onClick={nextStep} className="px-4 py-2 bg-black text-white rounded">
          {step === 0 ? "Create Job" : step === steps.length - 1 ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}
