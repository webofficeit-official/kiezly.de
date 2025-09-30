import apiClient from "@/lib/config/axios-client";
import { SaveJobData, SaveJobResponse } from "@/lib/types/JobSave";

export const addJobAsFavorite = async (job: SaveJobData): Promise<SaveJobResponse> => {
  const { data } = await apiClient.post("/jobs/favorite", job);
  return data;
};

export const getSavedJobs = async () => {
    const res = await apiClient.get(`/jobs/favorite`);
    return res.data;
};

export const unsaveJobAsFavorite = async (jobId: string): Promise<SaveJobResponse> => {
  const { data } = await apiClient.delete(`/jobs/favorite/${jobId}`);
  return data;
};