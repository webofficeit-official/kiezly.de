// hooks/useApplyJob.ts
import { Application, ApplyJobData, ApplyJobResponse, JobApplicantsResponse } from "@/lib/types/apply-job";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { applyJobApi, checkJobApplied, getApplicantsByJobId, updateApplicationStatus, withdrawApplication } from "../api-handler/apply-job";

export function useApplyJob() {
    const queryClient = useQueryClient();

    return useMutation<ApplyJobResponse, Error, ApplyJobData>({
        mutationFn: applyJobApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["jobs", "applications"] });
            queryClient.invalidateQueries({ queryKey: ["my-application"] });
            queryClient.invalidateQueries({ queryKey: ["applied-job"] });
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
            queryClient.invalidateQueries({ queryKey: ["jobs", "applications"] });
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


export const useJobApplicants = (jobId?: string, enabled: boolean = true) => {
  return useQuery<Application[], Error>({
    queryKey: ["job-applicants", jobId],
    queryFn: async () => {
      const res: JobApplicantsResponse = await getApplicantsByJobId(jobId!);
      return res.applicants;
    },
    enabled: !!jobId && enabled,  // fetch only if jobId exists AND enabled is true
  });
};

export function useUpdateApplicantStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: string;
    }) => updateApplicationStatus(applicationId, status),

    onSuccess: () => {
      // invalidate the applicants list
      queryClient.invalidateQueries({ queryKey: ["job-applicants"] });
    },

    onError: (error: any) => {
      console.error("Update status failed:", error);
    },
  });
}


