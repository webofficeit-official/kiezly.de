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
    // reset allowed while resolving
    setAllowed(false);

    if (loading) return;

    // Not logged in -> send to signin
    if (!user) {
      router.replace("/signin"); 
      return;
    }

    // simple role rules (base paths)
    const roleRules: Record<string, string[]> = {
      "/client": ["client"],
      "/my-profile": ["client", "helper"],
      "/my-inbox": ["client", "helper"],
      "/change-password": ["client", "helper"],
      "/helper": ["helper"],
      "/post-job": ["client"],
      "/applied-job": ["helper"],
      "/saved-job": ["helper"],
    };

    const normalizedPath = (() => {
      if (!pathname) return pathname;
      const p = pathname.replace(/\/+$/, "");
      const parts = p.split("/").filter(Boolean); 
      const locales = ["en", "de", "fr", "es"];
      const startIndex = parts.length && locales.includes(parts[0]) ? 1 : 0;
      const base = parts.length > startIndex ? `/${parts[startIndex]}` : "/";
      return base;
    })();

    // find rule for the base path
    const rule = Object.entries(roleRules).find(([route]) => route === normalizedPath);

    // If there is a rule and the user's role is NOT allowed -> redirect
    if (rule && !rule[1].includes(user.role)) {
      router.replace("/unauthorized");
      return;
    }

    // otherwise allowed
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
