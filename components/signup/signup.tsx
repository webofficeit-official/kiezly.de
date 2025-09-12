"use client";

import React, { useMemo, useState } from "react";
import Section from "../shared-ui/section/section";
import Input from "../shared-ui/input/input";

export type UserRole = 'client' | 'helper'

export type User = {
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    role: UserRole;
};



function classNames(...xs: Array<string | false | undefined | null>) {
    return xs.filter(Boolean).join(" ");
}

export default function Signup() {
    const [data, setData] = useState<User | null>(null);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-lg p-6 rounded-2xl border shadow-sm bg-white">
                {/* Header */}
                <h1 className="text-center text-2xl font-bold">
                    Create Account
                </h1>
                <p className="mt-1 text-center text-sm text-gray-600">
                    Please choose your role and fill in the details below
                </p>

                <div className="mt-2">
                    <OnboardingForm onChange={setData} />
                </div>
            </div>
        </div>
    );
}

// ----------------------------
// Onboarding Form
// ----------------------------
function OnboardingForm({ onChange }: { onChange: (u: User) => void }) {
    const [form, setForm] = useState<User>({
        email: "",
        password: "",
        role: "helper",
        first_name: "",
        last_name: "",
    });

    const errors = useMemo(() => {
        const e: string[] = [];
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.push("Valid email required");
        if (!form.first_name) e.push("First name required");
        if (!form.last_name) e.push("Last name required");
        return e;
    }, [form]);

    function update<T>(path: (draft: User) => void) {
        setForm((prev) => {
            const draft: User = JSON.parse(JSON.stringify(prev));
            path(draft);
            return draft;
        });
    }

    function handleSubmit(ev: React.FormEvent) {
        ev.preventDefault();
        if (errors.length) return;
        // TODO: call your API here
        console.log("Submitted user:", form);
    }

    return (

        <form onSubmit={handleSubmit} className="space-y-8">

            {/* choose Account Type */}
            <h2 className="mt-2 text-center text-md font-medium text-gray-700">
                Choose Account Type
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-4">
                <button
                    type="button"

                    className={`flex flex-col items-center rounded-xl border p-2 transition `}
                >
                    <img src='/images/job.png' alt="Custom Icon" className="h-20 w-20" />
                    <span className="mt-2 font-medium">Client</span>
                </button>

                <button
                    type="button"
                    className={`flex flex-col items-center rounded-xl border p-2 transition`}
                >
                    <img src='/images/job.png' alt="Custom Icon" className="h-20 w-20" />
                    <span className="mt-2 font-medium">Helper</span>
                </button>
            </div>

            {/* Basic info */}
            <Section title="Basic information">
                <div className="grid gap-4 md:grid-cols-2">
                    <Input label="First name" value={form.first_name} onChange={(v) => update((d) => (d.first_name = v))} required />
                    <Input label="Last name" value={form.last_name} onChange={(v) => update((d) => (d.last_name = v))} required />

                </div>

            </Section>

            {/* Account */}
            <Section title="Account">
                <div className="grid gap-4">
                    <Input label="Email" type="email" value={form.email} onChange={(v) => update((d) => (d.email = v))} required />
                </div>
                <div className="grid gap-4">
                    <Input label="Password" type="password" value={form.password} onChange={(v) => update((d) => (d.password = v))} required />
                </div>
            </Section>


            <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-red-600">{errors[0] || ""}</div>
                <button type="submit" className={classNames("rounded-xl px-5 py-2 text-white", errors.length ? "bg-gray-400" : "bg-black hover:bg-gray-800")} disabled={!!errors.length}>
                    Create account
                </button>
            </div>
        </form>
    );
}




