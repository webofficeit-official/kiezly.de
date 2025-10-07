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

export const getApplicantsByJobId = async (jobId: string) => {
    const { data } = await apiClient.get(`/jobs/${jobId}/applicants`);
    return data; // returns { success, message, applicants }
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