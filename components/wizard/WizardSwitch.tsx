import React from "react";
import { Switch } from "@headlessui/react";

interface WizardSwitchProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export function WizardSwitch({ label, checked, onChange }: WizardSwitchProps) {
    return (
        <div className="mt-2 px-1.5 w-full">
            <div className="border border-gray-300 border-solid flex items-center justify-between mt-3 px-1.5 py-1.5 rounded-lg">
                <span className="ml-2 font-medium text-[0.75rem] text-slate-700 dark:text-white/80">
                    {label}
                </span>
                <Switch
                    checked={checked}
                    onChange={onChange}
                    className={`${checked ? "bg-black" : "bg-gray-300 dark:bg-gray-700"
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
                >
                    <span
                        className={`${checked ? "translate-x-6" : "translate-x-1"
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
                    />
                </Switch>
            </div>

        </div>
    );
}
