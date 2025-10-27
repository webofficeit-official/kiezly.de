import { Eye, Bookmark, AlertTriangle, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useT } from "@/app/[locale]/layout";

export default function JobCountCard({ job }: { job: any }) {
    const t = useT("jobs");

    return (
        <>
            <h2 className="text-xl font-semibold mb-5">{t("count.title")}</h2>
            <div className="flex grid grid-cols-2 gap-2">
                <Card className="shadow-md bg-gray-100 rounded-xl">
                    <div className="flex flex-col items-center justify-center bg-white p-5 rounded-xl shadow hover:shadow-lg">
                        <div className="p-3 bg-blue-100 rounded-full mb-2">
                            <Eye className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="text-2xl font-bold">{job.views_count}</span>
                        <span className="text-gray-500 mt-1">{t("count.items.views")}</span>
                    </div>
                </Card>
                <Card className="shadow-md bg-gray-100 rounded-xl">
                    <div className="flex flex-col items-center justify-center bg-white p-5 rounded-xl shadow hover:shadow-lg">
                        <div className="p-3 bg-green-100 rounded-full mb-2">
                            <Bookmark className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="text-2xl font-bold">{job.saves_count}</span>
                        <span className="text-gray-500 mt-1">{t("count.items.saves")}</span>
                    </div>
                </Card>
                <Card className="shadow-md bg-gray-100 rounded-xl">
                    <div className="flex flex-col items-center justify-center bg-white p-5 rounded-xl shadow hover:shadow-lg">
                        <div className="p-3 bg-red-100 rounded-full mb-2">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <span className="text-2xl font-bold">{job.reports_count}</span>
                        <span className="text-gray-500 mt-1">{t("count.items.reports")}</span>
                    </div>
                </Card>
                <Card className="shadow-md bg-gray-100 rounded-xl">
                    <div className="flex flex-col items-center justify-center bg-white p-5 rounded-xl shadow hover:shadow-lg">
                        <div className="p-3 bg-purple-100 rounded-full mb-2">
                            <UserCheck className="h-6 w-6 text-purple-600" />
                        </div>
                        <span className="text-2xl font-bold">{job.applicants_count ?? 0}</span>
                        <span className="text-gray-500 mt-1">{t("count.items.applicants")}</span>
                    </div>
                </Card>
            </div>
        </>
    );
}
