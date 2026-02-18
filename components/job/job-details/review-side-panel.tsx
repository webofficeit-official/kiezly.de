import { Badge } from "@/components/ui/badge";
import { MoveLeft, X } from "lucide-react";
import { StarRating } from "./star-rating";
import { useGetUserReviews } from "@/lib/react-query/queries/review";
import { useEffect, useState } from "react";
import { Review } from "@/lib/types/review";

export function ReviewSidePanel({ onClose, userId, userRatings }: { onClose: () => void, userId: string, userRatings: Review[] }) {

    return (
        <>
            {/* Desktop Right Panel */}
            <div className="hidden md:block w-full h-full p-6 overflow-y-auto">

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-zinc-900">Reviews</h2>

                        <Badge
                            variant="outline"
                            className="rounded-full px-3 py-1 text-zinc-500 border-zinc-200"
                        >
                            {userRatings.length} Total
                        </Badge>
                    </div>

                    <div className="flex gap-2">
                        <MoveLeft className="h-6 w-6 text-black-300 border border-gray-200 cursor-pointer rounded-lg pl-1 pr-1" onClick={onClose} />
                    </div>
                </div>

                <div className="h-[520px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex flex-col gap-6">
                        {userRatings?.map((ur, i) => (
                            <div key={i} className="group flex gap-4 border-b border-zinc-100 pb-6 last:border-0">
                                {/* Avatar - Smaller and cleaner */}
                                <div className="relative h-12 w-12 flex-shrink-0">
                                    <img
                                        src={ur.reviewer.avatar_url}
                                        alt={ur.reviewer.org_name}
                                        className="h-12 w-12 rounded-full object-contain transition group-hover:grayscale border"
                                    />
                                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm">
                                        <span className="text-[10px] font-bold text-black">{ur.rating}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-1 flex-col gap-1">
                                    <div className="flex  justify-between">
                                        <div className="text-left">
                                            <h3 className="text-sm font-bold text-zinc-900">{ur.reviewer.org_name}</h3>
                                            <h3 className="text-xs font-medium text-zinc-900">{ur.job.title}</h3>
                                        </div>
                                        <StarRating rating={ur.rating} size={3} />
                                    </div>

                                    <div className="relative">
                                        <p className="text-sm leading-relaxed text-zinc-600 italic">
                                            "{ur.comment}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Overlay */}
            <div className="md:hidden fixed inset-0 bg-white z-[60] p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-zinc-900">Reviews</h2>

                        <Badge
                            variant="outline"
                            className="rounded-full px-3 py-1 text-zinc-500 border-zinc-200"
                        >
                            {userRatings.length} Total
                        </Badge>
                    </div>

                    <div className="flex gap-2">
                        <X className="h-6 w-6 text-black-300 border border-gray-200 cursor-pointer rounded-lg" onClick={onClose} />
                    </div>
                </div>

                <div className="h-[520px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex flex-col gap-6">
                        {userRatings?.map((ur, i) => (
                            <div key={i} className="group flex gap-4 border-b border-zinc-100 pb-6 last:border-0">
                                {/* Avatar - Smaller and cleaner */}
                                <div className="relative h-12 w-12 flex-shrink-0">
                                    <img
                                        src={ur.reviewer.avatar_url}
                                        alt={ur.reviewer.org_name}
                                        className="h-12 w-12 rounded-full object-cover grayscale transition group-hover:grayscale-0"
                                    />
                                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm">
                                        <span className="text-[10px] font-bold text-black">{ur.rating}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-1 flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-zinc-900">{ur.reviewer.org_name}</h3>
                                        <StarRating rating={ur.rating} size={3} />
                                    </div>

                                    <div className="relative">
                                        <p className="text-sm leading-relaxed text-zinc-600 italic">
                                            "{ur.comment}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
