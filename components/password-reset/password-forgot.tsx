"use client";
import * as React from "react";
import toast from "react-hot-toast";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useForgotPassword } from "@/lib/react-query/queries/user/account";

export default function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false); // ✅ NEW STATE
  const { push } = useLocalizedRouter();
  const forgot = useForgotPassword();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email.");
      return;
    }

    try {
      setLoading(true);
      forgot.mutate(
        { email },
        {
          onSuccess: (data) => {
            toast.success(
              data?.message || "If that email exists, we’ve sent a reset link."
            );
            setSent(true); 
            // Optional redirect after delay
            setTimeout(() => push("/signin"), 4000);
          },
          onError: (e) => {
            toast.error(e.message || "Could not send reset email.");
          },
        }
      );
    } catch (err: any) {
      toast.error(err.message || "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  }

  // If email sent, show confirmation screen
  if (sent) {
    return (
      <section className="mx-auto max-w-md py-10 text-center">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-gray-600 mb-6">
            If an account with <b>{email}</b> exists, we’ve sent a password reset link. 
            Follow the instructions in your inbox to set a new password.
          </p>
          <button
            onClick={() => push("/login")}
            className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-white"
          >
            Back to login
          </button>
        </div>
      </section>
    );
  }

  // ✅ Default form view
  return (
    <section className="mx-auto max-w-md py-10">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter your email to receive a reset link.
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-5">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-gray-300 px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-white disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      </div>
    </section>
  );
}
