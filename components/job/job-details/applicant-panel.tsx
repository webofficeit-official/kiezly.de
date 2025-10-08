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

export default function ApplicantsPanel({ jobId, userRole }: ApplicantsPanelProps) {
  const { data: applicants, isLoading } = useJobApplicants(jobId, userRole === "client");
  const updateStatusMutation = useUpdateApplicantStatus();

  const handleStatusChange = (applicationId: string, status: string) => {
    updateStatusMutation.mutate(
      { applicationId, status },
      {
        onSuccess: () => toast.success("Application status updated!"),
        onError: (err: any) => toast.error(err?.message || "Failed to update status."),
      }
    );
  };

  if (userRole !== "client") return null;

  return (
    <aside className="lg:sticky lg:top-6">
      <Card className="shadow-sm border rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Applicants</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-gray-500 text-sm">Loading applicants...</p>
          ) : applicants && applicants.length > 0 ? (
            <ul className="space-y-4">
              {applicants.map((applicant: any) => (
                <li
                  key={applicant.id}
                  className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
                >
                  {/* Top section: Name and Status */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {applicant.user.first_name} {applicant.user.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{applicant.user.email}</div>
                    </div>

                    <Select
                      label=""
                      value={statusOptions.find((o) => o.name === applicant.status) || null}
                      onChange={(selected) =>
                        handleStatusChange(applicant.id, selected?.name || "")
                      }
                      options={statusOptions}
                      placeholder="Change status"
                      searchable={false}
                    />
                  </div>

                  {/* Body section */}
                  <div className="mt-3 text-sm text-gray-700 space-y-1">
                    <div>
                      <span className="font-medium">Proposed Rate:</span> {applicant.proposed_rate} €
                    </div>

                    {applicant.cover_note && (
                      <div className="bg-gray-50 rounded-lg p-2 text-gray-700">
                        <span className="font-medium">Cover Note:</span>
                        <p>{applicant.cover_note}</p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Applied on {new Date(applicant.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No applicants yet.</p>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
