"use client";
import { useMemo, useCallback } from "react";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useJobWizard } from "@/lib/context/job-wizard-context";
import { STEPS, StepId } from "@/lib/wizard/steps";
import { isStepComplete } from "@/lib/wizard/validators";
import { WizardNavigation } from "./WizardNavigation";
import toast from "react-hot-toast";
import { useT } from "@/app/[locale]/layout";

type Props = {
  current: StepId;
  // When you're inside step pages 2..6 you’ll have the slug either from form or query
  slug?: string | null;
};

export const StepSidebar = ({ current, slug }: Props) => {
  const t = useT("post-job");
  const { push } = useLocalizedRouter();
  const { formData, mode, jobId } = useJobWizard();

  // Compute which steps are complete using the shared validators
  const completion = useMemo(() => {
    const map = new Map<StepId, boolean>();
    for (const s of STEPS) map.set(s.id, isStepComplete(s.id, formData, (k) => t(k)));
    return map;
  }, [formData, t]);

  // Highest contiguous completed index starting from 1
  const highestUnlockedIndex = useMemo(() => {
    let max = 0;
    for (const s of STEPS) {
      if (s.index === 1) {
        if (completion.get("basic")) max = 1;
        else break;
      } else {
        // need slug + jobId in edit mode to unlock subsequent steps
        const canHaveSlug = !!(formData?.slug || slug);
        const prevComplete = max === s.index - 1;
        if (prevComplete && completion.get(s.id) !== false && canHaveSlug) {
          // You can “enter” the step even if it's not yet complete
          max = s.index;
        } else break;
      }
    }
    return max;
  }, [completion, formData?.slug, slug]);

const onNavClick = useCallback(
  (targetIndex: number, stepId: StepId) => {
    if (targetIndex > highestUnlockedIndex) {
      toast.error(t("common.complete_previous_steps"));
      return;
    }
    const step = STEPS.find((s) => s.index === targetIndex)!;
    const s = (formData?.slug || slug || "").trim();

    const href = step.to(s || undefined);
    push(href);
  },
  [highestUnlockedIndex, formData?.slug, slug, push, t]
);


  return (
    <div className="flex flex-wrap justify-center lg:flex-col gap-2 lg:space-y-4">
      {STEPS.map((s) => {
        const isCurrent = s.id === current;
        const prevAllComplete = s.index <= highestUnlockedIndex;
        const finished = completion.get(s.id) === true;

        // Disable clicking when step is ahead of unlocked boundary
        const disabled = s.index > highestUnlockedIndex;

        return (
          <WizardNavigation
            key={s.id}
            title={t(s.titleKey)}
            description={t(s.descKey)}
            count={s.index}
            current={isCurrent}
            finished={finished}
            disabled={disabled}
            onClick={() => onNavClick(s.index, s.id)}
          />
        );
      })}
    </div>
  );
};
