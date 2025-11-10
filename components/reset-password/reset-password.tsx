"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import {
  useResetPassword,
  useVerifyResetLink,
} from "@/lib/react-query/queries/user/account";
import { useT } from "@/app/[locale]/layout";
import { Loader } from "../ui/loader";

// === same strength meter you use in signup ===
function computePwdScore(password: string) {
  let s = 0;
  if (password.length >= 8) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/[a-z]/.test(password)) s++;
  if (/\d/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++; // symbol
  return Math.max(0, Math.min(5, s));
}

type Props = { id: string };

function InlineError({ text }: { text: string }) {
  const { push } = useLocalizedRouter();
  const t=useT("reset-password")

  return (
    <div className="mx-auto  max-w-md rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700 shadow-sm">
      <p className="font-medium text-red-700">{text}</p>
      <p className="mt-1 text-xs text-red-600">
        {t("reset_error.description")||"Please request a new password reset link."}
      </p>

      <button
        onClick={() => push("/forgot-password")}
        className="mt-3 inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition"
      >
         {t("reset_error.requst_reset")||" Request New Link"}       
      </button>
    </div>
  );
}

export default function ResetPassword({ id }: Props) {
  const t = useT("reset-password");

  const sp = useSearchParams();
  const token = sp.get("token") || "";
  const { push } = useLocalizedRouter();

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [errors, setErrors] = React.useState<
    Record<"password" | "confirm", string | undefined>
  >({
    password: undefined,
    confirm: undefined,
  });
  const verify = useVerifyResetLink(id && token ? { id, token } : null);
  const reset = useResetPassword();
  const submitting = reset.isPending;

  if (verify.isLoading) return <Loader />;
  if (verify.isError || verify.data?.success === false)
    return <InlineError text={t("reset_error.title")||"Reset link is invalid or expired."} />;

  // i18n text
  const txt = {
    title: t("title") || "Reset password",
    subtitle: t("subtitle") || "Enter your new password below.",
    pwdLabel: t("form.password.label") || "New password *",
    pwdShow: t("form.password.show") || "Show",
    pwdHide: t("form.password.hide") || "Hide",
    pwdReq: t("form.password.error_required") || "Password is required.",
    pwdMin:
      t("form.password.error_min") || "Password must be at least 8 characters.",
    pwdInvalid:
      t("form.password.error_invalid") ||
      "Use at least 8 characters with a mix of letters, numbers and symbols.",
    pwdHint:
      t("form.password.hint") ||
      "Use at least 8 characters with a mix of letters, numbers and symbols.",
    confirmLabel: t("form.confirm.label") || "Confirm password *",
    confirmReq:
      t("form.confirm.error_required") || "Please confirm your password.",
    confirmMatch: t("form.confirm.error_match") || "Passwords do not match.",
    ctaSet: t("cta.set") || "Reset password",
    ctaSetting: t("cta.setting") || "Resetting…",
    msgBadLink:
      t("messages.bad_link") || "This reset link is invalid or has expired.",
    msgSuccessToast:
      t("messages.success") || "Password updated. You can sign in now.",
    toastErr: t("toasts.error") || "Could not reset password.",
  };

  // —— validation (now enforces letters + numbers + symbols) ——
  function validateField(name: "password" | "confirm", value: string) {
    const v = (value ?? "").trim();

    if (name === "password") {
      if (!v) return txt.pwdReq;
      if (v.length < 8) return txt.pwdMin;

      const hasLetter = /[A-Za-z]/.test(v);
      const hasNumber = /\d/.test(v);
      const hasSymbol = /[^A-Za-z0-9]/.test(v);

      if (!hasLetter || !hasNumber || !hasSymbol) return txt.pwdInvalid;
      return "";
    }

    if (name === "confirm") {
      if (!v) return txt.confirmReq;
      if (v !== password) return txt.confirmMatch;
      return "";
    }

    return "";
  }

  function setFieldError(name: "password" | "confirm", msg?: string) {
    setErrors((prev) => ({ ...prev, [name]: msg || undefined }));
  }
  const getFieldError = (name: "password" | "confirm") => errors[name];

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    if (name === "password" || name === "confirm") {
      setFieldError(name, validateField(name as any, value));
      if (name === "password" && confirm) {
        setFieldError("confirm", validateField("confirm", confirm));
      }
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    if (name === "password") {
      setPassword(value);
      setFieldError("password", validateField("password", value));
      if (confirm) setFieldError("confirm", validateField("confirm", confirm));
    } else if (name === "confirm") {
      setConfirm(value);
      setFieldError("confirm", validateField("confirm", value));
    }
  }

  function validateAll() {
    const next = {
      password: validateField("password", password),
      confirm: validateField("confirm", confirm),
    };
    setErrors(next);
    return next;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!id || !token) {
      toast.error(txt.msgBadLink);
      return;
    }

    const next = validateAll();
    if (Object.values(next).some(Boolean)) {
      const first = (["password", "confirm"] as const).find((n) => next[n]);
      if (first)
        e.currentTarget
          .querySelector<HTMLInputElement>(`[name="${first}"]`)
          ?.focus();
      return;
    }

    reset.mutate(
      { id, token, password },
      {
        onSuccess: (data) => {
          toast.success(data?.message || txt.msgSuccessToast);
          push("/signin");
        },
        onError: (err: any) => {
          toast.error(err?.message || txt.toastErr);
        },
      }
    );
  }

  // strength bar (same classes as signup)
  const score = computePwdScore(password);
  const strengthClasses = [
    "w-0 bg-transparent",
    "w-1/5 bg-red-400",
    "w-2/5 bg-orange-400",
    "w-3/5 bg-yellow-400",
    "w-4/5 bg-lime-500",
    "w-full bg-green-500",
  ] as const;
  const safeStrengthClass = strengthClasses[score] || strengthClasses[0];

  return (
    <section className="mx-auto max-w-md py-10">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
        <h1 className="text-2xl font-bold">{txt.title}</h1>
        <p className="mt-1 text-sm text-gray-600">{txt.subtitle}</p>

        <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-5">
          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              {txt.pwdLabel}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                minLength={8}
                aria-invalid={!!getFieldError("password")}
                aria-describedby={
                  getFieldError("password") ? "password-error" : undefined
                }
                className={`w-full rounded-xl border px-3 py-2 pr-12 ${
                  getFieldError("password")
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:ring-black/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-2 my-auto rounded-lg px-2 text-xs text-gray-600 hover:bg-gray-100"
              >
                {showPassword ? txt.pwdHide : txt.pwdShow}
              </button>
            </div>
            {getFieldError("password") && (
              <p id="password-error" className="mt-1 text-xs text-red-600">
                {getFieldError("password")}
              </p>
            )}
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded bg-gray-200"
              aria-hidden
            >
              <div className={`h-full transition-all ${safeStrengthClass}`} />
            </div>
            <p className="mt-1 text-xs text-gray-500">{txt.pwdHint}</p>
          </div>

          {/* Confirm */}
          <div>
            <label htmlFor="confirm" className="mb-1 block text-sm font-medium">
              {txt.confirmLabel}
            </label>
            <div className="relative">
              <input
                id="confirm"
                name="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                minLength={8}
                aria-invalid={!!getFieldError("confirm")}
                aria-describedby={
                  getFieldError("confirm") ? "confirm-error" : undefined
                }
                className={`w-full rounded-xl border px-3 py-2 pr-12 ${
                  getFieldError("confirm")
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:ring-black/20"
                }`}
              />
            </div>
            {getFieldError("confirm") && (
              <p id="confirm-error" className="mt-1 text-xs text-red-600">
                {getFieldError("confirm")}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-white disabled:opacity-60"
            aria-disabled={submitting}
          >
            {submitting ? txt.ctaSetting : txt.ctaSet}
          </button>
        </form>
      </div>
    </section>
  );
}
