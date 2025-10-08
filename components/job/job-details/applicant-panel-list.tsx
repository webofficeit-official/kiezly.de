"use client";

import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useJobApplicants, useUpdateApplicantStatus } from "@/lib/react-query/queries/apply-job";
import toast from "react-hot-toast";
import { Select } from "@/components/shared-ui/custom-select/custom-select";

interface ApplicantsPanelProps {
  jobId: string | number;
  userRole: string;
}

const statusOptions = [
  { id: 1, name: "applied" },
  { id: 2, name: "shortlisted" },
  { id: 3, name: "hired" },
  { id: 4, name: "rejected" },
  { id: 5, name: "withdrawn" },
];

export default function ApplicantsPanel() {
  

  return (
    <></>
  );
}
