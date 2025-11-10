"use client";


import { useAuth } from "@/lib/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [allowed, setAllowed] = useState(false);


    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace("/signin");
            return;
        }

        // simple role rules
        const roleRules: Record<string, string[]> = {
            "/client": ["client"],
            "/my-profile": ["client", "helper"],
            "/change-password": ["client", "helper"],
            "/helper": ["helper"],
            "/post-job": ['client'],
            "/applied-job": ['helper'],
            "/saved-job": ['helper']
        };

        const rule = Object.entries(roleRules).find(([route]) =>
            pathname.startsWith(route)
        );


        if (rule && !rule[1].includes(user.role)) {
            router.replace("/unauthorized");
            return;
        }

        setAllowed(true);
    }, [user, loading, pathname, router]);

    if (loading || !allowed) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return <>{children}</>;
}
