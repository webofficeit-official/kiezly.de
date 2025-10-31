// lib/config/axios-client.ts
import axios from "axios";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    skipAuthRefresh?: boolean;
  }
}

// keep access in memory for speed
let accessToken: string | null = null;

// refresh flow
let isRefreshing = false;
let failedQueue: { resolve: (token?: string) => void; reject: (err?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

type CookieOpts = {
  remember?: boolean; // new: controls persistence
};

// If you ALSO want a cookie for access token (optional), make it conditional too.
// Otherwise keep it only in memory for better security.
export const setAccessToken = (token: string | null, opts: CookieOpts = {}) => {
  accessToken = token;
  // OPTIONAL: if you want access token available across tabs, set a session cookie.
  // Otherwise, remove this block and rely only on in-memory storage.
  if (token) {
    // for access, prefer short life (30 min) if remember, or session cookie otherwise
    const common = { secure: true, sameSite: "strict" as const, path: "/" };
    if (opts.remember) {
      setCookie("accessToken", token, { ...common, maxAge: 60 * 30 }); // 30 min
    } else {
      // session cookie (no maxAge)
      setCookie("accessToken", token, { ...common });
    }
  } else {
    deleteCookie("accessToken");
  }
};

export const setRefreshToken = (token: string | null, opts: CookieOpts = {}) => {
  const common = { secure: true, sameSite: "strict" as const, path: "/" };
  if (token) {
    if (opts.remember) {
      // 30 days persistent cookie
      setCookie("refreshToken", token, { ...common, maxAge: 60 * 60 * 24 * 30 });
    } else {
      // session cookie (expires when the browser closes)
      setCookie("refreshToken", token, { ...common });
    }
  } else {
    deleteCookie("refreshToken");
  }
};

const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// attach token to requests
apiClient.interceptors.request.use((config) => {
  if (!accessToken) {
    accessToken = (getCookie("accessToken") as string | null) || null; // optional: pick up session cookie
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
     if (originalRequest?.skipAuthRefresh) {
      return Promise.reject(error);
    }

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
        const refreshToken = (getCookie("refreshToken") as string | null) || null;
        if (!refreshToken) throw new Error("Missing refresh token");

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { token: refreshToken },
          { withCredentials: true }
        );

        const newAccess = data?.token?.access;
        if (!newAccess) throw new Error("Refresh failed");

        // IMPORTANT: we don't know the user's remember preference here.
        // Use session cookie (safer) and in-memory; the next successful login will reapply preference.
        setAccessToken(newAccess, { remember: false });
        processQueue(null, newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        setAccessToken(null);
        setRefreshToken(null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
