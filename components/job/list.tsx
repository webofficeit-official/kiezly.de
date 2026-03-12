"use client";
import { useJobCollections, useJobs } from "@/lib/react-query/queries/useJob";
import { Filters, JobList } from "@/lib/types/job";
import dayjs from "dayjs";
import { SlidersHorizontal, CheckCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { useT } from "@/app/[locale]/layout";
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
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(pageSize);
  const [savedJobs, setSavedJobs] = useState([]);
  const [pendingCategorySlug, setPendingCategorySlug] = useState<string | null>(
    null,
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<Filters>(filters);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (isFilterOpen) setDraftFilters(filters);
  }, [isFilterOpen, filters]);

  useEffect(() => {
    if (!searchParams) return;

    const q = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const category = searchParams.get("category");

    const parsed = fromQuery(`?${searchParams.toString()}`);

    setFilters((prev) => ({
      ...prev,
      ...parsed,
      q,
      city,
      category_id: category ? prev.category_id : prev.category_id,
    }));
  }, [searchParams]);

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
    pageSize: number,
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
    [debouncedFilters, page, localPageSize],
  );

  const { data: collections, isLoading: isCollectionsLoading } =
    useJobCollections();

  //  apply pending category slug when collections load
  useEffect(() => {
    if (!collections?.jobCategories?.length || !pendingCategorySlug) return;

    const matched = collections.jobCategories.find(
      (c) => c.slug === pendingCategorySlug,
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
      setFilters((f) => {
        // If radius already explicitly set (including >0), keep it.
        if (typeof f.radius_km !== "undefined") return f;
        return { ...f, radius_km: 0 }; // radius 0 = no geo filter
      });
    } else {
      // if no user, make sure radius isn't present
      setFilters((f) => {
        if (typeof f.radius_km === "undefined") return f;
        return { ...f, radius_km: undefined };
      });
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
        .catch((err) => {
          // console.log(err);
        });
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
        collections,
      );
      const url = `${window.location.pathname}${qs ? "?" + qs : ""}`;
      window.history.replaceState(window.history.state, "", url);
    } catch {}
  }, [filters, persistToUrl, canModifyHistory, collections]);

  const update = (patch: Partial<Filters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  function toggleInArray<T extends string | number>(
    key: keyof Filters,
    val: T,
  ) {
    setFilters((f) => {
      const arr = new Set(f[key] as unknown as T[]);
      arr.has(val) ? arr.delete(val) : arr.add(val);
      return { ...f, [key]: Array.from(arr) } as Filters;
    });
  }

  // Update draft (used by the sheet sidebar)
  const updateDraft = (patch: Partial<Filters>) =>
    setDraftFilters((f) => ({ ...f, ...patch }));

  function toggleInArrayDraft<T extends string | number>(
    key: keyof Filters,
    val: T,
  ) {
    setDraftFilters((f) => {
      const arr = new Set(f[key] as unknown as T[]);
      arr.has(val) ? arr.delete(val) : arr.add(val);
      return { ...f, [key]: Array.from(arr) } as Filters;
    });
  }

  // Optional: clear only the draft (while sheet is open)
  const resetDraft = () => {
    const base = { ...DEFAULT_FILTERS, radius_km: 0 } as Partial<Filters>;
    setDraftFilters(base as Filters);
  };

  const resetAll = () => {
    const base = { ...DEFAULT_FILTERS, radius_km: 0 } as Partial<Filters>;
    setFilters(base as Filters);
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
    const currentRadius =
      typeof radius_km === "number" ? radius_km : DEFAULT_FILTERS.radius_km;
    if (currentRadius !== DEFAULT_FILTERS.radius_km) c++;
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
          JSON.stringify([...savedJobsLocal, { id: jobId }]),
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
          JSON.stringify(savedJobsLocal.filter((j) => j.id !== jobId)),
        );
      }
    } catch (error) {
      console.error("Failed to save job:", error);
      setSavedJobs((prev) => [...prev, { id: jobId } as JobList]);
    }
  };

  const t = useT("jobs");

  if (pendingCategorySlug && collections?.jobCategories?.length) {
    return <JobSkeleton count={4} />;
  }

  return (
    <div className="min-h-screen bg-white text-[#111110]" style={{ paddingTop: '64px' }}>
      {/* Mobile sheet for filters */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="left" className="p-0 w-full sm:max-w-md bg-white">
          <SheetHeader className="p-5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(0,0,0,.07)' }}>
            <SheetTitle className="font-display font-bold text-[16px] text-[#111110] flex items-center gap-2">
              {t("filter.title", { default: "Filters" })}
              {activeCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full text-white text-[10px] font-bold w-5 h-5" style={{ background: '#e8622a' }}>
                  {activeCount}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>
          <div className="p-5 overflow-y-auto overflow-x-visible h-[calc(100vh-8rem)]">
            {isCollectionsLoading && !collections ? (
              <FilterSidebarSkeleton />
            ) : (
              <JobFilterSidebar
                filters={draftFilters}
                update={updateDraft}
                toggleInArray={toggleInArrayDraft}
                resetAll={resetDraft}
                activeCount={activeCount}
                collections={collections}
                user={user}
                onChange={onChange}
              />
            )}
          </div>
          <div className="p-4 flex items-center justify-end gap-3" style={{ borderTop: '1px solid rgba(0,0,0,.07)' }}>
            <button
              type="button"
              onClick={resetDraft}
              className="h-[38px] px-4 rounded-[8px] text-[13px] font-medium text-[rgba(17,17,16,.6)] hover:text-[#111110] transition-colors"
              style={{ border: '1px solid rgba(0,0,0,.13)', background: 'transparent' }}
            >
              {t("mobile.clear", { default: "Clear" })}
            </button>
            <button
              type="button"
              onClick={() => {
                const applied = { ...draftFilters } as Partial<Filters>;
                if (applied.radius_km && applied.radius_km > 0) {
                  applied.lat = applied.lat ?? user?.lat ?? undefined;
                  applied.lng = applied.lng ?? user?.lng ?? undefined;
                } else {
                  applied.radius_km = 0;
                  applied.lat = undefined;
                  applied.lng = undefined;
                }
                setFilters(applied as Filters);
                setPage(1);
                setIsFilterOpen(false);
              }}
              className="h-[38px] px-4 rounded-[8px] text-[13px] font-semibold text-white transition-colors"
              style={{ background: '#e8622a', border: 'none' }}
            >
              {t("mobile.apply", { default: "Apply" })}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Page header */}
      <div style={{ borderBottom: '1px solid rgba(0,0,0,.07)', background: '#fff' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
          <div className="kz-section-label">Jobs</div>
          <h1 className="font-display font-extrabold text-[#111110]" style={{ fontSize: 'clamp(28px,4vw,42px)', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            Mini-Jobs in <span style={{ color: '#e8622a' }}>deiner Nähe</span>
          </h1>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 md:px-12 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Left: Filters */}
        <aside className="hidden lg:block">
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
        </aside>

        {/* Right: Job list */}
        <section className={`space-y-4 ${delayedFetching ? "opacity-60" : "opacity-100"} transition-opacity`}>
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

      {/* Sticky mobile filter bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3">
        <div className="flex items-center gap-3 p-3 rounded-[12px]" style={{ background: '#fff', boxShadow: '0 -4px 24px rgba(0,0,0,.1)', border: '1px solid rgba(0,0,0,.07)' }}>
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 h-[40px] rounded-[8px] text-[13px] font-medium text-[#111110] transition-colors"
            style={{ border: '1px solid rgba(0,0,0,.13)', background: '#f7f7f5' }}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("mobile.filters", { default: "Filters" })}
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full text-white text-[10px] font-bold w-5 h-5" style={{ background: '#e8622a' }}>
                {activeCount}
              </span>
            )}
          </button>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={resetAll}
              className="h-[40px] px-4 rounded-[8px] text-[13px] font-medium text-[rgba(17,17,16,.6)] hover:text-[#111110] transition-colors"
              style={{ border: '1px solid rgba(0,0,0,.13)', background: 'transparent' }}
            >
              {t("mobile.clear", { default: "Clear" })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
