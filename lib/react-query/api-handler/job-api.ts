import apiClient from "@/lib/config/axios-client";
import { CreateJobData, CreateJobResponse, JobCollectionsResponse, JobResponse } from "@/lib/types/job";


export const createJobApi = async (job: CreateJobData): Promise<CreateJobResponse> => {
  const { data } = await apiClient.post("/jobs", job);
  return data;
};

export const updateJobApi = async (
  jobId: string,
  job: Partial<CreateJobData>
): Promise<JobResponse> => {
  try {
    const { data } = await apiClient.patch(`/jobs/${jobId}`, job);
    return data;
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    throw err;
  }
};

export const generateSlugApi = async (title: string): Promise<{ slug: string }> => {
  const { data } = await apiClient.post("/jobs/generate-slug", { title });
  return data;
};

// Get job by ID
export const getJobApi = async (id: string) => {
  const res = await apiClient.get(`/jobs/${id}`);
  return res.data;
};

export async function getJobCollectionsApi(): Promise<JobCollectionsResponse["data"]> {
  const { data } = await apiClient.get<JobCollectionsResponse>("/collection/job");
  return data.data;
}



export const getJobsApi = async (params: Record<string, any>) => {
  const response = await apiClient.get("/jobs", { params });
  return response.data;
};

export const getMyJobsApi = async (params: Record<string, any>) => {
  const response = await apiClient.get("/jobs/myJobs", { params });
  return response.data;
};
