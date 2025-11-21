"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Briefcase, BriefcaseMedical, CalendarClock, CalendarMinus2, CircleSlash, Euro, Eye, Facebook, Globe, GraduationCap, Hourglass, IceCream, Instagram, Linkedin, Scale, View, X } from "lucide-react";
import { useT } from "@/app/[locale]/layout";

interface UserProfileProps {
  user: any;
  application?: any;
  onClose?: any;
}

export default function UserProfile({ user, onClose }: UserProfileProps) {
  if (!user) return null;
  const t = useT("application")

  return (
    <>
      <Card className="space-y-6">
        <div className="grid grid-cols-12">
          <div className="col-span-5 bg-gray-100 p-6">
            {user.avatar_url ? (
              <>
                <img src={user?.avatar_url || "https://placehold.co/96x96"} alt={user?.display_name} className="h-100 w-full rounded-lg object-cover" />
              </>
            ) : (
              <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-full text-gray-600 font-semibold">
                {user.first_name?.charAt(0)}
                {user.last_name?.charAt(0)}
              </div>
            )}
            <div className="mt-10">
              {user.rate ? (
                <LeftType label={t("user.salary-expectation.label")} value={t("user.salary-expectation.value", { rate: user.rate})} Icon={<Euro />} />
              ) : ""}
              {user.experience ? (
                <LeftType label={t("user.work-experience.label")} value={t("user.work-experience.value", { years: user.experience})} Icon={<Briefcase />} />
              ) : ""}
              {user.min_hours ? (
                <LeftType label={t("user.min-hours.label")} value={t("user.min-hours.value", { hours: user.min_hours })} Icon={<Hourglass />} />
              ) : ""}
              {user.gender ? (
                <LeftType label={t("user.gender.label")} value={`${user.gender}`} Icon={<CircleSlash />} />
              ) : ""}
              {user.weekdays.length > 0 ? (
                <LeftType label={t("user.available days.label")} value={`${user.weekdays.join(', ')}`} Icon={<CalendarClock />} />
              ) : ""}
              {user.time_windows.length > 0 ? (
                <LeftType label={t("user.time-windows.label")} value={`${user.time_windows.join(', ')}`} Icon={<CalendarMinus2 />} />
              ) : ""}
            </div>
            <div className="mt-10">
              <p className="font-medium text-lg">{t("user.contacts")}</p>
              <p className="mt-3 font-semibold text-sm text-blue-700"><a href={`mailto:${user.email}`}>{user.email}</a></p>
              <p className="mt-3 font-semibold text-sm text-blue-700"><a href={`tel:${user.phone}`}>{user.phone}</a></p>
            </div>
            {user.social_links.length > 0 ? (
              <div className="mt-10">
                <p className="font-medium text-lg mb-3">{t("user.socials")}</p>
                <div className="flex items-center gap-1">
                  {user.social_links.find(s => s.platform === 'website') ? (
                    <SocialIcons Icon={<Globe className="h-4 w-4 text-gray-600 hover:text-black" />} link={user.social_links.find(s => s.platform === 'website')?.url} />
                  ) : ""}
                  {user.social_links.find(s => s.platform === 'linkedin') ? (
                    <SocialIcons Icon={<Linkedin className="h-4 w-4 text-blue-600 hover:text-blue-700" />} link={user.social_links.find(s => s.platform === 'linkedin')?.url} />
                  ) : ""}
                  {user.social_links.find(s => s.platform === 'instagram') ? (
                    <SocialIcons Icon={<Instagram className="h-4 w-4 text-pink-500 hover:text-pink-600" />} link={user.social_links.find(s => s.platform === 'instagram')?.url} />
                  ) : ""}
                  {user.social_links.find(s => s.platform === 'x') ? (
                    <SocialIcons Icon={<X className="h-4 w-4 text-gray-800 hover:text-black" />} link={user.social_links.find(s => s.platform === 'x')?.url} />
                  ) : ""}
                  {user.social_links.find(s => s.platform === 'facebook') ? (
                    <SocialIcons Icon={<Facebook className="h-4 w-4 text-blue-500 hover:text-blue-600" />} link={user.social_links.find(s => s.platform === 'facebook')?.url} />
                  ) : ""}
                </div>
              </div>
            ) : ""}
          </div>
          <div className="col-span-7 p-6">
            {/* --- Header --- */}
            <div className="flex justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h2>
              <X className="h-6 w-6 text-black-300 border border-gray-200 cursor-pointer rounded-lg" onClick={onClose} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {user.street} . {user.postal_code}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {user.city} . {user.state} . {user.country}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t("user.since")} {new Date(user.created_at).toLocaleDateString()}
            </p>

            {/* --- Bio --- */}
            {user.bio && user.bio.trim() && (
              <div className="mt-4">
                <div className="text-sm text-gray-500 leading-relaxed" dangerouslySetInnerHTML={{  __html: user.bio }} />
              </div>
            )}
            <hr className="mt-4" />

            {/* --- Education --- */}
            {user.education?.length > 0 && (
              <>
                <div className="mt-5">
                  <p className="font-medium text-gray-500 text-sm mb-3">{t("user.education")}</p>
                  <div className="mt-4">
                    {user.education.map((e: any, index: number) => (
                      <EducationType key={index} label={e.institution} value={e.field} year={e.year} Icon={<GraduationCap />} />
                    ))}
                  </div>
                </div>
                <hr className="mt-4" />
              </>
            )}

            {/* --- Skills Section --- */}
            {user.skills?.length > 0 && (
              <>
                <div className="mt-5">
                  <p className="font-medium text-gray-500 text-sm mb-3">{t("user.skills")}</p>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill: any) => (
                      <span
                        key={skill.name}
                        className="border rounded-2xl py-1 px-2 text-xs text-gray-800 border-gray-400"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
                <hr className="mt-4" />
              </>
            )}

            {/* --- Documents --- */}
            <div className="mt-5">
              <div className="mt-3">
                {user.has_first_aid ? (
                  <>
                    <p className="font-medium text-gray-500 text-sm mb-2">{t("user.first-aid")}</p>
                    <CertificateType value={`${user.first_aid.provider} - ${user.first_aid.certificateId}`} label={`${user.first_aid.completionDate} - ${user.first_aid.expiryDate}`} Icon={<BriefcaseMedical />} fileUrl={user.first_aid.fileUrl} />
                  </>
                ) : ''}
                {user.police_verified ? (
                  <>
                    <p className="font-medium text-gray-500 text-sm mb-2 mt-3">{t("user.police-certificate")}</p>
                    <CertificateType value={`${user.police_certificate.level}`} label={`${user.police_certificate.issueDate} - ${user.police_certificate.expiryDate}`} Icon={<Scale />} fileUrl={user.first_aid.fileUrl} />
                  </>
                ) : ''}
              </div>
            </div>

          </div>
        </div>
      </Card>
    </>
  );
}

