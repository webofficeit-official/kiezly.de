import ApplicationModel from "./application-model";
import { useState } from "react";
import AlertBox from "@/components/shared-ui/delete-alert-box/delet-alert-box";
import { useWithdrawApplication } from "@/lib/react-query/queries/apply-job";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useT } from "@/app/[locale]/layout";

export default function ApplicationCard({
  title,
  description,
  buttonLabel,
  application,
  jobDetails,
  applied = false,
  withdraw = false,
  coverNote = "",
  proposedRate = "",
  logged = true,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const withdrawMutation = useWithdrawApplication();
  const router = useRouter();
  const { push } = useLocalizedRouter();
  const status = application?.data?.application?.status;
  const t = useT("application");

  return (
    <div className="rounded-2xl bg-white border border-[#efefec] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#efefec] flex items-center justify-between gap-3">
        <h3 className="font-display font-semibold text-[#111110] text-[15px]">{title}</h3>
        {application?.data?.application?.status && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(232,98,42,.1)] px-2.5 py-0.5 text-[11px] font-semibold text-kz-accent capitalize">
            {application?.data?.application?.status}
          </span>
        )}
      </div>
      <div className="px-5 py-4 space-y-3">
        {description && (
          <p className="text-[13px]" style={{ color: "rgba(17,17,16,.5)" }}>{description}</p>
        )}
        {coverNote && (
          <div>
            <p className="text-[12px] font-medium text-[#374151] mb-1">{t("apply-panel.card.cover-note")}</p>
            <div
              className="text-[13px] leading-relaxed"
              style={{ color: "rgba(17,17,16,.7)" }}
              dangerouslySetInnerHTML={{ __html: coverNote || "" }}
            />
          </div>
        )}
        {proposedRate && (
          <p className="text-[13px]" style={{ color: "rgba(17,17,16,.7)" }}>
            {t("apply-panel.card.proposed-rate")}{" "}
            <span className="font-semibold text-[#111110]">
              {proposedRate} {jobDetails?.currency}
            </span>
          </p>
        )}
        {status !== "shortlisted" && status !== "accepted" && (
          <div className="flex gap-2 pt-1">
            {!withdraw && (
              <button
                onClick={() => logged ? setIsModalOpen(true) : push("/signup")}
                className="flex-1 h-[42px] rounded-lg bg-kz-accent text-white font-semibold text-[13px] tracking-wide transition-all hover:bg-[#d4561f] active:scale-[.99]"
              >
                {buttonLabel}
              </button>
            )}
            {applied && (
              <AlertBox
                trigger={
                  <button className="flex-1 h-[42px] rounded-lg border border-red-300 bg-red-50 text-red-600 font-semibold text-[13px] hover:bg-red-100 transition-all">
                    {t("apply-panel.card.withdraw.trigger")}
                  </button>
                }
                title={t("apply-panel.card.withdraw.title")}
                description={t("apply-panel.card.withdraw.description", {
                  title: jobDetails?.title,
                })}
                confirmText={t("apply-panel.card.withdraw.confirm")}
                cancelText={t("apply-panel.card.withdraw.cancel")}
                onConfirm={() =>
                  withdrawMutation.mutate(application.data.application.id, {
                    onSuccess: () =>
                      toast.success(t("apply-panel.card.withdraw.success")),
                    onError: (err: any) =>
                      toast.error(
                        err?.message || t("apply-panel.card.withdraw.failed"),
                      ),
                  })
                }
              />
            )}
          </div>
        )}

        <ApplicationModel
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          header={applied ? t("apply-panel.card.model.header") : title}
          application={application}
          jobDetails={jobDetails}
          buttonLabel={
            applied
              ? t("apply-panel.card.model.button.update")
              : t("apply-panel.card.model.button.apply")
          }
          update={applied ? true : false}
        />
      </div>
    </div>
  );
}
