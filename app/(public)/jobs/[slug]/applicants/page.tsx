"use client";

import ApplicantsPanelList from "@/components/job/job-details/applicant-panel-list";
import React from "react";

export default function Page({ params }: { params: { slug: string } }) {
  return <ApplicantsPanelList params={params} />;
}