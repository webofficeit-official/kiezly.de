import { useT } from "@/app/[locale]/layout";
import { RichList } from "@/components/ui/rich-list";
import React from "react";

export default function JobDescription({ job }: { job: any }) {
    const { description, requirements, tasks } = job;

    const t = useT("jobs");
    return (
        <div className="space-y-6">
            {/* About the role */}
            <section>
                <h3 className="font-display font-semibold text-[#111110] text-[15px] mb-3">
                    {t("detail.description.about-the-role")}
                </h3>
                <div
                    className="text-[14px] leading-relaxed prose prose-sm max-w-none"
                    style={{ color: "rgba(17,17,16,.7)" }}
                    dangerouslySetInnerHTML={{ __html: description || "" }}
                />
            </section>

            {/* Requirements */}
            {requirements && requirements.trim() !== "" && (
                <section>
                    <h3 className="font-display font-semibold text-[#111110] text-[15px] mb-3">
                        {t("detail.description.requirement")}
                    </h3>
                    <div className="text-[14px] leading-relaxed" style={{ color: "rgba(17,17,16,.7)" }}>
                        <RichList html={requirements} />
                    </div>
                </section>
            )}

            {/* Tasks */}
            {tasks && tasks.trim() !== "" && (
                <section>
                    <h3 className="font-display font-semibold text-[#111110] text-[15px] mb-3">
                        {t("detail.description.tasks")}
                    </h3>
                    <div className="text-[14px] leading-relaxed" style={{ color: "rgba(17,17,16,.7)" }}>
                        <RichList html={tasks} />
                    </div>
                </section>
            )}
        </div>
    );


}
