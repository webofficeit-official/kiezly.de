import { SendMessageData, SendMessageResponse } from "@/lib/types/message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessageApi } from "../api-handler/message";

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<SendMessageResponse, Error, SendMessageData>({
    mutationFn: sendMessageApi,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: ["jobs", "applications"] });
    },
    onError: (err) => {
      console.error("Apply job failed:", err);
    },
  });
}