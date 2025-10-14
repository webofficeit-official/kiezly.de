"use client";

import { JobWizardProvider } from "@/lib/context/job-wizard-context";


export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <JobWizardProvider>{children}</JobWizardProvider>;
}
