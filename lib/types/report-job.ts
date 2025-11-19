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
}