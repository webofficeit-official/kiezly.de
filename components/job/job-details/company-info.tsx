import React, { useEffect, useState } from "react";
import { ExternalLink, Facebook, Globe, Instagram, Linkedin, MapPin, X } from "lucide-react";
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
            <div className="rounded-2xl bg-white border border-[#efefec] shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-[#efefec]">
                    <h3 className="font-display font-semibold text-[#111110] text-[15px]">{t("title")}</h3>
                </div>

                {/* Profile section */}
                <div className="px-5 py-4 flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden bg-[#efefec]">
                        {job.client.avatar_url ? (
                            <img
                                src={job.client?.avatar_url}
                                alt={job.client?.display_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const el = e.currentTarget;
                                    el.style.display = "none";
                                    el.parentElement!.classList.add("flex", "items-center", "justify-center", "font-bold", "text-lg", "text-[#111110]");
                                    el.parentElement!.textContent = job.client.company_name
                                        ? job.client.company_name?.charAt(0)
                                        : `${job.client.first_name?.charAt(0) ?? ""}${job.client.last_name?.charAt(0) ?? ""}`;
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-lg text-[#111110]">
                                {job.client.company_name
                                    ? job.client.company_name?.charAt(0)
                                    : `${job.client.first_name?.charAt(0)}${job.client.last_name?.charAt(0)}`}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-display font-bold text-[#111110] text-[15px] leading-snug">
                            {job.client.company_name
                                ? job.client.company_name
                                : `${job.client.first_name} ${job.client.last_name}`}
                        </h4>
                        {job.client.gender && (
                            <p className="text-[12px] mt-0.5" style={{ color: "rgba(17,17,16,.4)" }}>{job.client.gender}</p>
                        )}
                        {(job.client.city || job.client.state || job.client.country) && (
                            <p className="text-[12px] inline-flex items-center gap-1" style={{ color: "rgba(17,17,16,.4)" }}>
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                {[job.client.city, job.client.state, job.client.country].filter(Boolean).join(" · ")}
                            </p>
                        )}
                        {totalRatings > 0 && (
                            <div
                                className="group relative mt-2 inline-flex items-center gap-2 cursor-pointer rounded-lg py-1 transition-all"
                                onClick={() => setShowReviews(!showReviews)}
                                title={r("user.title")}
                            >
                                <StarRating rating={rating} size={4} />
                                <span className="text-[12px] font-bold text-[#111110]">{rating}</span>
                                <span className="text-[11px] underline underline-offset-2" style={{ color: "rgba(17,17,16,.4)" }}>
                                    {r("user.total", { count: totalRatings })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bio */}
                {job.client.bio && job.client.bio.trim() && (
                    <div className="px-5 pb-4">
                        <div
                            className="text-[13px] leading-relaxed"
                            style={{ color: "rgba(17,17,16,.6)" }}
                            dangerouslySetInnerHTML={{ __html: job.client?.bio || "" }}
                        />
                    </div>
                )}

                {/* Contact */}
                <div className="px-5 py-4 bg-[#f7f7f5] border-t border-[#efefec]">
                    <p className="text-[12px] font-semibold text-[#374151] mb-2 uppercase tracking-wide">{t("contact-method")}</p>
                    {(job.contact_method === "email_relay" || job.contact_method === "direct_email") && (
                        <a href={`mailto:${job.contact_email}`} className="text-[13px] font-medium text-kz-accent hover:underline break-all">{job.contact_email}</a>
                    )}
                    {job.contact_method === "phone" && (
                        <a href={`tel:${job.contact_phone}`} className="text-[13px] font-medium text-kz-accent hover:underline">{job.contact_phone}</a>
                    )}
                    {job.contact_method === "external_link" && (
                        <a href={job.contact_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] font-medium text-kz-accent hover:underline">
                            <ExternalLink className="h-3.5 w-3.5" />{t("click-here")}
                        </a>
                    )}
                </div>

                {/* Social links */}
                {job.client.social_links.length > 0 && (
                    <div className="px-5 py-4 border-t border-[#efefec]">
                        <p className="text-[12px] font-semibold text-[#374151] mb-3 uppercase tracking-wide">{t("socials")}</p>
                        <div className="flex items-center gap-2">
                            {job.client.social_links.find(s => s.platform === 'website') && (
                                <SocialIcons Icon={<Globe className="h-4 w-4" />} link={job.client.social_links.find(s => s.platform === 'website')?.url} />
                            )}
                            {job.client.social_links.find(s => s.platform === 'linkedin') && (
                                <SocialIcons Icon={<Linkedin className="h-4 w-4" />} link={job.client.social_links.find(s => s.platform === 'linkedin')?.url} />
                            )}
                            {job.client.social_links.find(s => s.platform === 'instagram') && (
                                <SocialIcons Icon={<Instagram className="h-4 w-4" />} link={job.client.social_links.find(s => s.platform === 'instagram')?.url} />
                            )}
                            {job.client.social_links.find(s => s.platform === 'x') && (
                                <SocialIcons Icon={<X className="h-4 w-4" />} link={job.client.social_links.find(s => s.platform === 'x')?.url} />
                            )}
                            {job.client.social_links.find(s => s.platform === 'facebook') && (
                                <SocialIcons Icon={<Facebook className="h-4 w-4" />} link={job.client.social_links.find(s => s.platform === 'facebook')?.url} />
                            )}
                        </div>
                    </div>
                )}

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
            </div>
        </>
    );
}


function SocialIcons({ link, Icon }: { link: string; Icon: any }) {
    return (
        <a href={link} target="_blank" rel="noreferrer" className="p-2 bg-[#f7f7f5] rounded-full border border-[#efefec] hover:bg-[#efefec] transition-all duration-200 text-[#374151]">
            {Icon}
        </a>
    );
}