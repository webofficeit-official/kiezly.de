import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useRouter } from "next/navigation";
import React from "react";

interface WizardDirectionProps {
    prev?: boolean;
    next?: boolean;
    save?: boolean;
    prevLink?: string;
    nextLink?: string;
    onNext?: () => void | Promise<void>;
    onPrev?: () => void | Promise<void>;
    onSave?: () => void | Promise<void>;
    isNextLoading?: boolean;
    isSaveLoading?: boolean;
    disableNext?: boolean;
    disableSave?: boolean;
    mode?: "create" | "edit";
}

export function WizardDirection({
    prev,
    next,
    save,
    prevLink,
    nextLink,
    onNext,
    onPrev,
    onSave,
    isNextLoading = false,
    isSaveLoading = false,
    disableNext = false,
    disableSave = false,
    mode = "create",
}: WizardDirectionProps) {
    const router = useRouter();
    const { push } = useLocalizedRouter();
    const handlePrev = async () => {
        if (onPrev) {
            await onPrev();
        }
        if (prevLink) push(prevLink);
    };

    const handleNext = async () => {
        if (onNext) {
            await onNext();
            return; // assume navigation handled inside callback
        }
        if (nextLink) push(nextLink);
    };

    const handleSave = async () => {
        if (onSave) {
            await onSave();
        }
    };

    return (
        <div className="flex mt-6">
            {
                prev && (
                    <button onClick={handlePrev} type="button" aria-controls="account" className="border border-gray-900 cursor-pointer font-bold hover:scale-[1.02] mb-0 px-6 py-3 rounded-lg text-[.75rem] to-[#3a416f] tracking-tight uppercase">Prev</button>
                )
            }
            {
                next && (
                    <button onClick={handleNext} disabled={disableNext || isNextLoading} type="button" aria-controls="account" className={`active:opacity-[.85] align-middle bg-150 bg-black bg-x-25 border-0 cursor-pointer dark:bg-gradient-to-tl dark:from-slate-850 dark:to-gray-850 ease-in font-bold from-[#141727] hover:scale-[1.02] hover:shadow-xs inline-block leading-pro mb-0 ml-auto px-6 py-3 rounded-lg shadow-md text-[.75rem] text-right text-white to-[#3a416f] tracking-tight transition-all uppercase  ${disableNext ? "opacity-50 cursor-not-allowed" : ""}`}>
                        {isNextLoading ? "Loading..." : "Next"}
                    </button>
                )
            }

            {/* Save / Create Button */}
            {save && (
                <button
                    onClick={handleSave}
                    disabled={disableSave || isSaveLoading}
                    type="button"
                    aria-controls="wizard"
                    className={`active:opacity-[.85] align-middle bg-150 bg-black bg-x-25 border-0 cursor-pointer dark:bg-gradient-to-tl dark:from-slate-850 dark:to-gray-850 ease-in font-bold from-[#141727] hover:scale-[1.02] hover:shadow-xs inline-block leading-pro mb-0 ml-auto px-6 py-3 rounded-lg shadow-md text-[.75rem] text-right text-white to-[#3a416f] tracking-tight transition-all uppercase ${disableSave ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    {isSaveLoading
                        ? "Saving..."
                        : mode === "edit"
                            ? "Save Changes"
                            : "Create Job"}
                </button>
            )}
        </div>
    );
}
