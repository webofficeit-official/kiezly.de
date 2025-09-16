import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/config/axios-client";

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  token?: {
    access: string;
    refresh: string;
  };
}

export const useVerifyEmail = (id: string | undefined, token: string | null) => {
  return useQuery<VerifyEmailResponse, Error>({
    queryKey: ["verifyEmail", id, token],
    queryFn: async () => {
      const { data } = await apiClient.get<VerifyEmailResponse>(
        `/auth/verify-email/${id}`,
        { params: { token } }
      );
      return data;
    },
    enabled: !!id && !!token,
    retry: false,
  });
};
