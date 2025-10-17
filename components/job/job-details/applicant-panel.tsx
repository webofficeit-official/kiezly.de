"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Placeholder for your Button component
import { useJobApplicants, useUpdateApplicantStatus } from "@/lib/react-query/queries/apply-job";
import UpdateStatusModal from "@/components/ui/UpdateStatusModal";
import { useRouter } from "next/navigation";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";

interface ApplicantsPanelProps {
  jobId: string | number;
  user: any;
}

const getStatusClasses = (status: string) => {
  switch (status.toLowerCase()) {
    case 'accepted':
      return 'bg-gray-800 text-white border border-gray-900'; // Darkest for success
    case 'shortlisted':
      return 'bg-gray-300 text-gray-800 border border-gray-400'; // Medium for in-progress
    case 'rejected':
      return 'bg-red-300 text-grey-700 border border-red-400'; // Border for negative
    case 'withdrawn':
      return 'bg-gray-50 text-gray-500 border border-gray-100'; // Lightest for inactive
    case 'applied':
    default:
      return 'bg-gray-100 text-gray-600 border border-gray-200'; // Default
  }
}


export default function ApplicantsPanel({ jobId, user }: ApplicantsPanelProps) {
  if (!jobId) return null;
  const { data, isLoading } = useJobApplicants({
    jobId: jobId.toString(),
    page: 1,
    pageSize: 3,
    status: '',
    sort: 'asc',
    enabled: user?.role === 'client', // <-- include here if your hook supports it
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const openUpdateModal = (applicant: any) => {
    setSelectedApplicant(applicant);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApplicant(null);
  };

  const router = useRouter()
  const { push } = useLocalizedRouter();

  if (user?.role !== "client") return null;

  return (
    <aside className="lg:sticky lg:top-6">
      <Card className="shadow-lg border-b border-gray-200 rounded-xl bg-white">
        <CardHeader className="border-b border-gray-100 p-4 sm:p-5">
          <CardTitle className="text-xl font-bold text-gray-900">
            Applicants <span className="text-gray-500 font-medium ml-1">({data?.applicants?.length || 0})</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          {isLoading ? (
            <p className="text-gray-500 text-sm italic">Loading applicants...</p>
          ) : data && data?.applicants && data?.applicants.length > 0 ? (
            <ul className="space-y-4">
              {data?.applicants.map((applicant: any) => (
                <li
                  key={applicant.id}
                  className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm hover:shadow-md transition-all duration-150"
                >
                  {/* Top section: Name and Status */}
                  <div className="flex items-start justify-between">
                    <div onClick={() => {
                      push(`/`)
                    }}>
                      <div className="font-semibold text-lg text-gray-900 line-clamp-1">
                        {applicant.user.first_name} {applicant.user.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{applicant.user.email}</div>
                    </div>
                    {/* Current Status Badge */}
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusClasses(applicant.status)}`}
                    >
                      {applicant.status}
                    </span>
                  </div>

                  {/* Separator */}
                  <hr className="my-3 border-gray-100" />

                  {/* Body section */}
                  <div className="text-sm text-gray-700 space-y-3">
                    {/* Rate & Status Row */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-800">
                        Rate: <span className="font-bold text-gray-900">{applicant.proposed_rate} €</span>
                      </div>
                    </div>

                    {/* Cover Note Section */}
                    {applicant.cover_note && (
                      <div className="rounded-lg text-gray-700">
                        <span className="font-semibold text-gray-800 block mb-1">Cover Note :</span>
                        <p className="text-sm line-clamp-3">{applicant.cover_note}</p>
                      </div>
                    )}

                    {/* Footer/Action Row */}
                    <div className="flex justify-between items-center pt-1">
                      <div className="text-xs text-gray-500">
                        Applied: {new Date(applicant.created_at).toLocaleDateString()}
                      </div>

                      {/* Status Update Button */}
                      <Button
                        variant="outline"
                        className="text-sm font-medium text-gray-800 border-gray-300 hover:bg-gray-100 px-4 py-2 h-auto"
                        onClick={() => openUpdateModal(applicant)}
                      >
                        Update Status
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm italic py-2">No applicants have applied yet.</p>
          )}
        </CardContent>
      </Card>
      <UpdateStatusModal
        isOpen={isModalOpen}
        onClose={closeModal}
        applicant={selectedApplicant}
      />
    </aside>
  );
}
