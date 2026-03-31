"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useForgotPassword } from "@/lib/react-query/queries/user/account";
import { useT } from "@/app/[locale]/layout";

function Link({ href = "#", className = "", children, ...props }) {
  const { push } = useLocalizedRouter();
  return (
    <button type="button" onClick={() => push(href)} className={className} {...props}>
      {children}
    </button>
  );
}

export default function ForgotPassword() {
  const t = useT("forgot-password");
  const { push } = useLocalizedRouter();
  const forgot = useForgotPassword();

  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function validateEmail(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return t("form.email.error_required") || "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return t("form.email.error_invalid") || "Please enter a valid email address.";
    return "";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateEmail(email);
    if (validationError) { setError(validationError); return; }
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 50));
    try {
      await forgot.mutateAsync({ email }, {
        onSuccess: (data) => {
          toast.success(data?.message || t("toasts.success") || "Reset link sent.");
          setSent(true);
          setTimeout(() => push("/signin"), 4000);
        },
        onError: (e) => toast.error(e.message || t("toasts.error") || "Could not send reset email."),
      });
    } catch (err: any) {
      toast.error(err.message || "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  }

  // ── Success state ──
  if (sent) {
    return (
      <div className="flex min-h-screen flex-col lg:flex-row pt-16">
        <div className="hidden lg:flex lg:w-5/12 flex-col justify-between px-12 py-10 xl:px-16 xl:py-12" style={{ background: "#111110" }}>
          <div>
            <div className="mb-12">
              <span className="font-display font-extrabold text-2xl tracking-tight text-white">kiezly</span>
              <span className="ml-1.5 text-kz-accent text-2xl font-extrabold">.</span>
            </div>
            <h2 className="font-display font-extrabold text-white leading-[1.08] mb-4" style={{ fontSize: "clamp(30px,3.2vw,46px)", letterSpacing: "-1.5px" }}>
              Email<br /><span style={{ color: "#e8622a" }}>on its way.</span>
            </h2>
            <p className="text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,.5)" }}>
              Check your inbox — the reset link will arrive in under a minute.
            </p>
          </div>
        </div>
        <div className="flex-1 bg-white flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md text-center">
            <div className="mb-6 mx-auto w-16 h-16 rounded-2xl bg-[rgba(26,158,95,.1)] flex items-center justify-center">
              <svg className="w-8 h-8 text-kz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="font-display font-bold text-[#111110] text-2xl tracking-tight mb-2">
              {t("messages.check_email_title") || "Check your email"}
            </h1>
            <p className="text-[14px] mb-8" style={{ color: "rgba(17,17,16,.5)" }}
              dangerouslySetInnerHTML={{ __html: (t("messages.check_email_body") || "").replace("{{email}}", `<strong>${email}</strong>`) || `We've sent a reset link to <strong>${email}</strong>.` }} />
            <button onClick={() => push("/signin")}
              className="inline-flex items-center gap-2 rounded-full bg-[#111110] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-kz-accent transition-all">
              ← {t("cta.back") || "Back to sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Default form ──
  return (
    <div className="flex min-h-screen flex-col lg:flex-row pt-16">

      {/* ── LEFT: Brand panel ── */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between px-12 py-10 xl:px-16 xl:py-12" style={{ background: "#111110" }}>
        <div>
          <div className="mb-12">
            <span className="font-display font-extrabold text-2xl tracking-tight text-white">kiezly</span>
            <span className="ml-1.5 text-kz-accent text-2xl font-extrabold">.</span>
          </div>

          <div className="kz-hero-label" style={{ color: "rgba(255,255,255,.35)" }}>Password reset</div>

          <h2 className="font-display font-extrabold text-white leading-[1.08] mb-6"
            style={{ fontSize: "clamp(30px,3.2vw,46px)", letterSpacing: "-1.5px" }}>
            Happens to<br />
            <span style={{ color: "#e8622a" }}>everyone.</span>
          </h2>

          <p className="text-[15px] leading-relaxed mb-10" style={{ color: "rgba(255,255,255,.5)" }}>
            Enter your email and we'll send you a secure link to reset your password in seconds.
          </p>

          <ul className="space-y-4">
            {[
              "Secure link sent to your inbox",
              "Link expires after 24 hours",
              "No personal data is shared",
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

          {/* Back to sign in pill */}
          <div className="mb-8 flex justify-end">
            <Link href="/signin"
              className="inline-flex items-center gap-2 rounded-full bg-[#111110] px-4 py-2 text-[13px] text-white transition-all hover:bg-kz-accent">
              ← <span className="font-semibold">Back to sign in</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-display font-bold text-[#111110] text-2xl tracking-tight mb-1">
              {t("title") || "Forgot your password?"}
            </h1>
            <p className="text-[14px]" style={{ color: "rgba(17,17,16,.5)" }}>
              {t("subtitle") || "Enter your email and we'll send you a reset link."}
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-[#374151]">
                {t("form.email.label") || "Email"} <span className="text-kz-accent">*</span>
              </label>
              <input
                id="email" type="email" name="email" value={email} required
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setError(validateEmail(email))}
                placeholder={t("form.email.placeholder") || "you@example.com"}
                aria-invalid={!!error}
                className={`w-full h-[42px] rounded-lg border px-3.5 text-[13px] placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 ${
                  error ? "border-red-400 focus:ring-red-100" : "border-[#d1d5db] focus:border-kz-accent focus:ring-[rgba(232,98,42,.1)]"
                }`}
              />
              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-[46px] rounded-lg bg-kz-accent text-white font-semibold text-[14px] tracking-wide transition-all hover:bg-[#d4561f] active:scale-[.99] disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  {t("cta.sending") || "Sending…"}
                </>
              ) : (
                t("cta.send") || "Send reset link"
              )}
            </button>

          </form>
        </div>
      </div>

    </div>
  );
}
