import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { createJobApi, generateSlugApi, getJobApi, getJobCollectionsApi, getJobsApi, getMyJobsApi, updateJobApi } from "../api-handler/job-api";
import { CreateJobData, CreateJobResponse, JobApiResponse, JobCollections } from "@/lib/types/job";

// Create job
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation<CreateJobResponse, Error, Partial<CreateJobData>>({
    mutationFn: createJobApi,
    onSuccess: (data) => {
      console.log(" Job created:", data);
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (err) => {
      console.error("Create job failed:", err);
    },
  });
}


export function useUpdateJob(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation<CreateJobResponse, Error, Partial<CreateJobData>>({
    mutationFn: (updatedData) => updateJobApi(jobId, updatedData),
    onSuccess: (data) => {
      console.log("Job updated:", data);
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (err) => console.error("Update job failed:", err),
  });
}

export function useGenerateSlug() {
  const queryClient = useQueryClient();

  return useMutation<{ slug: string }, Error, string>({
    mutationFn: (title) => generateSlugApi(title),
    onSuccess: (data) => {
      console.log("Generated slug:", data.slug);
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (err) => console.error("Slug generation failed:", err),
  });
}

//  Single job
export function useJob(id: string) {
  return useQuery({
    queryKey: ["job", id],
    queryFn: () => getJobApi(id),
    enabled: !!id, // don't fetch if id is empty
  });
}


export function useJobCollections() {
  return useQuery<JobCollections>({
    queryKey: ["jobCollections"],
    queryFn: () => getJobCollectionsApi(),
  });
}

export const useJobs = (filters: Record<string, any>) => {
  return useQuery<JobApiResponse>({
    queryKey: ["jobs", filters],
    queryFn: () => getJobsApi(filters),
    keepPreviousData: true, // works here
  } as UseQueryOptions<JobApiResponse, unknown, JobApiResponse, readonly unknown[]>);
};

export const myJobs = (filters: Record<string, any>) => {
  return useQuery<JobApiResponse>({
    queryKey: ["jobs", filters],
    queryFn: () => getMyJobsApi(filters),
    keepPreviousData: true, // works here
  } as UseQueryOptions<JobApiResponse, unknown, JobApiResponse, readonly unknown[]>);
};