import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex justify-between">
          <span>{title}</span>
          {application?.data?.application?.status && (
            <button className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium transition-colors rounded-full bg-gray-50 text-gray-600 border border-gray-200">
              {application?.data?.application?.status}
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="space-y-2">
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}

          {coverNote && (
            <div className="text-gray-700 text-sm leading-relaxed">
              {t("apply-panel.card.cover-note")} <br />
              <div
                className="text-gray-700 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: coverNote || "" }}
              />
            </div>
          )}
          {proposedRate && (
            <p className="text-gray-700 text-sm leading-relaxed">
              {t("apply-panel.card.proposed-rate")}{" "}
              <span className="font-semibold">
                {proposedRate} {jobDetails?.currency}
              </span>
            </p>
          )}
          {status !== "shortlisted" && status !== "accepted" && (
            <div className="flex gap-3">
              {!withdraw && (
                <Button
                  onClick={() =>
                    logged ? setIsModalOpen(true) : push("/signup")
                  }
                  className="w-full rounded-xl"
                >
                  {buttonLabel}
                </Button>
              )}
              {applied && (
                <AlertBox
                  trigger={
                    <Button variant="destructive" className="w-full rounded-xl">
                      {t("apply-panel.card.withdraw.trigger")}
                    </Button>
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
      </CardContent>
    </Card>
  );
}
