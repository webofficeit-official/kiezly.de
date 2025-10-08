// components/modals/UpdateStatusModal.jsx (Example structure)
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select } from '../job/list';
import { useUpdateApplicantStatus } from '@/lib/react-query/queries/apply-job';
import toast from 'react-hot-toast';
// Assuming you have a Select component for the status change

const statusOptions = [
    { label: "Shortlisted", value: "shortlisted" },
    { label: "Accepted", value: "accepted" },
    { label: "Rejected", value: "rejected" },
];

export default function UpdateStatusModal({ isOpen, onClose, applicant }) {
    if (!isOpen || !applicant) return null;

    // Placeholder for internal state (selected status)
    const [newStatus, setNewStatus] = useState(applicant.status);
    const updateStatus = useUpdateApplicantStatus();

    const handleUpdateStatus = () => {
        updateStatus.mutate({
            applicationId: applicant.id,
            status: newStatus
        }, {
            onSuccess: () => toast.success("Application status changed successfully!"),
            onError: (err: any) => toast.error(err?.message || "Failed to update status."),
        })

    }

    return (
        // 1. Modal Backdrop (Dark Overlay)
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

                {/* Backdrop overlay */}
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* This element is to trick the browser into centering the modal contents. */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* 2. Modal Panel (The actual content box) */}
                <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">

                    {/* Header */}
                    <div className="bg-white px-6 py-4 border-b border-gray-100">
                        <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                            Update Status for {applicant.user.first_name} {applicant.user.last_name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Current Status: <span className="font-semibold text-gray-800 capitalize">{applicant.status}</span>
                        </p>
                    </div>

                    {/* Body/Content */}
                    <div className="px-6 py-5 space-y-4">

                        {/* Status Selector */}
                        <div className="">
                            <Select
                                options={statusOptions}
                                value={newStatus}
                                onChange={(v) => {
                                    setNewStatus(v)
                                }}
                                label="Status"
                            />
                        </div>

                        {/* Applicant Details Snippet */}
                        <div className="text-sm text-gray-700 mt-4">
                            <p><span className="font-semibold text-gray-800">Rate:</span> {applicant.proposed_rate} €</p>
                            {applicant.cover_note && (
                                <p className="mt-2 text-gray-600 line-clamp-2 italic">"{applicant.cover_note}"</p>
                            )}
                        </div>

                    </div>

                    {/* Footer/Actions */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-100"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleUpdateStatus}
                            className="bg-gray-900 text-white hover:bg-black focus:ring-gray-500"
                        >
                            Confirm Update
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}