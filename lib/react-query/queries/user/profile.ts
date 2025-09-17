import { UserProfile } from "@/components/MyProfile";
import apiClient from "@/lib/config/axios-client";
import { useMutation, UseMutationResult } from "@tanstack/react-query";

export interface MyProfileResponse {
  success: boolean;
  message: string;
  user: UserProfile;
}

export interface UpdateProfileData {
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  bio: string;
  country: string;
  state: string;
  city: string;
  postal_code: string;
  street: string;
  lat: number;
  lng: number;
  has_first_aid: boolean;
  education_level: string;
  police_verified: boolean;
  avatar_url: string;
  org_name: string;
  website: string;
  rate: number;
  display_name: string;
  gender: string;
  district: string;
  fixed_price: boolean;
  min_hours: number;
  work_permit: boolean;
  issue_invoice: boolean;
  experience: number;
  certificates: string;
  skills: any[];
  languages: any[];
  weekdays: any[];
  time_windows: any[];
}

interface UpdateProfileResponse {
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
      apiClient.get("/profile/me").then(res => res.data),
  });
};

export const updateProfile = (): UseMutationResult<
  UpdateProfileResponse,      // Type of data returned
  Error,               // Type of error
  UpdateProfileData           // Variables you pass to mutate()
> => {
  return useMutation({
    mutationFn: (data: UpdateProfileData) =>
      apiClient.put("/profile/me", data).then(res => res.data),
  });
};