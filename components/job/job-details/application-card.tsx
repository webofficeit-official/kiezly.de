import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApplicationModel from "./application-model";
import { useState } from "react";
import AlertBox from "@/components/shared-ui/delete-alert-box/delet-alert-box";
import { useWithdrawApplication } from "@/lib/react-query/queries/apply-job";
import toast from "react-hot-toast";

export default function ApplicationCard({ title, description, buttonLabel, application, jobDetails, applied = false, withdraw = false, coverNote = "", proposedRate = "" }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
      const withdrawMutation = useWithdrawApplication();

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-base flex justify-between">
                    <span>{title}</span>
                    <button className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium transition-colors rounded-full bg-gray-50 text-gray-600 border border-gray-200">{application?.data?.application?.status}</button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                <div className="space-y-2">
                    {description && <p className="text-xs text-muted-foreground">
                        {description}
                    </p>}

                    {coverNote && <p className="text-gray-700 text-sm leading-relaxed">Cover Note: <br />
                        <div
                            className="text-gray-700 text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: coverNote || "" }}
                        />
                    </p>}
                    {proposedRate && <p className="text-gray-700 text-sm leading-relaxed">Proposed Rate: <span className="font-semibold">{proposedRate} {jobDetails?.currency}</span></p>}
                    <div className="flex gap-3">
                        {
                            !withdraw &&
                            <Button onClick={() => setIsModalOpen(true)} className="w-full rounded-xl">
                                {buttonLabel}
                            </Button>
                        }
                        {
                            applied &&
                            <AlertBox
                                trigger={<Button variant="destructive" className="w-full rounded-xl">Withdraw</Button>}
                                title="Withdraw Application?"
                                description={`Are you sure you want to withdraw your application for "${jobDetails?.title}"?`}
                                confirmText="Yes, Withdraw"
                                cancelText="Cancel"
                                onConfirm={() =>
                                    withdrawMutation.mutate(application.data.application.id, {
                                        onSuccess: () => toast.success("Application withdrawn successfully!"),
                                        onError: (err: any) => toast.error(err?.message || "Failed to withdraw."),
                                    })
                                }
                            />
                        }
                    </div>
                    <ApplicationModel
                        isModalOpen={isModalOpen}
                        setIsModalOpen={setIsModalOpen}
                        header={withdraw ? "Update application" : title}
                        application={application}
                        jobDetails={jobDetails}
                        buttonLabel={withdraw ? "Update" : "Apply"}
                    />
                </div>
            </CardContent>
        </Card>
    )
}