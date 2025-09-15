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
