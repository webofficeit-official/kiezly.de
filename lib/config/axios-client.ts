import axios from "axios";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

// keep access in memory for speed
let accessToken: string | null = null;

// refresh flow
let isRefreshing = false;
let failedQueue: { resolve: (token?: string) => void; reject: (err?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    setCookie("accessToken", token, { maxAge: 60 * 30 }); // 30 min
  } else {
    deleteCookie("accessToken");
  }
};

export const setRefreshToken = (token: string | null) => {
  if (token) {
    setCookie("refreshToken", token, { maxAge: 60 * 60 * 24 * 30 }); // 30 days
  } else {
    deleteCookie("refreshToken");
  }
};

const apiClient = axios.create({
  baseURL: baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// attach token to requests
apiClient.interceptors.request.use((config) => {
  if (!accessToken) {
    accessToken = getCookie("accessToken") as string | null;
  }
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// handle 401 with refresh flow
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getCookie("refreshToken") as string | null;
        if (!refreshToken) throw new Error("Missing refresh token");

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { token: refreshToken },
          { withCredentials: true }
        );

        const newAccess = data?.token?.access;
        if (!newAccess) throw new Error("Refresh failed");

        setAccessToken(newAccess);
        processQueue(null, newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        setAccessToken(null);
        setRefreshToken(null);
        if (!originalRequest.url?.includes("/verify-email")) {
          if (typeof window !== "undefined") {
            // window.location.href = "/signin";
          }
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
