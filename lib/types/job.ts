export interface Job {
  id: string;
  client_id: string;
  title: string;
  description: any | null;
  category_id: number;
  price_type: string;
  price_value: string;
  currency: string | null;
  status: string;
  country: string | null;
  state: string | null;
  city: string | null;
  postal_code: string | null;
  street: string | null;
  lat: number | null;
  lng: number | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  geom: any | null;
  subtitle: string;
  price_min: string;
  price_max: string;
  job_type: string[];
  job_experience: string[];
  first_aid_verified: boolean | null;
  police_verified: boolean | null;
  verified: boolean;
  slug?: string;
  tasks: any | null;
  requirements: any | null;
  work_mode: string;
  rate_hourly: number | null;
  budget_fixed: number | null;
  rrule: any | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_link: string | null;
  contact_method: string | null;
  views_count: number;
  saves_count: number;
  reports_count: number;
  published_at: string | null;
  expires_at: string | null;

  // Add these:
  category?: {
    id: number;
    slug: string;
    name: string;
  };
  tags?: {
    id: number;
    name: string;
  }[];

  languages?: {
    id: number;
    slug: string;
    name: string;
  }[];

  countries?: {
    id?: number;
    code?: string;
    currency?: string;
    name?: string;
  };
}

export type CreateJobData = {
  title: string;
  subtitle: string;
  description: string;
  category_id: number | null;
  price_type: string;
  price_value: number | null;
  price_min: number | null;
  price_max: number | null;
  currency: string;
  country: string;
  state: string;
  city: string;
  postal_code: string;
  street: string;
  lat: string;
  lng: string;
  starts_at?: string;
  ends_at?: string;
  job_experience: string[];
  job_type: string[];
  first_aid_verified: boolean;
  police_verified: boolean;
  verified: boolean;
  status?: string;
  tag_ids: number[];
  tasks?: string;
  requirements?: string;
  languages?: number[];
  slug?: string;
};

export interface CreateJobResponse {
  status: boolean;
  message: string;
  data: Job;
}

export interface JobResponse {
  status: boolean;
  message: string;
  job: Job;
}

export interface JobCategory {
  id: number;
  slug?: string;
  name: string;
}

export interface jobLanguage {
  id: number;
  name: string;
}

export interface JobTag {
  id: number;
  name: string;
}

export interface JobMode {
  key: string;
  label: string;
}

export interface JobCollections {
  jobType: JobType[];
  jobExperience: JobExperience[];
  jobCategories: JobCategory[];
  jobTags: JobTag[];
  languages: jobLanguage[];
  jobMode: JobMode[];
  countries: [];
}

export interface JobCollectionsResponse {
  success: boolean;
  message: string;
  data: JobCollections;
}

export interface JobList {
  id: string;
  client_id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string; // HTML string
  category_id: number;
  category_name: string;
  price_type: string;
  price_value: string; // backend has this too
  price_min: string;
  price_max: string;
  currency: string;
  status: string;
  country: string;
  state: string;
  city: string;
  postal_code: string;
  street: string;
  lat: number;
  lng: number;
  starts_at: string; // ISO datetime
  ends_at: string; // ISO datetime
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  geom: string;
  job_type: string[]; // array in response
  job_experience: string[]; // array in response
  first_aid_verified: boolean;
  police_verified: boolean;
  verified: boolean;
  distance?: number;
  tags: {
    id: number;
    slug: string;
    name: string;
  }[];
  category?: {
    id: number;
    slug: string;
    name: string;
  };
  countries?: {
    id?: number;
    code?: string;
    currency?: string;
    name?: string;
  };
}

export type JobApiResponse = {
  status: boolean;
  message: string;
  data: {
    items: JobList[];
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

export type JobSaveApiResponse = {
  status: boolean;
  message: string;
  jobs: JobList[];
};

export type SortBy = "new" | "price_desc" | "price_asc";
export type DatePosted = "any" | "1" | "7" | "30";

export type Filters = {
  q: string;
  city: string;
  category_id: number[];
  job_type: number[];
  job_experience: number[];
  job_tags: number[];
  min_price: string;
  max_price: string;
  posted: DatePosted;
  radius_km: number; // 0..50
  sort: SortBy;
  starts_at?: string;
  ends_at?: string;
  lat?: number;
  lng?: number;
};

export type JobExperience = {
  id: number,
  name: string
}

export type JobType = {
  id: number,
  name: string
}