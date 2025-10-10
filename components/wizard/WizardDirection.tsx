import React from "react";

interface WizardDirectionProps {
    prev?: boolean;
    next?: boolean;
}

export function WizardDirection({ prev, next }: WizardDirectionProps) {
    return (
        <div className="flex mt-6">
            {
                prev && (
                    <a type="button" aria-controls="account" next-form-btn="" href="javascript:;" className="border border-gray-900 cursor-pointer font-bold hover:scale-[1.02] mb-0 px-6 py-3 rounded-lg text-[.75rem] to-[#3a416f] tracking-tight uppercase">Prev</a>
                )
            }
            {
                next && (
                    <a type="button" aria-controls="account" next-form-btn="" href="javascript:;" className="active:opacity-[.85] align-middle bg-150 bg-black bg-x-25 border-0 cursor-pointer dark:bg-gradient-to-tl dark:from-slate-850 dark:to-gray-850 ease-in font-bold from-[#141727] hover:scale-[1.02] hover:shadow-xs inline-block leading-pro mb-0 ml-auto px-6 py-3 rounded-lg shadow-md text-[.75rem] text-right text-white to-[#3a416f] tracking-tight transition-all uppercase">Next</a>
                )
            }
        </div>
    );
}
