import { useMutation, UseMutationResult } from "@tanstack/react-query";
import apiClient from "@/lib/config/axios-client";

export interface SignupData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role:string
}

interface SignupResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  token: string;
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
      apiClient.post("/auth/login", data).then(res => res.data),
  });
};