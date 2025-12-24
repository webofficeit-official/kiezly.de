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