"use client";

import { Loader } from "@/components/ui/loader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApplicantDetails } from "@/lib/react-query/queries/apply-job";
import UserProfile from "../job/job-details/user-profile";

interface ApplicantDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
}

export default function ApplicantDetailModal({ isOpen, onClose, userId }: ApplicantDetailModalProps) {
    const { data: user, isLoading } = useApplicantDetails(userId);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="
    max-w-xl w-full rounded-2xl p-2 sm:p-2
    overflow-y-auto max-h-[90vh]
    fixed top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/3
  "
            >

                <DialogHeader >
                    <DialogTitle>
                        Applicant Details
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader />
                    </div>
                ) : user ? (
                    <div className="space-y-4">
                        <UserProfile user={user} />
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">User not found.</p>
                )}
            </DialogContent>
        </Dialog>
    );
}
