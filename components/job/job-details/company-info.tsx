import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export default function CompanyInfoCard({ job }: { job: any }) {
    const companyName = job.company || "the company";
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-base">About {companyName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
                <a href="#" className="inline-flex items-center gap-2 text-sm font-medium hover:underline">
                    View similar babysitting jobs <ExternalLink className="h-4 w-4" />
                </a>
            </CardContent>
        </Card>
    );
}
