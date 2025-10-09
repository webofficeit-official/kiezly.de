import apiClient from "@/lib/config/axios-client";
import { ApplyJobData, ApplyJobResponse } from "@/lib/types/apply-job";


export const applyJobApi = async ({
  jobId,
  cover_note,
  proposed_rate,
}: ApplyJobData): Promise<ApplyJobResponse> => {
  const { data } = await apiClient.post(`/jobs/${jobId}/apply`, {
    cover_note,
    proposed_rate,
  });
  return data;
};


export const withdrawApplication = async (applicationId: string) => {
  const response = await apiClient.delete(`jobs/application/${applicationId}/withdraw`);
  return response.data;
};

export const checkJobApplied = async (jobId: string) => {
  const { data } = await apiClient.get(`/jobs/${jobId}/applied`);
  return data; 
  
};

export const getApplicantsByJobId = async (
  jobId: string,
  params: { status?: string; page?: number; page_size?: number; sort?: "asc" | "desc" }
) => {
  // Convert params to query string
  const queryString = new URLSearchParams({
    ...(params.status ? { status: params.status } : {}),
    page: String(params.page ?? 1),
    page_size: String(params.page_size ?? 20),
    sort: params.sort ?? "asc",
  }).toString();

  try {
    const { data } = await apiClient.get(`/jobs/${jobId}/applicants?${queryString}`);
    
    // Axios automatically parses JSON and puts it in data
    return data.data; // returns { applicants, page, total_pages, total_items }
  } catch (error: any) {
    console.error("Failed to fetch job applicants:", error);
    throw new Error(error?.response?.data?.message || "Failed to fetch job applicants");
  }
};



export const updateApplicationStatus = async (
  applicationId: string,
  status: string
) => {
  const { data } = await apiClient.patch(
    `/jobs/application/${applicationId}/status`,
    { status }
  );
  return data;
};

export const getMyApplications = async (status: string, page: number, pageSize: number) => {
    const { data } = await apiClient.get(`/jobs/applications?status=${status}&page=${page}&page_size=${pageSize}`);
    return data; // returns { success, message, applicants }
};