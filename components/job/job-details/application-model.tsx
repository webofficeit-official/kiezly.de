import { Textarea } from "@/components/shared-ui/custom-text-area/custom-text-area";
import AlertBox from "@/components/shared-ui/delete-alert-box/delet-alert-box";
import Input from "@/components/shared-ui/input/input";
import { Button } from "@/components/ui/button";
import {
  useApplyJob,
  useUpdateApplicantStatus,
  useUpdateApplication,
  useWithdrawApplication,
} from "@/lib/react-query/queries/apply-job";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useT } from "@/app/[locale]/layout";
import { WizardRichText } from "@/components/wizard/WizardRichText";

export default function ApplicationModel({
  isModalOpen,
  setIsModalOpen,
  header,
  application,
  jobDetails,
  buttonLabel,
  update = false,
}) {
  const [coverNote, setCoverNote] = useState(
    application?.data?.application?.cover_note
  );
  const [proposedRate, setProposedRate] = useState(
    application?.data?.application?.proposed_rate
  );
  const applyJobMutation = useApplyJob();
  const updateJobMutation = useUpdateApplication();
  const withdrawMutation = useWithdrawApplication();

  const t = useT("application");

  useEffect(() => {
    setCoverNote(application?.data?.application?.cover_note);
    setProposedRate(application?.data?.application?.proposed_rate);
  }, [application]);

  const handleApplySubmit = () => {
    if (update) {
      updateJobMutation.mutate(
        {
          applicationId: application?.data?.application?.id,
          cover_note: coverNote,
          proposed_rate: proposedRate,
          status: application?.data?.application?.status,
        },
        {
          onSuccess: () => {
            toast.success(t("apply-panel.model.update.success"));
            setIsModalOpen(false);
          },
          onError: (error: any) => {
            toast.error(error?.message || t("apply-panel.model.update.failed"));
          },
        }
      );
    } else {
      applyJobMutation.mutate(
        {
          jobId: jobDetails.id,
          cover_note: coverNote,
          proposed_rate: proposedRate,
        },
        {
          onSuccess: () => {
            toast.success(t("apply-panel.model.submit.success"));
            setIsModalOpen(false);
          },
          onError: (error: any) => {
            toast.error(error?.message || t("apply-panel.model.submit.failed"));
          },
        }
      );
    }
  };

  const isRichTextEmpty = (html: string) => {
    if (!html) return true;

    // Remove <p>, </p>, <br>, &nbsp;, whitespace
    const cleaned = html
      .replace(/<p>/g, "")
      .replace(/<\/p>/g, "")
      .replace(/<br>/g, "")
      .replace(/&nbsp;/g, "")
      .replace(/\s+/g, "");

    return cleaned.length === 0;
  };

  const isFormValid =
    !isRichTextEmpty(coverNote) && proposedRate !== "" && proposedRate !== null;

  return (
    <>
      <div>
        {isModalOpen ? (
          <>
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
                  onClick={() => setIsModalOpen(false)}
                ></div>

                {/* This element is to trick the browser into centering the modal contents. */}
                <span
                  className="hidden sm:inline-block sm:align-middle sm:h-screen"
                  aria-hidden="true"
                >
                  &#8203;
                </span>

                {/* 2. Modal Panel (The actual content box) */}
                <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  {/* Header */}
                  <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between">
                    <h3
                      className="text-lg leading-6 font-bold text-gray-900"
                      id="modal-title"
                    >
                      {header}
                    </h3>
                    <X
                      className="h-6 w-6 text-black-300 border border-gray-200 cursor-pointer rounded-lg"
                      onClick={() => setIsModalOpen(false)}
                    />
                  </div>

                  {/* Body/Content */}
                  <div
                    className="py-2 space-y-1 overflow-auto px-6 mt-3 mb-4"
                    style={{ maxHeight: "500px" }}
                  >
                    {application?.success ? (
                      <>
                        <p className="text-sm text-gray-600">
                          {!application?.success &&
                            t("apply-panel.model.form.description")}
                        </p>
                        <div className="grid gap-1">
                          <div className="mt-2">
                            <WizardRichText
                              label={t(
                                "apply-panel.model.form.cover-note.label"
                              )}
                              value={coverNote}
                              onChange={setCoverNote}
                            />
                          </div>
                          <div className="mt-4">
                            <Input
                              label={t(
                                "apply-panel.model.form.proposed-rate.label",
                                { currency: jobDetails?.currency }
                              )}
                              value={proposedRate}
                              onChange={setProposedRate}
                              type="number"
                              placeholder={t(
                                "apply-panel.model.form.proposed-rate.placeholder"
                              )}
                              min={0}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">
                          {!application?.success &&
                            t("apply-panel.model.form.description")}
                        </p>
                        <div className="grid gap-1">
                          <div className="mt-2">
                            <WizardRichText
                              label={t(
                                "apply-panel.model.form.cover-note.label"
                              )}
                              value={coverNote}
                              onChange={setCoverNote}
                            />
                          </div>
                          <div className="mt-4">
                            <Input
                              label={t(
                                "apply-panel.model.form.proposed-rate.label",
                                { currency: jobDetails?.currency }
                              )}
                              value={proposedRate}
                              onChange={setProposedRate}
                              type="number"
                              placeholder={t(
                                "apply-panel.model.form.proposed-rate.placeholder"
                              )}
                              min={0}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Footer/Actions */}
                  <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                    <Button
                      className="rounded-xl"
                      disabled={!isFormValid}
                      onClick={() => handleApplySubmit()}
                    >
                      {buttonLabel}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsModalOpen(false)}
                    >
                      {t("apply-panel.model.close")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
