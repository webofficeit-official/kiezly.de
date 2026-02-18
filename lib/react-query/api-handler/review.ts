import apiClient from "@/lib/config/axios-client";
import { SubmitReviewData, SubmitReviewResponse } from "@/lib/types/review";

export const SubmitReviewApi = async ({
  jobId,
  revieweeId,
  comment,
  rating,
}: SubmitReviewData): Promise<SubmitReviewResponse> => {
  const { data } = await apiClient.post(`/reviews/${jobId}`, {
    reviewee_id: revieweeId,
    comment,
    rating
  });
  return data;
};

export const getReviewApi = async (
  jobId: string,
  revieweeId: string
) => {
  const response = await apiClient.get(`/reviews/${jobId}/${revieweeId}`, {
  });
  return response.data;
};

export const getUserReviewApi = async (
  userId: string,
  params: Record<string, any>
) => {
  const response = await apiClient.get(`/reviews/${userId}`, {
    params
  });
  return response.data;
};