// hooks/useApplyJob.ts
import { ApplyJobData, ApplyJobResponse } from "@/lib/types/apply-job";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { applyJobApi, checkJobApplied, withdrawApplication } from "../api-handler/apply-job";

export function useApplyJob() {
    const queryClient = useQueryClient();

    return useMutation<ApplyJobResponse, Error, ApplyJobData>({
        mutationFn: applyJobApi,
        onSuccess: (data) => {    
            queryClient.invalidateQueries({ queryKey: ["jobs", "applications"] });
        },
        onError: (err) => {
            console.error("Apply job failed:", err);
        },
    });
}


export const useWithdrawApplication = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (applicationId: string) => withdrawApplication(applicationId),
        onSuccess: () => {
            // Optional: invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["applied-job"] });
            queryClient.invalidateQueries({ queryKey: ["my-application"] });
        },
        onError: (error: any) => {
            console.error("Apply job failed:", error);
        },
    });
};




export const useCheckApplied = (jobId?: string) => {
  return useQuery({
    queryKey: ["applied-job", jobId],
    queryFn: async () => {
      if (!jobId) return null; // safe: resolves to null
      // Example fetch logic
      const res = checkJobApplied(jobId);
      return res;
    },
    enabled: !!jobId, // query runs only if jobId exists
  });
};

