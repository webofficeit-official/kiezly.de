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

type AuthContextType = {
    user: UserProfile;
    login: (email: string, password: string, opts?: { onSuccess?: () => void; onError?: (err: any) => void }) => void;
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
    const pathname = usePathname();
    const loginMutation = useLogin();


    // Restore user on refresh
    useEffect(() => {
        const refreshToken = getCookie("refreshToken");
        if (!refreshToken) {
            setUser(null);
            setLoading(false);
            return;
        }

        loadUser();
    }, []);

    async function loadUser() {
        try {
            const res = await apiClient.get("/profile/me");
            setUser(res?.data?.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (loading) return;

        const publicPaths = ["/signin", "/signup"];
        const isPublic = publicPaths.includes(pathname);

        if (user && isPublic) {
            // logged in but trying to access signin/signup
            router.replace("/my-profile");
        }


    }, [user, loading, pathname, router]);


    // Wrap mutation inside context login
    function login(
        email: string,
        password: string,
        opts?: { onSuccess?: () => void; onError?: (err: any) => void }
    ) {
        loginMutation.mutate(
            { email, password },
            {
                onSuccess: (data: LoginResponse) => {
                    if (data?.token?.access) setAccessToken(data.token.access);
                    if (data?.token?.refresh) setRefreshToken(data.token.refresh);

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
        try {
            await apiClient.post("/auth/logout");

        } catch (err) {
            console.error("Server logout failed:", err);
        } finally {
            setAccessToken(null);
            setRefreshToken(null);
            setUser(null);
            router.push('/signin')
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, loadUser }}>
            {loading ? (
                <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
                    {/* Simple Tailwind spinner */}
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}
