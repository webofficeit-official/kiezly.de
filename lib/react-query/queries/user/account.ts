import { useMutation, UseMutationResult } from "@tanstack/react-query";
import apiClient, { setAccessToken, setRefreshToken } from "@/lib/config/axios-client";

export interface SignupData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
  city: string;
  zip: string;
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
    jobCategories: [];
  };
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