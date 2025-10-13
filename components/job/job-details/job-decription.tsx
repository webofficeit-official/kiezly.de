import { RichList } from "@/components/ui/rich-list";
import React from "react";

export default function JobDescription({ job }: { job: any }) {
    const { description, requirements, tasks } = job;
    return (
        <div className="space-y-1">
            {/* About the role */}
            <section>
                <h3 className="text-md font-medium text-gray-800 mb-1">
                    About the Role
                </h3>
                <div
                    className="text-gray-700 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: description || "" }}
                />
            </section>

            {/* Requirements */}
            {requirements && requirements.trim() !== "" && (
                <section>
                    <h3 className="text-md font-medium text-gray-800 mb-1 mt-4">
                        Requirements
                    </h3>
                    <div className="text-gray-700 text-sm leading-relaxed">
                        <RichList html={requirements} />
                    </div>
                </section>
            )}

            {/* Tasks */}
            {tasks && tasks.trim() !== "" && (
                <section>
                    <h3 className="text-md font-medium text-gray-800 mb-1 mt-5">
                        Tasks
                    </h3>
                    <div className="text-gray-700 text-sm leading-relaxed">
                        <RichList html={tasks} />
                    </div>
                </section>
            )}
        </div>
    );


}
