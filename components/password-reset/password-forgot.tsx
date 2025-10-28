"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useForgotPassword } from "@/lib/react-query/queries/user/account";
import { useT } from "@/app/[locale]/layout";

export default function ForgotPassword() {
  const t = useT("forgot-password");
  const { push } = useLocalizedRouter();
  const forgot = useForgotPassword();

  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // === Email validation ===
  function validateEmail(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return t("form.email.error_required") || "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
      return (
        t("form.email.error_invalid") || "Please enter a valid email address."
      );
    return "";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    // 👇 Let React render the "Sending…" UI before running mutation
    await new Promise((r) => setTimeout(r, 50));

    try {
      await forgot.mutateAsync(
        { email },
        {
          onSuccess: (data) => {
            toast.success(
              data?.message || t("toasts.success") || "Reset link sent."
            );
            setSent(true);
            setTimeout(() => push("/signin"), 4000);
          },
          onError: (e) => {
            toast.error(
              e.message || t("toasts.error") || "Could not send reset email."
            );
          },
        }
      );
    } catch (err: any) {
      toast.error(
        err.message || t("toasts.error") || "Could not send reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  // === Confirmation view ===
  if (sent) {
    return (
      <section className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-md px-4 py-10">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5 text-center">
            <h1 className="text-2xl font-bold mb-2">
              {t("messages.check_email_title") || "Check your email"}
            </h1>
            <p
              className="text-gray-600 mb-6 text-sm"
              dangerouslySetInnerHTML={{
                __html:
                  (t("messages.check_email_body") || "").replace(
                    "{{email}}",
                    `<b>${email}</b>`
                  ) ||
                  `If an account with <b>${email}</b> exists, we’ve sent a password reset link.`,
              }}
            />
            <button
              onClick={() => push("/signin")}
              className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-white hover:bg-black/80"
            >
              {t("cta.back") || "Back to login"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  // === Default forgot password form ===
  return (
    <main className="flex-1 bg-gray-50">
      <section className="mx-auto max-w-md px-4 py-10">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
          <h1 className="text-2xl font-bold">
            {t("title") || "Forgot password"}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {t("subtitle") || "Enter your email to receive a reset link."}
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-5">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                {t("form.email.label") || "Email"}
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setError(validateEmail(email))}
                required
                aria-invalid={!!error}
                aria-describedby={error ? "email-error" : undefined}
                placeholder={t("form.email.placeholder") || "Enter your email"}
                className={`w-full rounded-xl border px-3 py-2 ${
                  error
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:ring-black/20"
                }`}
              />
              {error && (
                <p id="email-error" className="mt-1 text-xs text-red-600">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-white disabled:opacity-60 hover:bg-black/80"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  {t("cta.sending") || "Sending…"}
                </>
              ) : (
                t("cta.send") || "Send reset link"
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
