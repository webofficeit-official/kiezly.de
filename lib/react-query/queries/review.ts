import { ReviewApiResponse, SubmitReviewData, SubmitReviewResponse, UserReviewApiResponse } from "@/lib/types/review";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getReviewApi, getUserReviewApi, SubmitReviewApi } from "../api-handler/review";


export function useSubmitReview() {
    const queryClient = useQueryClient();

    return useMutation<SubmitReviewResponse, Error, SubmitReviewData>({
        mutationFn: SubmitReviewApi,
        onSuccess: (data) => {
        },
        onError: (err) => {
            console.error("Review submit failed:", err);
        },
    });
}

export const useGetReview = (
    jobId: string | null,
    revieweeId: string | null,
    options?: any
) => {
    const queryClient = useQueryClient();

    return useQuery<ReviewApiResponse>({
        queryKey: ["get-review", jobId, revieweeId],
        queryFn: () => getReviewApi(jobId!, revieweeId!),
        staleTime: 0,
        gcTime: 0,
        ...options,
        enabled: options?.enabled ?? (!!jobId && !!revieweeId), //  FIX

        onSuccess: (data) => {
            // allow caller to still use onSuccess
            options?.onSuccess?.(data);
        },
    });
};

export const useGetUserReviews = (
    userId: string | null,
    filters: Record<string, any>,
    options?: any
) => {
    const queryClient = useQueryClient();

    return useQuery<UserReviewApiResponse>({
        queryKey: ["get-suer-reviews", userId, filters],
        queryFn: () => getUserReviewApi(userId!, filters),
        staleTime: 0,
        gcTime: 0,
        ...options,
        enabled: options?.enabled ?? (!!userId), //  FIX

        onSuccess: (data) => {
            // allow caller to still use onSuccess
            options?.onSuccess?.(data);
        },
    });
};