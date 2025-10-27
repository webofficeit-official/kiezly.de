// hooks/useApplyJob.ts
import { Application, ApplyJobData, ApplyJobResponse, JobApplicantsResponse, MyApplicationResponse, MyApplicationsData } from "@/lib/types/apply-job";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { applyJobApi, checkJobApplied, getApplicantsByJobId, getMyApplications, updateApplicationStatus, withdrawApplication } from "../api-handler/apply-job";
import apiClient from "@/lib/config/axios-client";

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


export const useUpdateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      status,
      cover_note = "",
      proposed_rate = ""
    }: {
      applicationId: string;
      status?: string;
      cover_note?: string;
      proposed_rate?: string;
    }) => updateApplicationStatus(applicationId, status, cover_note || "", proposed_rate || ""),
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


interface JobApplicantsParams {
  jobId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sort?: "asc" | "desc";
  enabled?: boolean;
}


interface JobApplicantsParams {
  jobId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sort?: "asc" | "desc";
  enabled?: boolean;
}

export const useJobApplicants = ({
  jobId,
  status = "",
  page = 1,
  pageSize = 20,
  sort = "asc",
  enabled = true,
}: JobApplicantsParams) => {
  return useQuery({
    queryKey: ["job-applicants", jobId, status, page, pageSize, sort],
    queryFn: async () => {
      const res = await getApplicantsByJobId(jobId!, {
        status,
        page,
        page_size: pageSize,
        sort,
      });
      return res; // returns { applicants, page, total_pages, total_items }
    },
    enabled: !!jobId && enabled,
    placeholderData: (prev) => prev, // 👈 keeps previous data during pagination
  });
};



export function useUpdateApplicantStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      status,
      cover_note = "",
      proposed_rate = ""
    }: {
      applicationId: string;
      status?: string;
      cover_note?: string;
      proposed_rate?: string;
    }) => updateApplicationStatus(applicationId, status, cover_note || "", proposed_rate || ""),

    onSuccess: () => {
      // invalidate the applicants list
      queryClient.invalidateQueries({ queryKey: ["job-applicants"] });
    },

    onError: (error: any) => {
      console.error("Update status failed:", error);
    },
  });
}

export const useMyApplications = (status: string, page: number, pageSize: number) => {
  return useQuery<MyApplicationsData, Error>({
    queryKey: ["my-applications", status, page, pageSize],
    queryFn: async () => {
      const res: MyApplicationResponse = await getMyApplications(status, page, pageSize);
      return res.data;
    },
    enabled: true,
  });
};

export const useApplicantDetails = (userId: string | null) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/user/${userId}`);
      return data.user; // unwrap user
    },
    enabled: !!userId, // only fetch when id is available
  });
};