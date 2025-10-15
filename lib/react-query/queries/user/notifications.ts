import apiClient from "@/lib/config/axios-client";
import { NotificationsResponse } from "@/lib/types/notifications";
import { useMutation, UseMutationResult } from "@tanstack/react-query";

export const getNotifications = (): UseMutationResult<
  NotificationsResponse,   
  Error       
> => {
  return useMutation({
    mutationFn: (token: string) =>
      apiClient.get("/profile/notifications").then(res => res.data),
  });
};