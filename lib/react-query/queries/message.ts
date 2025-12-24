import { MessageApiResponse, SendMessageData, SendMessageResponse } from "@/lib/types/message";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { getConversationApi, sendMessageApi } from "../api-handler/message";

export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation<SendMessageResponse, Error, SendMessageData>({
        mutationFn: sendMessageApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["get-conversation"] });
        },
        onError: (err) => {
            console.error("Apply job failed:", err);
        },
    });
}

export const useGetConversation = (
    jobId: string, 
    userId: string, 
    filters: Record<string, any>, 
    options?: any
) => {
    return useQuery<MessageApiResponse>({
        queryKey: ["get-conversation", jobId, userId, filters], // Include all dependencies
        queryFn: () => getConversationApi(jobId, userId, filters),
        placeholderData: (previousData) => previousData, // Replaces keepPreviousData in v5
        staleTime: 5000,
        ...options,
    });
};