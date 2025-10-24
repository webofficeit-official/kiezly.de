// components/modals/UpdateStatusModal.jsx (Example structure)
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useUpdateApplicantStatus } from '@/lib/react-query/queries/apply-job';
import toast from 'react-hot-toast';
import { Select } from '../job/job-filter-select/select-option';
import { useT } from '@/app/[locale]/layout';
// Assuming you have a Select component for the status change

export default function UpdateStatusModal({ isOpen, onClose, applicant }) {
    if (!isOpen || !applicant) return null;

    const t = useT("application");

    // Placeholder for internal state (selected status)
    const [newStatus, setNewStatus] = useState(applicant.status);
    const updateStatus = useUpdateApplicantStatus();

    const handleUpdateStatus = () => {
        updateStatus.mutate({
            applicationId: applicant.id,
            status: newStatus
        }, {
            onSuccess: () => toast.success(t("applicants.update-model.update.success")),
            onError: (err: any) => toast.error(err?.message || t("applicants.update-model.update.failed")),
        })
    }

    const statusOptions = [
        { label: t("applicants.update-model.status.options.shortlisted"), value: "shortlisted" },
        { label: t("applicants.update-model.status.options.accepted"), value: "accepted" },
        { label: t("applicants.update-model.status.options.rejected"), value: "rejected" },
    ];

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
                            {t("applicants.update-model.title", { name: `${applicant.user.first_name} ${applicant.user.last_name}` })}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {t("applicants.update-model.current-status")} <span className="font-semibold text-gray-800 capitalize">{applicant.status}</span>
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
                                label={t("applicants.update-model.status.label")}
                            />
                        </div>

                        {/* Applicant Details Snippet */}
                        <div className="text-sm text-gray-700 mt-4">
                            <p><span className="font-semibold text-gray-800">{t("applicants.update-model.rate")}</span> {applicant.proposed_rate} €</p>
                            {applicant.cover_note && (
                                <div
                                    className="mt-2 text-gray-600 line-clamp-2 italic"
                                    dangerouslySetInnerHTML={{ __html: applicant.cover_note || "" }}
                                />
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
                            {t("applicants.update-model.button.cancel")}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleUpdateStatus}
                            className="bg-gray-900 text-white hover:bg-black focus:ring-gray-500"
                        >
                            {t("applicants.update-model.button.update")}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}