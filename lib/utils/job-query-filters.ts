import { DatePosted, Filters, SortBy } from "../types/job";

export const DEFAULT_FILTERS: Filters = {
  q: "",
  city: "",
  category_id: [],
  job_type: [],
  job_experience: [],
  job_tags: [],
  min_price: "",
  max_price: "",
  posted: "any",
  radius_km: 10,
  sort: "new",
  starts_at: undefined,
  ends_at: undefined,
};

// ---- Utilities ----
export const toQuery = (f: Filters, collections?: any) => {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.city) p.set("city", f.city);
//   if (f.category_id.length) p.set("category_id", f.category_id.join(","));
  if (f.category_id.length) {
    if (collections?.jobCategories?.length) {
      const matched = collections.jobCategories.find(
        (c: any) => c.id === f.category_id[0]
      );
      if (matched?.slug) p.set("category", matched.slug);
      else p.set("category_id", f.category_id.join(","));
    } else {
      // fallback: no collections loaded yet → just use ID
      p.set("category_id", f.category_id.join(","));
    }
  }
  if (f.job_type.length) p.set("job_type", f.job_type.join(","));
  if (f.job_experience.length)
    p.set("job_experience", f.job_experience.join(","));
  if (f.job_tags.length) p.set("job_tags", f.job_tags.join(","));
  if (f.min_price) p.set("min_price", f.min_price);
  if (f.max_price) p.set("max_price", f.max_price);
  if (f.posted && f.posted !== "any") p.set("posted", f.posted);
  if (f.radius_km) p.set("radius_km", String(f.radius_km));
  if (f.sort && f.sort !== "new") p.set("sort", f.sort);
  if (f.starts_at) p.set("starts_at", f.starts_at);
  if (f.ends_at) p.set("ends_at", f.ends_at);
  return p.toString();
};

export const fromQuery = (qs: string): Filters => {
  const p = new URLSearchParams(qs);
  const types = (p.get("job_type") || "")
    .split(",")
    .filter(Boolean) as Filters["job_type"];
  const jobExperience = (p.get("job_experience") || "")
    .split(",")
    .filter(Boolean) as Filters["job_experience"];
  const jobTag = (p.get("job_tags") || "")
    .split(",")
    .filter(Boolean)
    .map(Number)
    .filter((v) => !isNaN(v));
  const category_id = (p.get("category_id") || "")
    .split(",")
    .filter(Boolean)
    .map(Number)
    .filter((v) => !isNaN(v));
  return {
    ...DEFAULT_FILTERS,
    q: p.get("q") || "",
    city: p.get("city") || "",
    category_id,
    job_type: types,
    job_experience: jobExperience,
    job_tags: jobTag,
    min_price: p.get("min_price") || "",
    max_price: p.get("max_price") || "",
    posted: (p.get("posted") as DatePosted) || "any",
    radius_km: Number(p.get("radius_km") || DEFAULT_FILTERS.radius_km),
    sort: (p.get("sort") as SortBy) || "new",
    starts_at: p.get("starts_at") || undefined,
    ends_at: p.get("ends_at") || undefined,
  };
};
