// hooks/useApplyJob.ts
import { ApplyJobData, ApplyJobResponse } from "@/lib/types/apply-job";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applyJobApi } from "../api-handler/apply-job";

export function useApplyJob() {
    const queryClient = useQueryClient();

    return useMutation<ApplyJobResponse, Error, ApplyJobData>({
        mutationFn: applyJobApi,
        onSuccess: (data) => {
            console.log("Job applied:", data);
            queryClient.invalidateQueries({ queryKey: ["jobs", "applications"] });
        },
        onError: (err) => {
            console.error("Apply job failed:", err);
        },
    });
}
