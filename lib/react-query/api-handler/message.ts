import apiClient from "@/lib/config/axios-client";
import { SendMessageData, SendMessageResponse } from "@/lib/types/message";

export const sendMessageApi = async ({
  jobId,
  recipient_id,
  body,
}: SendMessageData): Promise<SendMessageResponse> => {
  const { data } = await apiClient.post(`/message/${jobId}`, {
    recipient_id,
    body,
  });
  return data;
};

export const getConversationApi = async (jobId: string, userId: string, params: Record<string, any>) => {
  const response = await apiClient.get(`/message/${jobId}/${userId}`, { params });
  return response.data;
};