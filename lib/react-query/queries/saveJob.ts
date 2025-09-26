import { SaveJobData, SaveJobResponse } from "@/lib/types/JobSave";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addJobAsFavorite } from "../api-handler/job-save-api";

export function userSaveJob() {
  return useMutation<SaveJobResponse, Error, SaveJobData>({
    mutationFn: addJobAsFavorite,
    onSuccess: (data) => {
      console.log(" Job saved:", data);
    },
    onError: (err) => {
      console.error("Job cant be saved:", err);
    },
  });
}