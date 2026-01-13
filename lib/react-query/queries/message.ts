import { MessageApiResponse, SendMessageData, SendMessageResponse } from "@/lib/types/message";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { countMessageApi, getConversationApi, getMyInboxApi, getMyInboxClientApi, sendMessageApi } from "../api-handler/message";
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
  const queryClient = useQueryClient();

  return useQuery<MessageApiResponse>({
    queryKey: ["get-conversation", jobId, userId, filters],
    queryFn: () => getConversationApi(jobId!, userId!, filters),
    staleTime: 0,
    gcTime: 0,
    ...options,
    enabled: options?.enabled ?? (!!jobId && !!userId), // ✅ FIX

    onSuccess: (data) => {
      // 🔥 invalidate inbox so unread counts update
      queryClient.invalidateQueries({
        queryKey: ["my-inbox"],
      });

      // allow caller to still use onSuccess
      options?.onSuccess?.(data);
    },
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

export interface ClientInboxApplicant {
  application_id: string;
  proposed_rate: number | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface ClientInboxJob {
  job_id: string;
  title: string;
  city: string;
  state: string;
  category_name: string;
  countries: {
    id: number;
    code: string;
    name: string;
    currency: string;
  };
  applicants: ClientInboxApplicant[];
}

export interface ClientInboxApiResponse {
  status: boolean;
  data: ClientInboxJob[];
}



export const myInboxClient = (
  options?: Partial<UseQueryOptions<ClientInboxApiResponse, Error>>
) => {
  return useQuery<ClientInboxApiResponse, Error>({
    queryKey: ["my-inbox-client"],
    queryFn: getMyInboxClientApi,

    select: (res) => ({
      status: res.status,
      data: res.data.map((job) => ({
        ...job,
        applicants: job.applicants ?? [], 
      })),
    }),

    enabled: options?.enabled ?? true,
    staleTime: 0,

    ...options,
  });
};


