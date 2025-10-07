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