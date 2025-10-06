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
