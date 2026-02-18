"use client";

import { Loader } from "@/components/ui/loader";
import { useApplicantDetails } from "@/lib/react-query/queries/apply-job";
import UserProfile from "../job/job-details/user-profile";
import { Button } from "./button";
import { useEffect, useMemo, useState } from "react";
import { ReviewSidePanel } from "../job/job-details/review-side-panel";
import { useGetUserReviews } from "@/lib/react-query/queries/review";

interface ApplicantDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
}

export type ReviewFilters = {
  page: number;
  page_size: number;
  sort_by?: string;
  sort_order?: string;
};

export default function ApplicantDetailModal({ isOpen, onClose, userId }: ApplicantDetailModalProps) {
    const { data: user, isLoading } = useApplicantDetails(userId);
    const [showReviews, setShowReviews] = useState(false);

    if (!isOpen) return null;

    const [userRatings, setUserRatings] = useState([])
    const [rating, setRating] = useState(0)
    const [totalRatings, setTotalRatings] = useState(0)
    const [totalPages, setTotalPages] = useState(1);

    const [filters, setFilters] = useState<ReviewFilters>({ page: 1, page_size: 5, sort_order: "DESC", sort_by: 'created_at' });

    const { data: ratings, isLoading: ratingsLoading } = useGetUserReviews(userId, filters, {
        enabled: !!userId,
    });

    useEffect(() => {
        if (!ratings?.data?.items) return;

        setUserRatings(ratings.data.items)
        setTotalRatings(ratings.data.total_items)
        setRating(ratings?.data.rating)
        setTotalPages(ratings?.data.total_pages);
        setFilters({
            ...filters,
            page: ratings?.data.page,
            page_size: ratings?.data.page_size
        })
    }, [ratings])

    return (
        <>
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader />
                </div>
            ) : user ? (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
                            className={`inline-block align-bottom bg-white rounded-2xl overflow-hidden text-left shadow-2xl transform transition-all duration-500 ease-in-out
                        ${showReviews ? "md:-translate-x-[0]" : "translate-x-0"} 
                        w-full sm:my-8 sm:align-middle sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl
                        ${showReviews ? "max-md:hidden" : "block"} 
                    `}
                        >
                            <UserProfile
                                user={user}
                                onClose={onClose}
                                onOpenReviews={() => setShowReviews(true)}
                                reviewsCount={totalRatings}
                                rating={rating}
                            />
                        </div>

                        {/* Review Side Panel / Mobile Overlay */}
                        {showReviews && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center md:justify-end md:pointer-events-none">
                                {/* Mobile Background (White) or Desktop Transparent */}
                                <div className="w-full h-full md:h-auto md:w-[450px] md:mr-8 md:mt-12 bg-white md:rounded-2xl shadow-2xl border-l border-zinc-100 pointer-events-auto animate-in slide-in-from-right-5">
                                    <ReviewSidePanel 
                                        onClose={() => setShowReviews(false)} 
                                        userId={user.id} 
                                        userRatings={userRatings} 
                                        filters={filters} 
                                        setFilters={setFilters}
                                        totalItems={ratings?.data?.total_items}
                                        totalPages={ratings?.data?.total_pages}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                ""
            )}
        </>
    );
}