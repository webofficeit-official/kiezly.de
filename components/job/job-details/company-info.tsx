import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Facebook, Globe, Instagram, Linkedin, X } from "lucide-react";

export default function CompanyInfoCard({ job, role = "helper" }: { job: any, role: string }) {
    return (
        <>
            <Card className="shadow-sm">
                <div className="grid grid-cols-12">
                    <div className={`col-span-${role == "client" ? "12" : "5"} bg-gray-100 p-6`}>
                        <h2 className="text-lg font-semibold mb-4">
                            About the company
                        </h2>
                        {job.client.avatar_url ? (
                            <>
                                <img src={job.client?.avatar_url || "https://placehold.co/96x96"} alt={job.client?.display_name} className="h-100 w-full rounded-lg object-cover" />
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
                            <p className="font-medium text-lg">Contact Method</p>
                            {(job.contact_method == "email_relay" || job.contact_method == "direct_email") && <p className="mt-3 font-semibold text-sm text-blue-700"><a href={`mailto:${job.contact_email}`}>{job.contact_email}</a></p>}
                            {(job.contact_method == "phone") && <p className="mt-3 font-semibold text-sm text-blue-700"><a href={`tel:${job.contact_phone}`}>{job.contact_phone}</a></p>}
                            {(job.contact_method == "external_link") && <p className="mt-3 font-semibold text-sm text-blue-700"><a href={job.contact_link} target="__blank">{job.contact_link}</a></p>}
                        </div>
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
                                <p className="font-medium text-lg mb-3">Socials</p>
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