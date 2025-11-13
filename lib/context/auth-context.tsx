"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useLogin } from "@/lib/react-query/queries/user/account";
import apiClient, {
  setAccessToken,
  setRefreshToken,
} from "@/lib/config/axios-client";
import { LoginResponse } from "@/lib/react-query/queries/user/account";
import { useRouter, usePathname } from "next/navigation";
import { getCookie } from "cookies-next";
import { UserProfile } from "@/components/MyProfile";
import { Loader } from "@/components/ui/loader";
import toast from "react-hot-toast";
import { useSyncFavoritesOnLogin } from "../utils/saved-job-helper";
import { useLocalizedRouter } from "../useLocalizedRouter";
import socket from "../socket";

type AuthContextType = {
  user: UserProfile;
  login: (
    email: string,
    password: string,
    opts?: {
      remember?: boolean; // NEW
      onSuccess?: () => void;
      onError?: (err: any) => void;
    }
  ) => void;
  logout: () => Promise<void>;
  loading: boolean;
  loadUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { push, replace } = useLocalizedRouter();
  const pathname = usePathname();
  const loginMutation = useLogin();
  useSyncFavoritesOnLogin(user);

  // Restore user on refresh
  useEffect(() => {
    const refreshToken = getCookie("refreshToken");
    if (!refreshToken) {
      setUser(null);
      localStorage.setItem("kUId", null);
      setLoading(false);
      return;
    }

    loadUser();
  }, []);

  async function loadUser() {
    try {
      const res = await apiClient.get("/profile/me");
      setUser(res?.data?.user);
      localStorage.setItem("kUId", res?.data?.user?.id || "");
      socket.auth = { userId: res?.data?.user?.id };
      socket.connect();
    } catch {
      setUser(null);
      localStorage.setItem("kUId", null);
    } finally {
      setLoading(false);
    }
  }

  const normalizePath = (p?: string) => {
  if (!p) return "/";
  const trimmed = p.replace(/\/+$/, ""); // remove trailing slash
  const parts = trimmed.split("/").filter(Boolean); // ["en","signin"] or ["signin"]
  const locales = ["en", "de", "fr", "es"]; // adjust to your locales
  const startIndex = parts.length && locales.includes(parts[0]) ? 1 : 0;
  const base = parts.length > startIndex ? `/${parts[startIndex]}` : "/";
  return base;
};

  useEffect(() => {
    if (loading) return;

    const publicPaths = ["/signin", "/signup"];
      const base = normalizePath(pathname);

  const isPublic = publicPaths.includes(base);

    if (user && isPublic) {
      // logged in but trying to access signin/signup
      replace("/jobs");
    }
  }, [user, loading, pathname, router]);

  // Wrap mutation inside context login
 function login(
    email: string,
    password: string,
    opts?: {
      remember?: boolean; // NEW
      onSuccess?: () => void;
      onError?: (err: any) => void;
    }
  ) {
    const remember = !!opts?.remember;
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data: LoginResponse) => {
          if (data?.token?.access) setAccessToken(data.token.access, { remember });
          if (data?.token?.refresh) setRefreshToken(data.token.refresh, { remember });

          loadUser();
          opts?.onSuccess?.();
        },
        onError: (err) => {
          opts?.onError?.(err);
        },
      }
    );
  }
  async function logout() {
    const toastId = toast.loading("Logging out...");
    try {
      await apiClient.post("/auth/logout");
      toast.success("Logged out successfully!", { id: toastId });
    } catch (err) {
      console.error("Server logout failed:", err);
      toast.error("Logout failed. Please try again.", { id: toastId });
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      localStorage.setItem("kUId", null);
      push("/signin");
    }
  }

  // if (loading && getCookie("refreshToken")) {
  //     return (
  //         <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
  //             <Loader />
  //         </div>
  //     );
  // }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}
