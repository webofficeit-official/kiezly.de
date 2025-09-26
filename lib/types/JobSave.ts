import { JobList } from "./job";

export interface SaveJobResponse {
  status: boolean;
  message: string;
}

export interface SaveJobData {
  jobId: string;
}

export interface getSavedJobResponse {
  status: boolean;
  message: string;
  jobs: JobList;
}