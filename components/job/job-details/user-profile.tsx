"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface UserProfileProps {
  user: any;
  application?: any;
}

export default function UserProfile({ user }: UserProfileProps) {
  if (!user) return null;

  return (
    <Card className="space-y-6 p-6">
      {/* --- Header Section --- */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={`${user.first_name} ${user.last_name}`}
            width={80}
            height={80}
            className="rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-full text-gray-600 font-semibold">
            {user.first_name?.charAt(0)}
            {user.last_name?.charAt(0)}
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {user.first_name} {user.last_name}
          </h2>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-xs text-gray-500 mt-1">
            Member since {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* --- Basic Info --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <InfoItem label="Gender" value={user.gender || "N/A"} />
        <InfoItem label="Hourly Rate (€)" value={user.rate || "N/A"} />
        <InfoItem label="Experience" value={`${user.experience || 0} years`} />
        <InfoItem label="City" value={user.city || "N/A"} />
        <InfoItem label="Postal Code" value={user.postal_code || "N/A"} />
        <InfoItem label="District" value={user.district || "N/A"} />
      </div>

      {/* --- Skills Section --- */}
      {user.skills?.length > 0 && (
        <div>
          <h3 className="font-medium mb-1 text-gray-800">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill: any) => (
              <Badge
                key={skill.id}
                className="bg-blue-100 text-blue-800 border border-blue-200"
              >
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* --- Certificates --- */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-800">Certificates</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <CertificateItem
            title="First Aid Certificate"
            certificate={user.first_aid}
          />
          <CertificateItem
            title="Police Certificate"
            certificate={user.police_certificate}
          />
        </div>
      </div>

      {/* --- Verification Status --- */}
      <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-100">
        <Badge
          className={`${
            user.is_email_verified
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          {user.is_email_verified ? "Email Verified" : "Email Not Verified"}
        </Badge>

        <Badge
          className={`${
            user.police_verified
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          {user.police_verified ? "Police Verified" : "Police Not Verified"}
        </Badge>
      </div>

      {/* --- Bio --- */}
      {user.bio && user.bio.trim() && (
        <div>
          <h3 className="font-medium mb-1 text-gray-800">Bio</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{user.bio}</p>
        </div>
      )}
    </Card>
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
