import React from "react";

interface WizardNavigationProps {
    title: string,
    description: string,
    count: number,
    current: boolean | false;
    finished: boolean | false;
}

export function WizardNavigation({ title, description, count, current, finished }: WizardNavigationProps) {
    return (
        <div className="flex flex-col items-center lg:flex-row lg:items-start lg:gap-3 text-center lg:text-left">
            {/* Step circle */}
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 mb-2 lg:mb-0">
                <span className={`flex items-center justify-center rounded-full border w-8 h-8 
                    ${finished ? 'bg-black text-white border-black' : ''}  
                    ${current ? 'bg-gray-400 border-gray-400 text-white' : 'border-black'}`}>
                    {count}
                </span>
            </div>

            {/* Title & description */}
            <div className="flex flex-col leading-tight">
                <span className="font-bold text-gray-900 text-sm">{title}</span>
                <span className="hidden lg:flex text-xs text-gray-600">{description}</span>
            </div>
        </div>
    );
}
