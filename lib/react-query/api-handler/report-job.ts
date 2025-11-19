import apiClient from "@/lib/config/axios-client";
import { ReportJobData, ReportJobResponse } from "@/lib/types/report-job";

export const reportJobApi = async ({
    jobId,
    reason,
    description,
}: ReportJobData): Promise<ReportJobResponse> => {
    const { data } = await apiClient.post(`/jobs/report/${jobId}`, {
        reason,
        description,
    });
    return data;
};