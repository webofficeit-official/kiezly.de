"use client";

import { useT } from "@/app/[locale]/layout";
import { useAuth } from "@/lib/context/auth-context";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { getErrorMessage } from "@/lib/utils/error";
import { useSearchParams, useRouter } from "next/navigation";
import * as React from "react";
import toast from "react-hot-toast";
import { FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";

function Link({ href = "#", className = "", children, ...props }) {
  const { push } = useLocalizedRouter();
  return (
    <button type="button" onClick={() => push(href)} className={className} {...props}>
      {children}
    </button>
  );
}

const EMAIL_RE = new RegExp("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
function isEmailValid(email) {
  if (typeof email !== "string") return false;
  const s = email.trim();
  return s.length > 0 && EMAIL_RE.test(s);
}

function Input({ error = "", className = "", ...props }) {
  return (
    <input
      className={`w-full h-[42px] rounded-lg border px-3.5 text-[13px] text-[#111110] placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 ${
        error
          ? "border-red-400 focus:ring-red-100"
          : "border-[#d1d5db] focus:border-kz-accent focus:ring-[rgba(232,98,42,.1)]"
      } ${className}`}
      {...props}
    />
  );
}

function LoginPage() {
  const t = useT("signin");
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") as "client" | "helper" | null;
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [remember, setRemember] = React.useState(false);
  const [role] = React.useState<"helper" | "client">(
    roleParam === "client" || roleParam === "helper" ? roleParam : "client"
  );

  const { push } = useLocalizedRouter();
  const { login } = useAuth();

  const setFieldError = React.useCallback((name, error) => setErrors((prev) => ({ ...prev, [name]: error || undefined })), []);
  const getFieldError = (name) => errors && errors[name];
  const hasErrors = React.useMemo(() => Object.values(errors || {}).some(Boolean), [errors]);

  function validateField(name, value) {
    const v = typeof value === "string" ? value.trim() : "";
    switch (name) {
      case "email":    if (!v) return t("form.email.error_required");    if (!isEmailValid(v)) return t("form.email.error_invalid"); return "";
      case "password": if (!v) return t("form.password.error_required"); return "";
      default: return "";
    }
  }

  function handleBlur(e) { const { name, value } = e.target || {}; setFieldError(name, validateField(name, value)); }
  function handleChange(e) {
    const { name, value } = e.target || {};
    if (["email","password"].includes(name)) setFieldError(name, validateField(name, value));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const email    = (form.get("email")    as string || "").trim();
    const password = (form.get("password") as string) || "";

    const nextErrors = { email: validateField("email", email), password: validateField("password", password) };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setMessage({ type: "error", text: `${t("messages.fix_fields")}` });
      return;
    }

    try {
      setSubmitting(true);
      login(email, password, {
        remember,
        onSuccess: () => {
          toast.custom((to) => (
            <div className={`${to.visible ? "animate-enter" : "animate-leave"} inline-flex items-center bg-white shadow-lg rounded-xl pointer-events-auto ring-1 ring-black/10`}>
              <div className="flex-shrink-0 p-3"><FaCheckCircle className="text-kz-green w-5 h-5" /></div>
              <div className="flex-1 px-3 py-3"><p className="text-sm font-semibold text-kz-green">{t("toasts.success")}</p></div>
              <div className="flex-shrink-0 p-1"><button onClick={() => toast.dismiss(to.id)} className="text-gray-400 hover:text-gray-600 font-bold text-lg px-2">✕</button></div>
            </div>
          ));
          push("/jobs");
        },
        onError: (err) => toast.error(getErrorMessage(err) || `${t("toasts.error")}`),
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
    <div className="flex min-h-screen flex-col lg:flex-row pt-16">

      {/* ── LEFT: Brand panel ── */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between px-12 py-10 xl:px-16 xl:py-12" style={{ background: "#111110" }}>
        <div>
          <div className="mb-12">
            <span className="font-display font-extrabold text-2xl tracking-tight text-white">kiezly</span>
            <span className="ml-1.5 text-kz-accent text-2xl font-extrabold">.</span>
          </div>

          <div className="kz-hero-label" style={{ color: "rgba(255,255,255,.35)" }}>Welcome back</div>

          <h2 className="font-display font-extrabold text-white leading-[1.08] mb-6"
            style={{ fontSize: "clamp(30px,3.2vw,46px)", letterSpacing: "-1.5px" }}>
            Good to see<br />
            <span style={{ color: "#e8622a" }}>you again.</span>
          </h2>

          <p className="text-[15px] leading-relaxed mb-10" style={{ color: "rgba(255,255,255,.5)" }}>
            Sign in to manage your jobs, messages, and profile — all in one place.
          </p>

          <ul className="space-y-4">
            {[
              "Access your jobs and applications",
              "Chat with clients and helpers",
              "Track earnings and reviews",
            ].map((text) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ background: "rgba(232,98,42,.18)", color: "#e8622a" }}>✦</span>
                <span className="text-[14px]" style={{ color: "rgba(255,255,255,.65)" }}>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,.3)" }}>
            Trusted by <span className="text-white font-semibold">10,000+</span> people across Germany
          </p>
        </div>
      </div>

      {/* ── RIGHT: Form panel ── */}
      <div className="flex-1 bg-white overflow-y-auto">
        <div className="mx-auto w-full max-w-md px-6 py-10 xl:px-8">

          {/* Sign up pill */}
          <div className="mb-8 flex justify-end">
            <Link
              href={`/signup?role=${role}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#111110] px-4 py-2 text-[13px] text-white transition-all hover:bg-kz-accent"
            >
              New to Kiezly? <span className="font-semibold">Sign up →</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-display font-bold text-[#111110] text-2xl tracking-tight mb-1">
              Sign in to your account
            </h1>
            <p className="text-[14px]" style={{ color: "rgba(17,17,16,.5)" }}>
              Enter your credentials below to continue.
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-[#374151]">
                {t("form.email.label")} <span className="text-kz-accent">*</span>
              </label>
              <Input id="email" type="email" name="email" required autoComplete="email"
                onBlur={handleBlur} onChange={handleChange} error={getFieldError("email")} />
              {getFieldError("email") && <p className="mt-1 text-xs text-red-500">{getFieldError("email")}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-[13px] font-medium text-[#374151]">
                  {t("form.password.label")} <span className="text-kz-accent">*</span>
                </label>
                <Link href="/forgot-password" className="text-[12px] font-medium text-kz-accent hover:underline">
                  {t("form.forgot")}
                </Link>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} name="password"
                  required autoComplete="current-password"
                  onBlur={handleBlur} onChange={handleChange}
                  error={getFieldError("password")} className="pr-11" />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-3 my-auto text-[15px] text-gray-400 hover:text-gray-600">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {getFieldError("password") && <p className="mt-1 text-xs text-red-500">{getFieldError("password")}</p>}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded accent-kz-accent" />
              <span className="text-[13px]" style={{ color: "rgba(17,17,16,.55)" }}>
                {t("form.remember_me") ?? "Remember me"}
              </span>
            </label>

            {/* Error */}
            {message && (
              <div className={`rounded-lg border px-4 py-3 text-[13px] ${
                message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-600"
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={submitDisabled}
              className="w-full h-[46px] rounded-lg bg-kz-accent text-white font-semibold text-[14px] tracking-wide transition-all hover:bg-[#d4561f] active:scale-[.99] disabled:opacity-50">
              {submitting ? t("cta.signing_in") : t("cta.signin")}
            </button>

          </form>
        </div>
      </div>

    </div>
  );
}

export default LoginPage;
export { LoginPage };
