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

export const getMyReportedJobs = async (status: string, page: number, pageSize: number, sort: string = 'asc') => {
    const { data } = await apiClient.get(`/jobs/report?status=${status}&page=${page}&page_size=${pageSize}&sort=${sort}`);
    return data; // returns { success, message, data }
};