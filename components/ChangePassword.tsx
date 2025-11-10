import { useT } from "@/app/[locale]/layout";
import { updatePassword } from "@/lib/react-query/queries/user/profile";
import { Eye, EyeOff } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function ChangePassword() {
    const t = useT("changePassword");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null);
    const upPsw = updatePassword();

    const setFieldError = useCallback((name, error) => {
        setErrors((prev) => ({ ...prev, [name]: error || undefined }));
    }, []);
    const getFieldError = (name) => errors && errors[name];

    function validatePassword(field, value: string) {
        const v = typeof value === "string" ? value.trim() : "";
        if (!v) return t(`form.${field}.error`);
        if (value.length < 8) return t(`form.${field}.length`);
        return "";
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage(null);
        const nextErrors = {
            oldPassword: validatePassword("oldPassword", oldPassword),
            newPassword: validatePassword("newPassword", newPassword),
            confirmPassword: newPassword !== confirmPassword && t(`form.confirmPassword.error`),
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

        upPsw.mutate({
            old_password: oldPassword,
            new_password: newPassword
        }, {
            onSuccess: (data) => {
                toast.success(t("message.success"))
                setOldPassword("")
                setNewPassword("")
                setConfirmPassword("")
            },
            onError: (err: any) => {
                toast.error(t("message.failed"))
            }
        })
    }
    const rawScore = useMemo(() => computePwdScore(newPassword), [newPassword]);
    const pwdScore = Number.isFinite(rawScore)
        ? Math.max(0, Math.min(5, rawScore))
        : 0;

    const strengthClasses = [
        "w-0 bg-transparent",
        "w-1/5 bg-red-400",
        "w-2/5 bg-orange-400",
        "w-3/5 bg-yellow-400",
        "w-4/5 bg-lime-500",
        "w-full bg-green-500",
    ];
    const safeStrengthClass = strengthClasses[pwdScore] || strengthClasses[0];

    return (
        <>
            <main className="flex-1 flex-col  h-[calc(100vh-8rem)]">
                <section className="mx-auto max-w-md px-4 py-10">
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
                        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

                        <p className="mt-1 text-sm text-gray-600">
                            {t("subtitle")}
                        </p>

                        <form noValidate className="mt-8 grid grid-cols-1 gap-5" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="oldPassword" className="mb-1 block text-sm font-medium">
                                    {t("form.oldPassword.label")}
                                </label>
                                <div className="relative">
                                    <input
                                        id="oldPassword"
                                        type={showOldPassword ? "text" : "password"}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className={`w-full rounded-xl border px-3 py-2 pr-12 ${getFieldError("oldPassword")
                                            ? "border-red-400 focus:ring-red-200"
                                            : "border-gray-300 focus:ring-black/20"
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword((s) => !s)}
                                        className="absolute inset-y-0 right-2 my-auto rounded-lg px-1 text-xs text-gray-600"
                                    >
                                        {showOldPassword ? (
                                            <EyeOff />
                                        ) : (
                                            <Eye />
                                        )}
                                    </button>
                                </div>
                                {getFieldError("oldPassword") && (
                                    <p id="oldPassword-error" className="mt-1 text-xs text-red-600">
                                        {getFieldError("oldPassword")}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="newPassword" className="mb-1 block text-sm font-medium">
                                    {t("form.newPassword.label")}
                                </label>
                                <div className="relative">
                                    <input
                                        id="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className={`w-full rounded-xl border px-3 py-2 pr-12 ${getFieldError("newPassword")
                                            ? "border-red-400 focus:ring-red-200"
                                            : "border-gray-300 focus:ring-black/20"
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword((s) => !s)}
                                        className="absolute inset-y-0 right-2 my-auto rounded-lg px-1 text-xs text-gray-600"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff />
                                        ) : (
                                            <Eye />
                                        )}
                                    </button>
                                </div>
                                {getFieldError("newPassword") && (
                                    <p id="newPassword-error" className="mt-1 text-xs text-red-600">
                                        {getFieldError("newPassword")}
                                    </p>
                                )}
                                <div
                                    className="mt-2 h-1.5 w-full overflow-hidden rounded bg-gray-200"
                                    aria-hidden
                                >
                                    <div className={`h-full transition-all ${safeStrengthClass}`} />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    {t("form.newPassword.hint")}
                                </p>
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
                                    {t("form.confirmPassword.label")}
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`w-full rounded-xl border px-3 py-2 pr-12 ${getFieldError("confirmPassword")
                                            ? "border-red-400 focus:ring-red-200"
                                            : "border-gray-300 focus:ring-black/20"
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((s) => !s)}
                                        className="absolute inset-y-0 right-2 my-auto rounded-lg px-1 text-xs text-gray-600"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff />
                                        ) : (
                                            <Eye />
                                        )}
                                    </button>
                                </div>
                                {getFieldError("confirmPassword") && (
                                    <p id="confirmPassword-error" className="mt-1 text-xs text-red-600">
                                        {getFieldError("confirmPassword")}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-white disabled:opacity-60"
                            >
                                {t("form.button")}
                            </button>
                        </form>
                    </div>
                </section>
            </main>
        </>
    )
}

function computePwdScore(password) {
    let pwd = "";
    if (password == null) pwd = "";
    else if (typeof password === "string") pwd = password;
    else {
        try {
            pwd = String(password);
        } catch {
            pwd = "";
        }
    }
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/\d/.test(pwd)) s++;
    if (/[^\w\s]/.test(pwd)) s++;
    return Math.max(0, Math.min(5, s));
}