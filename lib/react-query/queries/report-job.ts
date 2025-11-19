import { ReportJobData, ReportJobResponse } from "@/lib/types/report-job";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportJobApi } from "../api-handler/report-job";

export function useReportJob() {
    const queryClient = useQueryClient();

    return useMutation<ReportJobResponse, Error, ReportJobData>({
        mutationFn: reportJobApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["jobs", "applications"] });
            queryClient.invalidateQueries({ queryKey: ["my-application"] });
            queryClient.invalidateQueries({ queryKey: ["applied-job"] });
        },
        onError: (err) => {
            console.error("Report job failed:", err);
        },
    });
}