import apiClient from "@/lib/config/axios-client";
import { CreateJobData, CreateJobResponse, JobCollectionsResponse } from "@/lib/types/job";


export const createJobApi = async (job: CreateJobData): Promise<CreateJobResponse> => {
  const { data } = await apiClient.post("/jobs", job);
  return data;
};


// Get job by ID
export const getJobApi = async (id: string) => {
    const res = await apiClient.get(`/jobs/${id}`);
    return res.data;
};

export async function getJobCollectionsApi(): Promise<JobCollectionsResponse["data"]> {
  const { data } = await apiClient.get<JobCollectionsResponse>("/collections/job");
  return data.data;
}