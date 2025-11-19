import { SelectWithFilter } from "@/components/input/select";
import { Select } from "@/components/shared-ui/custom-select/custom-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WizardRichText } from "@/components/wizard/WizardRichText";
import { useReportJob } from "@/lib/react-query/queries/report-job";
import { Ban, X } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";

interface ReportJobProps {
    jobId: string;
    t: (key: string) => string;
}

interface FormErrors {
    reason?: string;
    description?: string;
}

export default function ReportJob({ jobId, t }: ReportJobProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [reason, setReason] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const useReport = useReportJob();

    // Define options with proper typing
    const OPTIONS = [
        'spam-promotional',
        'fake-scam',
        'asking-money',
        'misleading-information',
        'offensive-content',
        'illegal-activity',
        'discrimination',
        'duplicate',
        'expired',
        'low-quality',
        'other',
    ] as const;

    const REASONS = OPTIONS.map(o => ({
        id: o,
        name: t(`detail.report.reason.options.${o}`)
    }));

    // Validation functions
    const validateReason = useCallback((value: string): string | undefined => {
        return value.trim() ? undefined : t("detail.report.reason.error");
    }, [t]);

    const validateDescription = useCallback((value: string): string | undefined => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return t("detail.report.description.error");
        if (trimmedValue.length <= 8) return t("detail.report.description.error");
        return undefined;
    }, [t]);

    // Validate entire form
    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {
            reason: validateReason(reason),
            description: validateDescription(description),
        };

        setErrors(newErrors);
        return !newErrors.reason && !newErrors.description;
    }, [reason, description, validateReason, validateDescription]);

    // Handle form submission
    const handleSubmit = async () => {
        setIsSubmitting(true);

        if (!validateForm()) {
            setIsSubmitting(false);
            return;
        }

        try {
            // Here you would typically make an API call to submit the report
            console.log('Submitting report:', { jobId, reason, description });

            useReport.mutate({
                jobId,
                reason,
                description
            }, {
                onSuccess: (d) => {
                    toast.success(t("detail.report.message.success"));
                },
                onError: (e) => {
                    toast.success(t("detail.report.message.success"));
                    console.error('Failed to submit report:', e);
                }
            })

            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            toast.error(t("detail.report.message.error"));
            console.error('Failed to submit report:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form when modal closes
    const resetForm = () => {
        setDescription('');
        setReason('');
        setErrors({});
    };

    // Close modal handler
    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    // Update individual field validation
    const handleReasonChange = (value: string) => {
        setReason(value);
        setErrors(prev => ({
            ...prev,
            reason: validateReason(value)
        }));
    };

    const handleDescriptionChange = (value: string) => {
        setDescription(value);
        setErrors(prev => ({
            ...prev,
            description: validateDescription(value)
        }));
    };

    // Close modal on Escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isModalOpen) {
                handleCloseModal();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isModalOpen]);

    return (
        <>
            <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setIsModalOpen(true)}
            >
                <Ban className="mr-2 h-4 w-4" />
                {t("detail.header.report")}
            </Button>

            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 overflow-y-auto"
                    aria-labelledby="modal-title"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Backdrop overlay */}
                        <div
                            className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                            aria-hidden="true"
                            onClick={handleCloseModal}
                        />

                        {/* This element is to trick the browser into centering the modal contents. */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                            &#8203;
                        </span>

                        {/* Modal Panel */}
                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            {/* Header */}
                            <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                                    {t("detail.report.title")}
                                </h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                    aria-label={t("detail.report.close")}
                                >
                                    <X className="h-6 w-6 text-gray-500" />
                                </button>
                            </div>

                            {/* Body/Content */}
                            <div className="py-2 space-y-4 overflow-auto px-6 mt-3 mb-4 max-h-[500px]">
                                <p className="text-sm text-gray-600">{t("detail.report.subtitle")}</p>

                                <div className="space-y-4">
                                    <div>
                                        <SelectWithFilter
                                            label={t("detail.report.reason.label")}
                                            value={reason}
                                            onChange={handleReasonChange}
                                            options={REASONS}
                                            labelClass=""
                                        />
                                        {errors.reason && (
                                            <p className="font-normal text-sm py-1 text-red-700">
                                                {errors.reason}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <WizardRichText
                                            label={t("detail.report.description.label")}
                                            value={description}
                                            onChange={handleDescriptionChange}
                                            labelClass=""
                                            placeholder={t("detail.report.description.placeholder") || "Please provide more details..."}
                                        />
                                        {errors.description && (
                                            <p className="font-normal text-sm py-1 text-red-700">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer/Actions */}
                            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="rounded-xl min-w-20"
                                >
                                    {isSubmitting ? t("detail.report.submitting") : t("detail.report.submit")}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl"
                                    onClick={handleCloseModal}
                                    disabled={isSubmitting}
                                >
                                    {t("detail.report.close")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}