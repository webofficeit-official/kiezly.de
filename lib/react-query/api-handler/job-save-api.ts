import apiClient from "@/lib/config/axios-client";
import { SaveJobData, SaveJobResponse } from "@/lib/types/JobSave";

export const addJobAsFavorite = async (job: SaveJobData): Promise<SaveJobResponse> => {
  const { data } = await apiClient.post("/jobs/favorite", job);
  return data;
};