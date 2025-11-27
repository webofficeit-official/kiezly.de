import { getSavedJobResponse, SaveJobData, SaveJobResponse } from "@/lib/types/JobSave";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addJobAsFavorite, getSavedJobs } from "../api-handler/job-save-api";

export function userSaveJob() {
  return useMutation<SaveJobResponse, Error, SaveJobData>({
    mutationFn: addJobAsFavorite,
    onSuccess: (data) => {
      
    },
    onError: (err) => {
      console.error("Job cant be saved:", err);
    },
  });
}