/* --- Helper Subcomponents --- */
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-medium text-gray-700">{label}</p>
      <p className="text-gray-600">{value}</p>
    </div>
  );
}

function LeftType({ label, value, Icon }: { label: string; value: string; Icon: any }) {
  return (
    <div className="flex items-center gap-3 mt-4">
      <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gray-100">
        {Icon}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-bold text-gray-900 text-sm">{value}</span>
        <span className="text-xs text-gray-600">{label}</span>
      </div>
    </div>
  );
}

function EducationType({
  label,
  value,
  year,
  Icon,
}: {
  label: string;
  value: string;
  year: number;
  Icon: any;
}) {
  return (
    <div className="flex items-start justify-between gap-6 mt-4">
      {/* Left side: icon + text */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gray-100">
          {Icon}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-gray-900 text-sm">{value}</span>
          <span className="text-xs text-gray-600">{label}</span>
        </div>
      </div>

      {/* Right side: year at top */}
      <div className="text-sm text-black-500 font-semibold">{year}</div>
    </div>
  );
}

function CertificateType({
  label,
  value,
  Icon,
  fileUrl
}: {
  label: string;
  value: string;
  Icon: any;
  fileUrl: string
}) {
  return (
    <div className="flex items-start justify-between gap-6 mt-4">
      {/* Left side: icon + text */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gray-100">
          {Icon}
        </div>
        <a href={fileUrl} target="__blank">
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-gray-900 text-sm">{value}</span>
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        </a>
      </div>
    </div>
  );
}

function SocialIcons({ link, Icon }: { link: string; Icon: any }) {
  return (
    <a href={link} target="__blank" className="p-2 bg-background rounded-full border border-gray-200 hover:bg-gray-100 transition-all duration-200">
      {Icon}
    </a>
  );
}

function CertificateItem({ title, certificate }: { title: string; certificate: any }) {
  const hasFile = certificate?.fileUrl;

  return (
    <div className="border border-gray-100 rounded-lg p-2">
      <p className="font-medium text-gray-800">{title}</p>
      {hasFile ? (
        <a
          href={certificate.fileUrl}
          target="_blank"
          className="text-blue-600 text-sm hover:underline"
        >
          View Certificate
        </a>
      ) : (
        <p className="text-sm text-gray-500">Not uploaded</p>
      )}
      {certificate?.expiryDate && (
        <p className="text-xs text-gray-500 mt-1">
          Expires: {new Date(certificate.expiryDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
