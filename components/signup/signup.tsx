"use client";

import React, { useMemo, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import Input from "../shared-ui/input/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SignupData, useSignup } from "@/lib/react-query/queries/user/account";
import toast from "react-hot-toast";

export type UserRole = 'client' | 'helper'

export type User = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: UserRole;
    confirm_password: string;
};

type FormErrors = {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    confirm_password?: string;
};
function classNames(...xs: Array<string | false | undefined | null>) {
    return xs.filter(Boolean).join(" ");
}

export default function Signup() {
    const [data, setData] = useState<User | null>(null);

    return (
        <div className="flex mt-2 mb-2 items-center justify-center">
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
    const searchParams = useSearchParams();
    const roleParam = searchParams.get("role") as "client" | "helper" | null;
    const [form, setForm] = useState<User>({
        email: "",
        password: "",
        role: roleParam === "client" || roleParam === "helper" ? roleParam : "client",
        first_name: "",
        last_name: "",
        confirm_password: ""
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const signup = useSignup();

    function validate(): FormErrors {
        const e: FormErrors = {};
        if (!form.first_name) e.first_name = "First name required";
        if (!form.last_name) e.last_name = "Last name required";
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Valid email required";
        if (!form.password) e.password = "Password required";
        if (form.password.length < 8) {
            e.password = "Password must be 8 digit";
        }
        if (!form.confirm_password) {
            e.confirm_password = "Confirm password required";
        } else if (form.password !== form.confirm_password) {
            e.confirm_password = "Passwords do not match";
        }

        return e;
    }



    function update(path: (draft: User) => void, field?: keyof User) {
        setForm((prev) => {
            const draft: User = JSON.parse(JSON.stringify(prev));
            path(draft);

            if (field) {
                setErrors((prevErrors) => {
                    const newErrors = { ...prevErrors };

                    switch (field) {
                        case "email":
                            if (!draft.email) {
                                newErrors.email = "Email is required";
                            } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(draft.email)) {
                                newErrors.email = "Valid email required";
                            } else {
                                delete newErrors.email;
                            }
                            break;

                        case "password":
                            if (!draft.password) {
                                newErrors.password = "Password is required";
                            } else {
                                delete newErrors.password;
                            }
                            // Also check confirm password if it exists
                            if (draft.confirm_password && draft.password !== draft.confirm_password) {
                                newErrors.confirm_password = "Passwords do not match";
                            } else if (draft.confirm_password) {
                                delete newErrors.confirm_password;
                            }
                            break;

                        case "confirm_password":
                            if (!draft.confirm_password) {
                                newErrors.confirm_password = "Confirm password required";
                            } else if (draft.password !== draft.confirm_password) {
                                newErrors.confirm_password = "Passwords do not match";
                            } else {
                                delete newErrors.confirm_password;
                            }
                            break;

                        default:
                            // For other fields, just clear the error
                            delete newErrors[field];
                            break;
                    }

                    return newErrors;
                });
            }

            return draft;
        });
    }

    function handleSubmit(ev: React.FormEvent) {
        ev.preventDefault();

        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return; // stop if validation fails
        }

        // TODO: call your API here
        const payload: SignupData = {
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            password: form.password, // required
            role: form.role,
        };
        signup.mutate(payload, {
            onSuccess: (data) => {
                toast.custom((t) => (
                    <div
                        className={`${t.visible ? "animate-enter" : "animate-leave"
                            } max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                    >
                        {/* Icon */}
                        <div className="flex items-center justify-center p-4">
                            <FaCheckCircle className="text-green-500 w-6 h-6" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 w-0 p-4">
                            <p className="text-sm font-semibold text-green-600">
                                Registration successful!
                            </p>
                            <p className="mt-1 text-sm text-gray-700">
                                Please verify your email to activate your account.
                            </p>
                        </div>
                    </div>
                ));


                setForm({
                    email: "",
                    password: "",
                    role: roleParam === "client" || roleParam === "helper" ? roleParam : "client",
                    first_name: "",
                    last_name: "",
                    confirm_password: ""
                });
            },
            onError: (err: any) => toast.error(err.message || "Registration failed!"),
        });
    }

    return (

        <form onSubmit={handleSubmit} className="space-y-4">

            {/* choose Account Type */}
            <h2 className="mt-1 text-center text-md font-medium text-gray-700">
                Choose Account Type
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => update((d) => (d.role = "client"))}
                    className={`flex flex-col items-center rounded-xl border p-2 transition  ${form.role === "client"
                        ? "border-sky-500 bg-sky-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                >
                    <img src='/images/job.png' alt="Custom Icon" className="h-20 w-20" />
                    <span className="mt-2 font-medium">Client</span>
                </button>

                <button
                    type="button"
                    onClick={() => update((d) => (d.role = "helper"))}
                    className={`flex flex-col items-center rounded-xl border p-2 transition 
                        ${form.role === "helper"
                            ? "border-sky-500 bg-sky-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                >
                    <img src='/images/helper.png' alt="Custom Icon" className="h-20 w-20" />
                    <span className="mt-2 font-medium">Helper</span>
                </button>
            </div>

            {/* Basic info */}

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <Input label="First name" value={form.first_name} onChange={(v) => update((d) => (d.first_name = v), "first_name")} required error={errors.first_name} />

                </div>
                <div>
                    <Input label="Last name" value={form.last_name} onChange={(v) => update((d) => (d.last_name = v), "last_name")} required error={errors.last_name} />

                </div>
            </div>


            <div className="grid gap-2">
                <Input label="Email" type="email" value={form.email} onChange={(v) => update((d) => (d.email = v), "email")} required error={errors.email} />

            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <Input label="Password" type="password" value={form.password} onChange={(v) => update((d) => (d.password = v), "password")} required error={errors.password} />

                </div>
                <div>
                    <Input label="Confirm Password" type="password" value={form.confirm_password} onChange={(v) => update((d) => (d.confirm_password = v), "confirm_password")} required error={errors.confirm_password} />

                </div>
            </div>


            {/* <div className="text-sm text-red-600">{errors[0] || ""}</div> */}
            <div className="flex items-center justify-between gap-4">

                <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/signin" className="text-black font-medium hover:underline">
                        Sign in
                    </Link>
                </p>

                <button type="submit" className={classNames("rounded-xl px-5 py-2 text-white", "bg-black hover:bg-gray-800")} >
                    Create account
                </button>

            </div>
        </form>
    );
}




