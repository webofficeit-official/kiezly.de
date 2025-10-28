import { useMutation, UseMutationResult, useQuery, UseQueryResult } from "@tanstack/react-query";
import apiClient, { setAccessToken, setRefreshToken } from "@/lib/config/axios-client";
import { ForgotPasswordData, ForgotPasswordResponse, ResetPasswordData, ResetPasswordResponse, VerifyResetParams, VerifyResetResponse } from "@/lib/types/auth-type";

export interface SignupData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
  city: string;
  zip: string;
  state: string;
  latitude: string;
  longitude: string;
  country: string;
  org_name: string;
  website: string;
  skills: any[];
  rate: string;
}

interface SignupResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  token: string;
  message: string;
  success: boolean
}


export interface LoginData {
  email: string;
  password: string;
  role?: string;
}

export interface LocationData {
  zip: string;
  country?: number;
  limit?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  token: {
    access: string;
    refresh: string;
  };
}

export interface CollectionResponse {
  success: boolean;
  message: string;
  data: {
    countries: [];
    jobCategories: [];
    weekdays: [];
    timeWindows: [];
    languages: [];
  };
}

export interface LocationResponse {
  success: boolean;
  message: string;
  data: {
    zipcode: [];
  };
}

export interface Zipcode {
  id: number;
  country_id: number;
  zipcode: string;
  street: string;
  city: string;
  state: string;
  latitude: string;
  longitude: string;
}

export const useSignup = (): UseMutationResult<
  SignupResponse,      // Type of data returned
  Error,               // Type of error
  SignupData           // Variables you pass to mutate()
> => {
  return useMutation({
    mutationFn: (data: SignupData) =>
      apiClient.post("/auth/register", data).then(res => res.data),
  });
};



export const useLogin = (): UseMutationResult<
  LoginResponse,
  Error,
  LoginData
> => {
  return useMutation({
    mutationFn: (data: LoginData) =>
      apiClient.post("/auth/login", data).then(
        (res) => {
          const loginData = res.data;

          //  Set access token in Axios defaults for future requests
          if (loginData?.token?.access) {
            setAccessToken(loginData.token.access);
          }
          if (loginData?.token?.refresh) {
            setRefreshToken(loginData.token.refresh);
          }

          return loginData;
        }),
  });
};

export const useCollections = (): UseMutationResult<
  CollectionResponse,
  Error
> => {
  return useMutation({
    mutationFn: (data: LoginData) =>
      apiClient.get("/collection").then(res => res.data),
  });
};

export const getCityByZip = (): UseMutationResult<
  LocationResponse,
  Error
> => {
  return useMutation({
    mutationFn: (data: LocationData) =>
      apiClient.post("/collection/zipcode", {
        zip: data.zip,
        country: data.country,
        limit: 5
      }).then(res => res.data),
  });
};

export const useForgotPassword = (): UseMutationResult<
  ForgotPasswordResponse,
  Error,
  ForgotPasswordData
> => {
  return useMutation({
    mutationFn: (data: ForgotPasswordData) =>
      apiClient.post("/auth/forgot-password", data).then((res) => res.data),
  });
};
// Verify reset link
export const useVerifyResetLink = (
  params: VerifyResetParams | null
): UseQueryResult<VerifyResetResponse, Error> => {
  const enabled = !!params?.id && !!params?.token;
  return useQuery({
    queryKey: ["verify-reset", params?.id, params?.token],
    enabled,
    queryFn: async () => {
      const { id, token } = params!;
      const res = await apiClient.get(`/auth/verify-link/${id}`, {
        params: { token },
      });
      return res.data as VerifyResetResponse;
    },
  
    retry: false,
  });
};

// Reset password 
export const useResetPassword = (): UseMutationResult<
  ResetPasswordResponse,
  Error,
  ResetPasswordData
> => {
  return useMutation({
    mutationFn: async ({ id, token, password }) => {
      const res = await apiClient.post(
        `/auth/reset-password/${id}`,
        { password },                  // body
        { params: { token } }          // query ?token=...
      );
      return res.data as ResetPasswordResponse;
    },
  });
};