"use client";

import React from "react";
import { Button } from "@/components/ui/button-variant";

interface Applicant {
  id: string;
  proposed_rate?: number;
  cover_note?: string;
  created_at: string;
  status: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface ApplicantCardProps {
  applicant: Applicant;
  openUserModal: (userId: string) => void;
  openUpdateModal: (applicant: Applicant) => void;
}

export default function ApplicantCard({ applicant, openUserModal, openUpdateModal }: ApplicantCardProps) {
  const getStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "px-3 py-1 rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300";
      case "shortlisted":
        return "px-3 py-1 rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-300";
      case "applied":
        return "px-3 py-1 rounded-xl bg-blue-100 text-blue-700 ring-1 ring-blue-300";
      case "rejected":
        return "px-3 py-1 rounded-xl bg-red-100 text-red-700 ring-1 ring-red-300";
      case "withdrawn":
        return "px-3 py-1 rounded-xl bg-gray-100 text-gray-600 ring-1 ring-gray-300";
      default:
        return "px-3 py-1 rounded-xl bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm hover:shadow-md transition-all duration-150 flex flex-col">
      {/* Top Section */}
      <div className="flex items-start justify-between">
        <div
          onClick={() => openUserModal(applicant.user.id)}
          className="cursor-pointer"
        >
          <div className="font-semibold text-lg text-gray-900 line-clamp-1">
            {applicant.user.first_name} {applicant.user.last_name}
          </div>
          <div className="text-xs text-gray-500">{applicant.user.email}</div>
        </div>

        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusClasses(applicant.status)}`}>
          {applicant.status}
        </span>
      </div>

      <hr className="my-3 border-gray-100" />

      {/* Body Section */}
      <div className="text-sm text-gray-700 space-y-3 flex-1">
        {applicant.proposed_rate && (
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-800">
              Propsed Rate: <span className="font-bold text-gray-900">{applicant.proposed_rate} €</span>
            </div>
          </div>
        )}

        {applicant.cover_note && (
          <div className="rounded-lg text-gray-700">
            <span className="font-semibold text-gray-800 block mb-1">Cover Note:</span>
            <p className="text-sm line-clamp-3">{applicant.cover_note}</p>
          </div>
        )}
      </div>

      {/* Footer / Action Row */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
        <div className="text-xs text-gray-500">
          Applied: {new Date(applicant.created_at).toLocaleDateString()}
        </div>
        <div>
          <Button
            variant="outline"
            className="text-sm font-medium text-gray-800 border-gray-300 hover:bg-gray-100 px-4 py-2 h-auto"
            onClick={() => openUpdateModal(applicant)}
          >
            Update Status
          </Button>
        </div>
      </div>
    </div>
  );
}
