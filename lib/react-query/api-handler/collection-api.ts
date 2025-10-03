import apiClient from "@/lib/config/axios-client";

export const getZipcodesApi = async (params: { zip?: string; country?: string; limit?: number } = {}) => {
    const { zip = "", country = "", limit = 5 } = params;

    const response = await apiClient.post("/collection/zipcode", {
        zip,
        country,
        limit,
    });

    return response.data;
};



export const getCollectionApi = async <T = any>(type: string): Promise<T[]> => {
  const response = await apiClient.get("/collection");
  return response.data.data[type]; // type-safe access
};

