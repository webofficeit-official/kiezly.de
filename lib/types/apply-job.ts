import { Job } from "./job";

export interface ApplyJobData {
  cover_note: string;
  proposed_rate: string;
  jobId: string;
}

export interface ApplyJobResponse {
  success: boolean;
  message: string;
  application: any;
}

// types/job.ts
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  bio: string;
  country: string;
  state: string;
  city: string;
  postal_code: string;
  street: string;
  lat: number;
  lng: number;
  district: string;
}

export interface Application {
  id: string;
  job_id: string;
  helper_id: string;
  cover_note: string;
  proposed_rate: string;
  status: string; // 'applied' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn'
  created_at: string;
  updated_at: string;
  user: User;
}

export interface MyApplications {
  id: string;
  job_id: string;
  helper_id: string;
  cover_note: string;
  proposed_rate: string;
  status: string; // 'applied' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn'
  created_at: string;
  updated_at: string;
  job: Job;
}

export interface MyApplicationsData {
  applications: MyApplications[],
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface JobApplicantsResponse {
  success: boolean;
  message: string;
  applicants: Application[];
}


export interface MyApplicationResponse {
  success: boolean;
  message: string;
  data: MyApplicationsData;
}
