"use client";
import React, { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
import { useJob } from "../react-query/queries/useJob";


type JobWizardMode = "create" | "edit";

interface JobWizardState {
  mode: JobWizardMode;
  jobId?: string | null;
  formData: Record<string, any>;
  errors: Record<string, string>;
  showErrors: boolean;
  loadingJob: boolean;
  errorJob?: string | null;
}

type JobWizardAction =
  | { type: "SET_MODE"; payload: JobWizardMode }
  | { type: "SET_JOB_ID"; payload: string | null }
  | { type: "UPDATE_FORM"; payload: Partial<Record<string, any>> }
  | { type: "SET_ERRORS"; payload: Record<string, string> }
  | { type: "SET_SHOW_ERRORS"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET" };

const initialState: JobWizardState = {
  mode: "create",
  jobId: null,
  formData: {},
  errors: {},
  showErrors: false,
  loadingJob: false,
  errorJob: null,
};

function jobWizardReducer(state: JobWizardState, action: JobWizardAction): JobWizardState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.payload };
    case "SET_JOB_ID":
      return { ...state, jobId: action.payload };
    case "UPDATE_FORM":
      return { ...state, formData: { ...state.formData, ...action.payload } };
    case "SET_ERRORS":
      return { ...state, errors: action.payload };
    case "SET_SHOW_ERRORS":
      return { ...state, showErrors: action.payload };
    case "SET_LOADING":
      return { ...state, loadingJob: action.payload };
    case "SET_ERROR":
      return { ...state, errorJob: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const JobWizardContext = createContext<
  | (JobWizardState & {
      setMode: (mode: JobWizardMode) => void;
      setJobId: (id: string | null) => void;
      updateForm: (data: Partial<Record<string, any>>) => void;
      setErrors: (errors: Record<string, string>) => void;
      setShowErrors: (value: boolean) => void;
      fetchJobBySlug: (slug: string) => Promise<void>;
      reset: () => void;
    })
  | undefined
>(undefined);

export const JobWizardProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(jobWizardReducer, initialState);

  // This hook stays idle until fetchJobBySlug() triggers a refetch
  const { refetch, isFetching } = useJob(undefined);

  const fetchJobBySlug = async (slug: string) => {
    if (!slug) return;
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const { data } = await refetch({ queryKey: ["job", slug] } as any);
      const job = data?.job;
      if (job) {
        dispatch({ type: "SET_MODE", payload: "edit" });
        dispatch({ type: "SET_JOB_ID", payload: job.id });
        dispatch({ type: "UPDATE_FORM", payload: job });
      } else {
        dispatch({ type: "SET_ERROR", payload: "No job found for this slug" });
      }
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch job data" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const value = {
    ...state,
    loadingJob: isFetching || state.loadingJob,
    setMode: (mode: JobWizardMode) => dispatch({ type: "SET_MODE", payload: mode }),
    setJobId: (id: string | null) => dispatch({ type: "SET_JOB_ID", payload: id }),
    updateForm: (data: Partial<Record<string, any>>) =>
      dispatch({ type: "UPDATE_FORM", payload: data }),
    setErrors: (errors: Record<string, string>) =>
      dispatch({ type: "SET_ERRORS", payload: errors }),
    setShowErrors: (v: boolean) => dispatch({ type: "SET_SHOW_ERRORS", payload: v }),
    fetchJobBySlug,
    reset: () => dispatch({ type: "RESET" }),
  };

  return (
    <JobWizardContext.Provider value={value}>{children}</JobWizardContext.Provider>
  );
};

export function useJobWizard() {
  const context = useContext(JobWizardContext);
  if (!context) {
    throw new Error("useJobWizard must be used within a JobWizardProvider");
  }
  return context;
}
