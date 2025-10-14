import { Eye, Bookmark, AlertTriangle, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function JobCountCard({ job }: { job: any }) {
    return (
        <>
            {/* <Card className="shadow-md p-6 bg-gray-100 rounded-xl">
                <h2 className="text-xl font-semibold mb-5">Job Counts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Views 
                    <div className="flex flex-col items-center justify-center border border-l border-neutral-200 bg-white p-5 rounded-xl shadow hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
                        <div className="p-3 bg-blue-100 rounded-full mb-2">
                            <Eye className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="text-2xl font-bold">{job.views_count}</span>
                        <span className="text-gray-500 mt-1">Views</span>
                    </div>

                    {/* Saves 
                    <div className="flex flex-col items-center justify-center border border-l border-neutral-200 bg-white p-5 rounded-xl shadow hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
                        <div className="p-3 bg-green-100 rounded-full mb-2">
                            <Bookmark className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="text-2xl font-bold">{job.saves_count}</span>
                        <span className="text-gray-500 mt-1">Saves</span>
                    </div>

                    {/* Reports 
                    <div className="flex flex-col items-center justify-center border border-l border-neutral-200 bg-white p-5 rounded-xl shadow hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
                        <div className="p-3 bg-red-100 rounded-full mb-2">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <span className="text-2xl font-bold">{job.reports_count}</span>
                        <span className="text-gray-500 mt-1">Reports</span>
                    </div>
                </div>
            </Card> */}
            <h2 className="text-xl font-semibold mb-5">Job Counts</h2>
            <div className="flex grid grid-cols-2 gap-2">
                <Card className="shadow-md bg-gray-100 rounded-xl">
                    <div className="flex flex-col items-center justify-center bg-white p-5 rounded-xl shadow hover:shadow-lg">
                        <div className="p-3 bg-blue-100 rounded-full mb-2">
                            <Eye className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="text-2xl font-bold">{job.views_count}</span>
                        <span className="text-gray-500 mt-1">Views</span>
                    </div>
                </Card>
                <Card className="shadow-md bg-gray-100 rounded-xl">
                    <div className="flex flex-col items-center justify-center bg-white p-5 rounded-xl shadow hover:shadow-lg">
                        <div className="p-3 bg-green-100 rounded-full mb-2">
                            <Bookmark className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="text-2xl font-bold">{job.saves_count}</span>
                        <span className="text-gray-500 mt-1">Saves</span>
                    </div>
                </Card>
                <Card className="shadow-md bg-gray-100 rounded-xl">
                    <div className="flex flex-col items-center justify-center bg-white p-5 rounded-xl shadow hover:shadow-lg">
                        <div className="p-3 bg-red-100 rounded-full mb-2">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <span className="text-2xl font-bold">{job.reports_count}</span>
                        <span className="text-gray-500 mt-1">Reports</span>
                    </div>
                </Card>
                <Card className="shadow-md bg-gray-100 rounded-xl">
                    <div className="flex flex-col items-center justify-center bg-white p-5 rounded-xl shadow hover:shadow-lg">
                        <div className="p-3 bg-purple-100 rounded-full mb-2">
                            <UserCheck className="h-6 w-6 text-purple-600" />
                        </div>
                        <span className="text-2xl font-bold">{job.applicants_count ?? 0}</span>
                        <span className="text-gray-500 mt-1">Applicants</span>
                    </div>
                </Card>
            </div>
        </>
    );
}
