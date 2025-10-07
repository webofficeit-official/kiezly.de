"use client";

import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Clock } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

/**
 * Narrow type for applied jobs.
 * Only includes fields we need for display.
 */
type AppliedJob = {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  currency: string;
  price_type: string;
  price_value: number;
  city: string;
  country: string;
  category_name: string;
  created_at: string;
  starts_at?: string;
  ends_at?: string;
  tags?: { id: number; name: string }[];
  description: string;
};

/** 
 * Dummy applied jobs data
 * (replace with API call in production)
 */
const dummyAppliedJobs: AppliedJob[] = [
  {
    id: "1",
    title: "Frontend Developer",
    subtitle: "React + Next.js",
    slug: "frontend-developer",
    currency: "€",
    price_type: "hour",
    price_value: 30,
    city: "Berlin",
    country: "Germany",
    category_name: "IT & Software",
    created_at: dayjs().subtract(2, "day").toISOString(),
    starts_at: dayjs().add(3, "day").toISOString(),
    ends_at: dayjs().add(30, "day").toISOString(),
    tags: [
      { id: 1, name: "Remote" },
      { id: 2, name: "Contract" },
    ],
    description: "We are seeking a skilled React/Next.js frontend developer for a long-term contract.",
  },
  {
    id: "2",
    title: "UX Designer",
    subtitle: "Mobile & Web Apps",
    slug: "ux-designer",
    currency: "$",
    price_type: "month",
    price_value: 4000,
    city: "New York",
    country: "USA",
    category_name: "Design",
    created_at: dayjs().subtract(5, "hour").toISOString(),
    starts_at: dayjs().add(7, "day").toISOString(),
    ends_at: dayjs().add(60, "day").toISOString(),
    tags: [
      { id: 3, name: "Full-time" },
      { id: 4, name: "Hybrid" },
    ],
    description: "Looking for a UX designer with experience in mobile and responsive web platforms.",
  },
  {
    id: "3",
    title: "Backend Engineer",
    subtitle: "Node.js + AWS",
    slug: "backend-engineer",
    currency: "€",
    price_type: "hour",
    price_value: 35,
    city: "Amsterdam",
    country: "Netherlands",
    category_name: "Software Engineering",
    created_at: dayjs().subtract(4, "day").toISOString(),
    starts_at: dayjs().add(14, "day").toISOString(),
    ends_at: dayjs().add(90, "day").toISOString(),
    tags: [{ id: 5, name: "Remote-Friendly" }],
    description: "Join our backend team to build APIs and integrate AWS services.",
  },
];

/**
 * Helper to check if a job was created recently (within 72h)
 */
const isNew = (createdAt: string) => {
  const hours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  return hours <= 72;
};

export default function AppliedJobList() {
  const router = useRouter();
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);

  // Load dummy data (or localStorage if needed)
  useEffect(() => {
    // Example: try to load from localStorage first
    const stored = localStorage.getItem("applied-jobs");
    if (stored) {
      setAppliedJobs(JSON.parse(stored));
    } else {
      // Use dummy data for demo
      setAppliedJobs(dummyAppliedJobs);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Applied Jobs ({appliedJobs.length})
          </h2>
        </div>

        {/* Job cards */}
        <div className="grid grid-cols-1 gap-4">
          {appliedJobs.length > 0 ? (
            appliedJobs.map((job) => (
              <article
                key={job.id}
                className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold truncate">
                    {job.title}
                  </h3>
                  {job.subtitle && (
                    <p className="text-sm text-gray-500">{job.subtitle}</p>
                  )}

                  <div className="mt-1 text-sm text-gray-700 flex flex-wrap gap-x-3 gap-y-1">
                    <span>
                      {job.price_value
                        ? `${job.currency}${job.price_value}/${job.price_type}`
                        : "Not specified"}
                    </span>
                    {job.city && (
                      <span>• {job.city}, {job.country}</span>
                    )}
                    {job.category_name && <span>• {job.category_name}</span>}
                    {job.starts_at && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Start: {dayjs(job.starts_at).format("MMM D, YYYY")}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {job.tags?.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 bg-gray-100 rounded-full"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>

                  <div
                    className="mt-2 text-sm text-gray-600 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </div>

                {/* Right side */}
                <div className="flex flex-col justify-between items-end min-h-[80px]">
                  <div className="text-xs text-gray-500">
                    {isNew(job.created_at)
                      ? (
                        <span className="px-2 py-1 rounded-xl bg-green-100 text-green-700">
                          New
                        </span>
                      )
                      : "Applied on " +
                        dayjs(job.created_at).format("MMM D, YYYY")}
                  </div>
                  <Button
                    variant="outline"
                    className="mt-2 rounded-xl px-3 py-2 text-sm"
                    onClick={() => router.push(`/jobs/${job.slug}`)}
                  >
                    View Details
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <div className="bg-white rounded-2xl border p-6 text-center text-sm text-gray-600">
              You haven’t applied to any jobs yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
