"use client";
import { useJobCollections, useJobs } from "@/lib/react-query/queries/useJob";
import { Filters, JobList } from "@/lib/types/job";
import dayjs from "dayjs";
import { Bookmark, BookmarkCheck, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "../ui/button";
import {
  addJobAsFavorite,
  getSavedJobs,
  unsaveJobAsFavorite,
} from "@/lib/react-query/api-handler/job-save-api";
import JobSkeleton from "../shared-ui/skeleton/job-skeleton";
import {
  DEFAULT_FILTERS,
  fromQuery,
  toQuery,
} from "@/lib/utils/job-query-filters";
import { JobFilterSidebar } from "./job-filter/job-filter";
import FilterSidebarSkeleton from "../shared-ui/skeleton/filter-side-bar-skeleton";
import { JobResults } from "./job-list-card/job-list-card";
import { useDelayedLoading } from "@/lib/custom-hook/delayed-loading";
// ---- Types ----

function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
// Tiny helper to detect whether history.replaceState can be safely used
function useCanModifyHistory() {
  return useMemo(() => {
    if (typeof window === "undefined") return false;
    const href = window.location?.href || "";
    if (href.startsWith("about:")) return false;
    try {
      const url = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.history.replaceState(window.history.state, "", url);
      return true;
    } catch {
      return false;
    }
  }, []);
}

export default function JobFilterPage({
  onChange,
  persistToUrl = true, // allow caller to disable URL syncing
  jobs,
  pageSize = 10,
}: {
  onChange?: (f: Filters) => void;
  persistToUrl?: boolean;
  jobs?: JobList[];
  pageSize?: number;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window === "undefined") return DEFAULT_FILTERS;
    const initial = fromQuery(window.location.search);
    // If user has lat/lng in context, override them with defaults
    if (user && user?.lat && user?.lng) {
      return {
        ...initial,
        lat: user.lat,
        lng: user.lng,
        radius_km:
          user?.lat && user?.lng
            ? initial.radius_km || DEFAULT_FILTERS.radius_km
            : undefined,
      };
    }

    return initial;
  });
  const [page, setPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(pageSize);
  const [savedJobs, setSavedJobs] = useState([]);
  const [pendingCategorySlug, setPendingCategorySlug] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get("category");
      if (slug) {
        setPendingCategorySlug(slug);
      }
    }
  }, []);

  const canModifyHistory = useCanModifyHistory();
  // Debounce high-churn fields (search query)
  const debouncedFilters = useDebounced(filters, 300);
  const buildApiFilters = (
    filters: Filters,
    page: number,
    pageSize: number
  ) => {
    const payload: Record<string, any> = { page, page_size: pageSize };

    if (filters.q) payload.q = filters.q;
    if (filters.city) payload.city = filters.city;
    if (filters.category_id.length)
      payload.category_id = filters.category_id.join(",");
    if (filters.job_type.length) payload.job_type = filters.job_type.join(",");
    if (filters.job_experience.length)
      payload.job_experience = filters.job_experience.join(",");
    if (filters.job_tags.length) payload.job_tags = filters.job_tags.join(",");
    if (filters.min_price) payload.min_price = filters.min_price;
    if (filters.max_price) payload.max_price = filters.max_price;
    if (filters.posted && filters.posted !== "any")
      payload.posted = filters.posted;
    if (user?.lat && filters.radius_km) payload.radius_km = filters.radius_km;
    if (filters.sort && filters.sort !== "new") payload.sort = filters.sort;
    if (filters.starts_at) payload.starts_at = filters.starts_at;
    if (filters.ends_at) payload.ends_at = filters.ends_at;
    if (filters.lat) payload.lat = filters.lat;
    if (filters.lng) payload.lng = filters.lng;

    return payload;
  };

  const apiFilters = useMemo(
    () => buildApiFilters(debouncedFilters, page, localPageSize),
    [debouncedFilters, page, localPageSize]
  );

  const { data: collections, isLoading: isCollectionsLoading } =
    useJobCollections();

  //  apply pending category slug when collections load
  useEffect(() => {
    if (!collections?.jobCategories?.length || !pendingCategorySlug) return;

    const matched = collections.jobCategories.find(
      (c) => c.slug === pendingCategorySlug
    );

    if (matched) {
      setFilters((prev) => ({
        ...prev,
        category_id: [matched.id],
      }));
      setPendingCategorySlug(null); // clear it once applied
    }
  }, [collections, pendingCategorySlug]);

  const { data, isLoading, error, isFetching } = useJobs(apiFilters, {
    keepPreviousData: true,
  });
  const delayedFetching = useDelayedLoading(isFetching, 400);
  const dataSource = data?.data?.items ?? jobs ?? [];
  const total = data?.data?.total_items ?? 0;
  const totalPages = data?.data?.total_pages ?? 1;

  const isInitialLoad = !data && (isLoading || isCollectionsLoading);

  useEffect(() => {
    if (user?.lat && user?.lng) {
      setFilters((f) => ({
        ...f,
        lat: user.lat,
        lng: user.lng,
        radius_km: f.radius_km || DEFAULT_FILTERS.radius_km,
      }));
    }
  }, [user?.lat, user?.lng]);

  useEffect(() => {
    onChange?.(debouncedFilters);
  }, [debouncedFilters, onChange]);

  useEffect(() => {
    setPage(1);
  }, [debouncedFilters]);

  useEffect(() => {
    if (user) {
      getSavedJobs()
        .then((data) => {
          setSavedJobs(data.jobs);
        })
        .catch((err) => console.log(err));
    } else {
      const localStoredJobs = localStorage.getItem("saved-jobs");
      if (localStoredJobs) {
        setSavedJobs(JSON.parse(localStoredJobs));
      }
    }
  }, [user]);

  useEffect(() => {
    onChange?.(filters);
  }, [filters, onChange]);

  useEffect(() => {
    setPage(1);
  }, [
    filters.q,
    filters.category_id.join(","),
    filters.city,
    filters.job_type.join(","),
    filters.job_experience.join(","),
    filters.job_tags.join(","),
    filters.min_price,
    filters.max_price,
    filters.posted,
    filters.radius_km,
    filters.sort,
  ]);

  // Sync filters -> URL (shallow, no reload)

  useEffect(() => {
    if (!persistToUrl || !canModifyHistory) return;
    try {
      const qs = toQuery(
        {
          ...filters,
          radius_km: user?.lat && user?.lng ? filters.radius_km : undefined,
        },
        collections
      );
      const url = `${window.location.pathname}${qs ? "?" + qs : ""}`;
      window.history.replaceState(window.history.state, "", url);
    } catch {}
  }, [filters, persistToUrl, canModifyHistory, collections]);

  const update = (patch: Partial<Filters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  function toggleInArray<T extends string | number>(
    key: keyof Filters,
    val: T
  ) {
    setFilters((f) => {
      const arr = new Set(f[key] as unknown as T[]);
      arr.has(val) ? arr.delete(val) : arr.add(val);
      return { ...f, [key]: Array.from(arr) } as Filters;
    });
  }

  const resetAll = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    setLocalPageSize(pageSize);
  };

  const pageSlice = dataSource;
  const activeCount = useMemo(() => {
    const {
      q,
      city,
      category_id,
      job_type,
      job_experience,
      job_tags,
      min_price,
      max_price,
      posted,
      radius_km,
      sort,
    } = filters;
    let c = 0;
    if (q) c++;
    if (city) c++;
    if (category_id.length) c++;
    if (job_type.length) c++;
    if (job_experience.length) c++;
    if (job_tags.length) c++;
    if (min_price || max_price) c++;
    if (posted !== "any") c++;
    if (radius_km !== DEFAULT_FILTERS.radius_km) c++;
    if (sort !== "new") c++;
    return c;
  }, [filters]);

  const handleSaveJob = async (jobId: string) => {
    try {
      setSavedJobs((prev) => [...prev, { id: jobId } as JobList]);
      if (user) {
        await addJobAsFavorite({ jobId });
      } else {
        const localStoredJobs = localStorage.getItem("saved-jobs");
        let savedJobsLocal = [];
        if (localStoredJobs) {
          savedJobsLocal = JSON.parse(localStoredJobs);
        }
        localStorage.setItem(
          "saved-jobs",
          JSON.stringify([...savedJobsLocal, { id: jobId }])
        );
      }
    } catch (error) {
      console.error("Failed to save job:", error);
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
    }
  };

  const handleUnSaveJob = async (jobId: string) => {
    try {
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
      if (user) {
        await unsaveJobAsFavorite(jobId);
      } else {
        const localStoredJobs = localStorage.getItem("saved-jobs");
        let savedJobsLocal = [];
        if (localStoredJobs) {
          savedJobsLocal = JSON.parse(localStoredJobs);
        }
        localStorage.setItem(
          "saved-jobs",
          JSON.stringify(savedJobsLocal.filter((j) => j.id !== jobId))
        );
      }
    } catch (error) {
      console.error("Failed to save job:", error);
      setSavedJobs((prev) => [...prev, { id: jobId } as JobList]);
    }
  };

  if (pendingCategorySlug && collections?.jobCategories?.length) {
    return <JobSkeleton count={4} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {" "}
      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Filters */}
        <section className="lg:col-span-1">
          {isCollectionsLoading && !collections ? (
            <FilterSidebarSkeleton />
          ) : (
            <JobFilterSidebar
              filters={filters}
              update={update}
              toggleInArray={toggleInArray}
              resetAll={resetAll}
              activeCount={activeCount}
              collections={collections}
              user={user}
              onChange={onChange}
            />
          )}
        </section>

        {/* Right: Job list + debug preview */}
        <section
          className={`lg:col-span-2 space-y-4  ${
            delayedFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          {delayedFetching && !isInitialLoad && <JobSkeleton count={4} />}

          {isInitialLoad ? (
            <JobSkeleton count={5} />
          ) : (
            <JobResults
              jobs={pageSlice}
              total={total}
              totalPages={totalPages}
              page={page}
              setPage={setPage}
              pageSize={localPageSize}
              setPageSize={setLocalPageSize}
              savedJobs={savedJobs}
              handleSaveJob={handleSaveJob}
              handleUnSaveJob={handleUnSaveJob}
            />
          )}
        </section>
      </main>
      {/* Sticky mobile apply */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3">
        <div className="bg-white border shadow-xl rounded-2xl p-3 flex items-center justify-between">
          <div className="text-sm">
            <div className="font-medium">{activeCount} active filters</div>
            <div className="text-gray-600">Tap Apply to update results</div>
          </div>
          <button
            type="button"
            onClick={() => onChange?.(filters)}
            className="inline-flex items-center justify-center rounded-xl bg-black text-white px-4 py-2 text-sm"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
