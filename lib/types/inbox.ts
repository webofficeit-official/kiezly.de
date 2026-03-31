import { Application } from "./apply-job";

export interface InboxApplicant {
  id: string;
  application_id: string;
  proposed_rate: number | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface InboxJob {
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
  applicants?: Application[];
}
