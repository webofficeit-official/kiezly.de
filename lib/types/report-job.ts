import { Job } from "./job";

export interface ReportJobData {
  reason: string;
  description: string;
  jobId: string;
}

export interface ReportJobResponse {
  success: boolean;
  message?: string;
  error?: string;
  data: any;
}

export interface JobReport {
  id: number
  job_id: string
  user_id: string
  reason?: string
  description?: string
  status?: 'pending' | 'reviewed' | 'rejected' | 'resolved'
  admin_id?: string
  created_at?: Date
  updated_at?: Date
  job?: Job;
}

export interface MyJobReportedData {
  jobReports: JobReport[],
  page?: number;
  page_size?: number;
  total_items?: number;
  total_pages?: number;
}

export interface MyJobReportedResponse {
  success: boolean;
  message: string;
  data: MyJobReportedData;
}