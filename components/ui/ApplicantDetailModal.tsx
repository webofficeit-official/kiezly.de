"use client";

import { Loader } from "@/components/ui/loader";
import { useApplicantDetails } from "@/lib/react-query/queries/apply-job";
import UserProfile from "../job/job-details/user-profile";
import { Button } from "./button";

interface ApplicantDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
}

export default function ApplicantDetailModal({ isOpen, onClose, userId }: ApplicantDetailModalProps) {
    const { data: user, isLoading } = useApplicantDetails(userId);

    return (
        <>
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader />
                </div>
            ) : user ? (
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
                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl sm:w-full">
                            <div className="space-y-2">
                                <UserProfile user={user} onClose={onClose} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500 py-8">User not found.</p>
            )}
        </>
    );
}
