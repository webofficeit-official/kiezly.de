import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Facebook, Globe, Instagram, Linkedin, X } from "lucide-react";
import { useT } from "@/app/[locale]/layout";
import { ReviewFilters } from "@/components/ui/ApplicantDetailModal";
import { useGetUserReviews } from "@/lib/react-query/queries/review";
import { StarRating } from "./star-rating";
import { ReviewSidePanel } from "./review-side-panel";

export default function CompanyInfoCard({ job, role = "helper" }: { job: any, role: string }) {
    const t = useT("company");
    const r = useT("reviews")

    const [showReviews, setShowReviews] = useState(false);
    const [userRatings, setUserRatings] = useState([])
    const [rating, setRating] = useState(0)
    const [totalRatings, setTotalRatings] = useState(0)
    const [totalPages, setTotalPages] = useState(1);
    const userId = job.client?.id

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
            <Card className="shadow-sm">
                <div className="grid grid-cols-12">
                    <div className={`col-span-${role == "client" ? "12" : "5"} bg-gray-100 p-6`}>
                        <h2 className="text-lg font-semibold mb-4">
                            {t("title")}
                        </h2>
                        {job.client.avatar_url ? (
                            <>
                                <img src={job.client?.avatar_url || "https://placehold.co/96x96"} alt={job.client?.display_name} className="rounded-lg object-cover" />
                            </>
                        ) : (
                            <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-full text-gray-600 font-semibold">
                                {
                                    job.client.company_name ? job.client.company_name?.charAt(0) : (
                                        `${job.client.first_name?.charAt(0)}${job.client.last_name?.charAt(0)}`
                                    )
                                }
                            </div>
                        )}
                        <div className="mt-4">
                            <p className="font-medium text-lg">{t("contact-method")}</p>
                            {(job.contact_method == "email_relay" || job.contact_method == "direct_email") && <p className="mt-3 font-semibold text-sm text-blue-700"><a href={`mailto:${job.contact_email}`}>{job.contact_email}</a></p>}
                            {(job.contact_method == "phone") && <p className="mt-3 font-semibold text-sm text-blue-700"><a href={`tel:${job.contact_phone}`}>{job.contact_phone}</a></p>}
                            {(job.contact_method == "external_link") && <p className="mt-3 font-semibold text-sm text-blue-700"><a href={job.contact_link} target="__blank">{t("click-here")}</a></p>}
                        </div>
                        {
                            totalRatings > 0 && <>
                                {/* Interactive Rating Section */}
                                <div
                                    className="group relative flex items-center gap-3 cursor-pointer rounded-lg -ml-2 p-2 transition-all hover:bg-zinc-100 active:scale-95"
                                    onClick={() => setShowReviews(!showReviews)}
                                    title={r("user.title")}
                                >
                                    <div className="flex items-center gap-1">
                                        <StarRating rating={rating} size={4} />
                                    </div>

                                    <div className="flex items-center gap-2 border-l border-zinc-300 pl-3">
                                        <span className="text-sm font-bold text-zinc-900">{rating}</span>
                                        <span className="text-xs font-medium text-zinc-500 underline underline-offset-4 decoration-zinc-300 group-hover:text-black group-hover:decoration-black">
                                            {r("user.total", { count: totalRatings })}
                                        </span>
                                    </div>

                                    {/* Modern Tooltip - Appears on Hover */}
                                    <div className="absolute -bottom-8 left-0 scale-0 rounded bg-zinc-900 px-2 py-1 text-[10px] font-medium text-white transition-all group-hover:scale-100 z-10 whitespace-nowrap">
                                        {r("user.label")}
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                    <div className={`col-span-${role == "client" ? "12" : "7"} p-6`}>
                        {/* --- Header --- */}
                        <div className="flex justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                {
                                    job.client.company_name ? job.client.company_name : (
                                        `${job.client.first_name} ${job.client.last_name}`
                                    )
                                }
                            </h2>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {job.client.gender}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {job.client.city} . {job.client.state} . {job.client.country}
                        </p>

                        {/* --- Bio --- */}
                        {job.client.bio && job.client.bio.trim() && (
                            <div className="mt-4">
                                <div
                                    className="text-gray-700 text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: job.client?.bio || "" }}
                                />
                            </div>
                        )}
                        <hr className="mt-4" />
                        {job.client.social_links.length > 0 ? (
                            <div className="mt-4">
                                <p className="font-medium text-lg mb-3">{t("socials")}</p>
                                <div className="flex items-center gap-1">
                                    {job.client.social_links.find(s => s.platform === 'website') ? (
                                        <SocialIcons Icon={<Globe className="h-4 w-4 text-gray-600 hover:text-black" />} link={job.client.social_links.find(s => s.platform === 'website')?.url} />
                                    ) : ""}
                                    {job.client.social_links.find(s => s.platform === 'linkedin') ? (
                                        <SocialIcons Icon={<Linkedin className="h-4 w-4 text-blue-600 hover:text-blue-700" />} link={job.client.social_links.find(s => s.platform === 'linkedin')?.url} />
                                    ) : ""}
                                    {job.client.social_links.find(s => s.platform === 'instagram') ? (
                                        <SocialIcons Icon={<Instagram className="h-4 w-4 text-pink-500 hover:text-pink-600" />} link={job.client.social_links.find(s => s.platform === 'instagram')?.url} />
                                    ) : ""}
                                    {job.client.social_links.find(s => s.platform === 'x') ? (
                                        <SocialIcons Icon={<X className="h-4 w-4 text-gray-800 hover:text-black" />} link={job.client.social_links.find(s => s.platform === 'x')?.url} />
                                    ) : ""}
                                    {job.client.social_links.find(s => s.platform === 'facebook') ? (
                                        <SocialIcons Icon={<Facebook className="h-4 w-4 text-blue-500 hover:text-blue-600" />} link={job.client.social_links.find(s => s.platform === 'facebook')?.url} />
                                    ) : ""}
                                </div>
                            </div>
                        ) : ""}

                    </div>
                </div>

                {showReviews && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            {/* Backdrop overlay */}
                            <div
                                className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                                aria-hidden="true"
                                onClick={() => setShowReviews(!showReviews)}
                            ></div>

                            {/* This element is to trick the browser into centering the modal contents. */}
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            {/* 2. Modal Panel (The actual content box) */}
                            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl sm:w-full">
                                <div className="space-y-2">
                                    <ReviewSidePanel
                                        onClose={() => setShowReviews(false)}
                                        userId={userId}
                                        userRatings={userRatings}
                                        filters={filters}
                                        setFilters={setFilters}
                                        totalItems={ratings?.data?.total_items}
                                        totalPages={ratings?.data?.total_pages}
                                        role="helper"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Card>
        </>
    );
}


function SocialIcons({ link, Icon }: { link: string; Icon: any }) {
    return (
        <a href={link} target="__blank" className="p-2 bg-background rounded-full border border-gray-200 hover:bg-gray-100 transition-all duration-200">
            {Icon}
        </a>
    );
}