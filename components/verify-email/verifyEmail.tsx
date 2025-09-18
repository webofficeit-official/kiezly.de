"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useVerifyEmail, VerifyEmailResponse } from "@/lib/react-query/queries/user/user-verify";


type Status = "idle" | "loading" | "success" | "error";

export default function VerifyEmailPage() {
    const router = useRouter()
    const { id } = useParams();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [statusLocal, setStatusLocal] = useState<Status>("idle");
    const [message, setMessage] = useState("");

    // Use the query hook
    const { data, error, isLoading } = useVerifyEmail(Array.isArray(id) ? id[0] : id, token);

    // Handle status changes
    useEffect(() => {
        if (isLoading) {
            setStatusLocal("loading");
            setMessage("Verifying your email...");
        } else if (error) {
            setStatusLocal("error");
            setMessage("Verification Failed.");
        } else if (data?.success) {
            setStatusLocal("success");
            setMessage(data.message || "Email verified successfully!");

            // Redirect after 2 seconds
            const timer = setTimeout(() => {
                router.push("/signin");
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [data, error, isLoading]);

    return (
        <div className="flex flex-1 h-[calc(100vh-9rem)] items-center justify-center bg-gradient-to-b from-neutral-50 to-white px-4">
            <Card className="w-full max-w-md text-center shadow-sm rounded-2xl mb-2">
                <CardHeader>
                    <CardTitle>Email Verification</CardTitle>
                </CardHeader>
                <CardContent className="min-h-[200px] flex flex-col items-center justify-center gap-3">
                    {/* Placeholder for loading */}
                    {statusLocal === "idle" || statusLocal === "loading" ? (
                        <p className="text-gray-700 font-medium">{message || "Verifying your email..."}</p>
                    ) : null}

                    {/* Success */}
                    {statusLocal === "success" && (
                        <div className="flex flex-col items-center gap-3">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                            <h2 className="text-green-700 font-medium">{message}</h2>
                            <p>Redirecting to login...</p>
                        </div>
                    )}

                    {/* Error */}
                    {statusLocal === "error" && (
                        <div className="flex flex-col items-center gap-3">
                            <AlertCircle className="h-12 w-12 text-red-500" />
                            <h2 className="text-red-700 font-medium">{message}</h2>
                            <p className="text-red-600 text-sm text-center">
                                There was an issue verifying your email. Please try again or check your verification link.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
