import { UserProfile } from "@/components/MyProfile";
import apiClient from "@/lib/config/axios-client";
import { useMutation, UseMutationResult } from "@tanstack/react-query";

export interface MyProfileResponse {
  success: boolean;
  message: string;
  user: UserProfile;
}

export const getProfile = (): UseMutationResult<
  MyProfileResponse,   
  Error       
> => {
  return useMutation({
    mutationFn: (token: string) =>
      apiClient.get("/profile/me", {
        headers: {
            Authorization: `Bearer ${token}`
        }
      }).then(res => res.data),
  });
};