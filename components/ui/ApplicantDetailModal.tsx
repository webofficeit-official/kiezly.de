"use client";

import { Loader } from "@/components/ui/loader";
import { useApplicantDetails } from "@/lib/react-query/queries/apply-job";
import UserProfile from "../job/job-details/user-profile";
import { Button } from "./button";
import { useState } from "react";
import { ReviewSidePanel } from "../job/job-details/review-side-panel";

interface ApplicantDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
}

export default function ApplicantDetailModal({ isOpen, onClose, userId }: ApplicantDetailModalProps) {
    const { data: user, isLoading } = useApplicantDetails(userId);
    const [showReviews, setShowReviews] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* Centering trick */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Main Modal Panel */}
                <div
                    className={`inline-block align-bottom bg-white rounded-2xl text-left shadow-2xl transform transition-all duration-500 ease-in-out
                        ${showReviews ? "md:-translate-x-0" : "translate-x-0"} 
                        w-full sm:my-8 sm:align-middle sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl
                        ${showReviews ? "max-md:hidden" : "block"} 
                    `}
                >
                    <UserProfile 
                        user={user} 
                        onClose={onClose} 
                        onOpenReviews={() => setShowReviews(true)} 
                    />
                </div>

                {/* Review Side Panel / Mobile Overlay */}
                {showReviews && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center md:justify-end md:pointer-events-none">
                        {/* Mobile Background (White) or Desktop Transparent */}
                        <div className="w-full h-full md:h-auto md:w-[450px] md:mr-8 bg-white md:rounded-2xl shadow-2xl border-l border-zinc-100 pointer-events-auto animate-in slide-in-from-right-5">
                            <ReviewSidePanel onClose={() => setShowReviews(false)} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}