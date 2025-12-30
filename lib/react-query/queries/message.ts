import { MessageApiResponse, SendMessageData, SendMessageResponse } from "@/lib/types/message";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { countMessageApi, getConversationApi, getMyInboxApi, sendMessageApi } from "../api-handler/message";
import { Job } from "@/lib/types/job";

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
  jobId: string | null,
  userId: string | null,
  filters: Record<string, any>,
  options?: any
) => {
  console.log("Hook mounted", jobId, userId);

  return useQuery<MessageApiResponse>({
    queryKey: ["get-conversation", jobId, userId, filters],
    queryFn: () => getConversationApi(jobId!, userId!, filters),
    staleTime: 0,
    gcTime: 0,
    ...options,
    enabled: options?.enabled ?? (!!jobId && !!userId), // ✅ FIX
  });
};

export const useCountMessage = (
    jobId: string, 
    userId: string, 
    options?: any
) => {
    return useQuery<MessageApiResponse>({
        queryKey: ["count-conversation", jobId, userId], // Include all dependencies
        queryFn: () => countMessageApi(jobId, userId),
        placeholderData: (previousData) => previousData, // Replaces keepPreviousData in v5
        staleTime: 5000,
        ...options,
    });
};

export interface MyInboxItem {
  job_id: string
  job: Job
  last_message_at: string
}

export interface MyInboxApiResponse {
  status: boolean
  data: MyInboxItem[]
}

export const myInbox = (
  options?: Partial<UseQueryOptions<MyInboxApiResponse>>
) => {
  return useQuery<MyInboxApiResponse>({
    queryKey: ["my-inbox"],
    queryFn: () => getMyInboxApi(),
    keepPreviousData: true,
    enabled: options?.enabled ?? true,
    ...options,
  } as UseQueryOptions<
    MyInboxApiResponse,
    unknown,
    MyInboxApiResponse,
    readonly unknown[]
  >)
}
