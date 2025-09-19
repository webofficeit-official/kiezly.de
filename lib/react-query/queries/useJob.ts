import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createJobApi, getJobApi } from "../api-handler/job-api";

// Create job
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJobApi,
    onSuccess: (data) => {
      console.log("Job created:", data);
      // refresh job lists
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (err: any) => {
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

