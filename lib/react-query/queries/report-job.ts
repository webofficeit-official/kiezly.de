import { MyJobReportedData, MyJobReportedResponse, ReportJobData, ReportJobResponse } from "@/lib/types/report-job";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyReportedJobs, reportJobApi } from "../api-handler/report-job";

export function useReportJob() {
    const queryClient = useQueryClient();

    return useMutation<ReportJobResponse, Error, ReportJobData>({
        mutationFn: reportJobApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["jobs", "applications"] });
            queryClient.invalidateQueries({ queryKey: ["my-job-reports"] });
            queryClient.invalidateQueries({ queryKey: ["applied-job"] });
        },
        onError: (err) => {
            console.error("Report job failed:", err);
        },
    });
}

export const useMyReportedJobs = (status: string, page: number, pageSize: number, sort: string) => {
    return useQuery<MyJobReportedData, Error>({
        queryKey: ["my-job-reports", status, page, pageSize, sort],
        queryFn: async () => {
            const res: MyJobReportedResponse = await getMyReportedJobs(status, page, pageSize, sort);
            return res.data;
        },
        enabled: true,
    });
};