import apiClient from "@/lib/config/axios-client";

// Create job
export const createJobApi = async (data: any) => {
  const res = await apiClient.post("/jobs", data);
  return res.data;
};

// Get job by ID
export const getJobApi = async (id: string) => {
  const res = await apiClient.get(`/jobs/${id}`);
  return res.data;
};