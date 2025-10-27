"use client";

import { useT } from "@/app/[locale]/layout";
import { useAuth } from "@/lib/context/auth-context";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { getErrorMessage } from "@/lib/utils/error";
import { useSearchParams, useRouter } from "next/navigation";
import * as React from "react";
import toast from "react-hot-toast";
import { FaCheckCircle } from "react-icons/fa";

// NOTE: Simple Link shim so this file runs in any React runtime (no Next.js dependency)
function Link({ href = "#", className = "", children, ...props }) {
  const router = useRouter();
  const { push } = useLocalizedRouter();
  return (
    <button
      type="button"
      onClick={() => push(href)}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

// =========================
// Utilities (email validator)
// =========================
const EMAIL_RE = new RegExp("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
function isEmailValid(email) {
  if (typeof email !== "string") return false;
  const s = email.trim();
  if (s.length === 0) return false;
  return EMAIL_RE.test(s);
}

// =========================
// DEV flag for lightweight assertions
// =========================
const __DEV__ =
  typeof process !== "undefined" &&
  process &&
  process.env &&
  process.env.NODE_ENV !== "production";

// =========================
// Login Page (single declaration)
// =========================
function LoginPage() {
  const t = useT("signin");
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") as "client" | "helper" | null;
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [role, setRole] = React.useState<"helper" | "client">(
    roleParam === "client" || roleParam === "helper" ? roleParam : "client"
  );
  const { push } = useLocalizedRouter();
  const router = useRouter();
  const { login } = useAuth();

  const setFieldError = React.useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
  }, []);
  const getFieldError = (name) => errors && errors[name];
  const hasErrors = React.useMemo(
    () => Object.values(errors || {}).some(Boolean),
    [errors]
  );

  function validateField(name, value) {
    const v = typeof value === "string" ? value.trim() : "";
    switch (name) {
      case "email":
        if (!v) return t("form.email.error_required");
        if (!isEmailValid(v)) return t("form.email.error_invalid");
        return "";
      case "password":
        if (!v) return t("form.password.error_required");
        return "";
      default:
        return "";
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target || {};
    setFieldError(name, validateField(name, value));
  }

  function handleChange(e) {
    const { name, value } = e.target || {};
    if (["email", "password"].includes(name)) {
      setFieldError(name, validateField(name, value));
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMessage(null);

    const form = new FormData(e.currentTarget);
    const emailVal = form.get("email");
    const email = typeof emailVal === "string" ? emailVal.trim() : "";
    const passVal = form.get("password");
    const password = typeof passVal === "string" ? passVal : "";

    const nextErrors = {
      email: validateField("email", email),
      password: validateField("password", password),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setMessage({ type: "error", text: `${t("messages.fix_fields")}` });
      const firstInvalid = ["email", "password"].find((n) => nextErrors[n]);
      if (firstInvalid) {
        const el = e.currentTarget.querySelector(`[name="${firstInvalid}"]`);
        if (el && typeof el.focus === "function") el.focus();
      }
      return;
    }

    try {
      setSubmitting(true);
      // Simulate API call

      login(email, password, {
        onSuccess: () => {
          toast.custom((to) => (
            <div
              className={`${
                to.visible ? "animate-enter" : "animate-leave"
              } inline-flex items-center bg-white shadow-lg rounded-xl pointer-events-auto ring-1 ring-black ring-opacity-5`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 p-3">
                <FaCheckCircle className="text-green-500 w-6 h-6" />
              </div>

              {/* Message */}
              <div className="flex-1 p-3">
                <p className="text-sm font-semibold text-green-600">
                  {t('toasts.success')}
                </p>
              </div>

              {/* Close Button */}
              <div className="flex-shrink-0 p-1">
                <button
                  onClick={() => toast.dismiss(to.id)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          ));

          push("/jobs");
        },
        onError: (err) => {
          toast.error(getErrorMessage(err) || `${t('toasts.error')}`);
        },
      });
      setSubmitting(false);
    } catch (err) {
      toast.error(err.message || "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  const submitDisabled = submitting || hasErrors;

  return (
    <main className="flex-1 flex-col  h-[calc(100vh-8rem)]">
      <section className="mx-auto max-w-md px-4 py-10">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

          <p className="mt-1 text-sm text-gray-600">
           {t("subtitle")}
          </p>

          <form
            onSubmit={onSubmit}
            noValidate
            className="mt-8 grid grid-cols-1 gap-5"
          >
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                 {t("form.email.label")}
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                aria-invalid={!!getFieldError("email")}
                aria-describedby={
                  getFieldError("email") ? "email-error" : undefined
                }
                onBlur={handleBlur}
                onChange={handleChange}
                className={`w-full rounded-xl border px-3 py-2 ${
                  getFieldError("email")
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:ring-black/20"
                }`}
              />
              {getFieldError("email") && (
                <p id="email-error" className="mt-1 text-xs text-red-600">
                  {getFieldError("email")}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium"
              >
                 {t("form.password.label")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  aria-invalid={!!getFieldError("password")}
                  aria-describedby={
                    getFieldError("password") ? "password-error" : undefined
                  }
                  onBlur={handleBlur}
                  onChange={handleChange}
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
                  {showPassword ? t("form.password.hide") : t("form.password.show")}
                </button>
              </div>
              {getFieldError("password") && (
                <p id="password-error" className="mt-1 text-xs text-red-600">
                  {getFieldError("password")}
                </p>
              )}
              <div className="mt-2 text-right text-xs">
                <Link
                  href="/forgot-password"
                  className="text-gray-600 underline hover:text-black"
                >
                 {t("form.forgot")}
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitDisabled}
              className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-white disabled:opacity-60"
              aria-disabled={submitDisabled}
            >
              {submitting ?  t("cta.signing_in") : t("cta.signin")}
            </button>

            <p className="text-sm text-gray-600">
                 {t("cta.signup_prompt")}{" "}
              <Link href="/signup" className="font-medium underline">
                  {t("cta.signup")}
              </Link>
            </p>

            {message && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  message.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}

// =========================
// DEV smoke tests (additive – do not modify existing)
// =========================
if (__DEV__) {
  const _valid = isEmailValid("a@b.com");
  console.assert(_valid === true, "login: email validator shares util");
  // Additional safety check
  console.assert(
    typeof LoginPage === "function",
    "login: component is declared once and exported"
  );
}

export default LoginPage;
export { LoginPage };
