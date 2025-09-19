import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createJobApi, getJobApi, getJobCollectionsApi } from "../api-handler/job-api";
import { CreateJobData, CreateJobResponse, JobCollections } from "@/lib/types/job";

// Create job
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation<CreateJobResponse, Error, CreateJobData>({
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

