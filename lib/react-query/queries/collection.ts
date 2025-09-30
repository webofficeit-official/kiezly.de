
import {keepPreviousData, useMutation, UseMutationResult, useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { getCollectionApi, getZipcodesApi } from "../api-handler/collection-api";
import { LocationSearch, zipResponse } from "@/lib/types/zip-type";
import apiClient from "@/lib/config/axios-client";




export const useZipcodes = (): UseMutationResult<
  zipResponse,
  Error
> => {
  return useMutation({
    mutationFn: (data: LocationSearch) =>
      apiClient.post("/collection/zipcode", {
        zip: data.zip,
        country: data.country,
        // limit: 5
      }).then(res => res.data),
  });
};

export const useCollection = <T = any>(
  type: string,
  options?: Omit<UseQueryOptions<T[]>, "queryKey" | "queryFn">
): UseQueryResult<T[]> => {
  return useQuery<T[]>({
    queryKey: ["collection", type],
    queryFn: () => getCollectionApi<T>(type),
    keepPreviousData: true,
    ...options,
  } as UseQueryOptions<T[]>); // <- cast here to satisfy TS
};