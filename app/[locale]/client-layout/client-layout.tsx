"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { AuthProvider } from "@/lib/context/auth-context";
import NextTopLoader from "nextjs-toploader";
import NavigationProgress from "@/app/NavigationProgress";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function ClientLayout({ children }: { children: ReactNode }) {  

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NextTopLoader color="#3f4040ff" showSpinner={false} />
         <NavigationProgress/>
        <Header />
        {children}
        <Footer />
      </AuthProvider>
    </QueryClientProvider>);
}
