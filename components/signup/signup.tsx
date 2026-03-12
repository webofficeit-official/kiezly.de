"use client";

import {
  getCityByZip,
  SignupData,
  useCollections,
  useSignup,
  Zipcode,
} from "@/lib/react-query/queries/user/account";
import * as React from "react";
import toast from "react-hot-toast";
import { FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { SelectWithFilter } from "../input/select";
import ZipAutocomplete from "../input/autocomplete";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useT } from "@/app/[locale]/layout";

function Link({ href = "#", className = "", children, ...props }) {
  const { push } = useLocalizedRouter();
  return (
    <button type="button" onClick={() => push(href)} className={className} {...props}>
      {children}
    </button>
  );
}

type Tag = { id: number; slug: string; name: string };
interface Country { id: string | number; code?: string; name: string }
interface ApiResponse { countries: Country[] }
interface TagInputProps {
  name: string; label?: string; value: Tag[];
  onChange: (arr: Tag[]) => void; suggestions?: Tag[];
  placeholder?: string; required?: boolean; error?: string;
}

const EMAIL_RE = new RegExp("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
function isEmailValid(email) {
  if (typeof email !== "string") return false;
  const s = email.trim();
  return s.length > 0 && EMAIL_RE.test(s);
}

function computePwdScore(password) {
  const pwd = typeof password === "string" ? password : "";
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[a-z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[^\w\s]/.test(pwd)) s++;
  return Math.max(0, Math.min(5, s));
}

function TagInput({ name, label, value, onChange, suggestions = [], placeholder, required, error }: TagInputProps) {
  const [input, setInput] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const inputRef = React.useRef(null);

  const lowerSelected = React.useMemo(() => new Set(value.map((t) => t.name.toLowerCase())), [value]);
  const filtered = React.useMemo(() => {
    const q = input.trim().toLowerCase();
    return suggestions.filter((s) => (!q || s.name.toLowerCase().includes(q)) && !lowerSelected.has(s.name.toLowerCase())).slice(0, 8);
  }, [input, suggestions, lowerSelected]);

  function addTag(tag: Tag) {
    if (lowerSelected.has(tag.name.toLowerCase())) return;
    onChange([...value, tag]);
    setInput(""); setActiveIndex(-1); setOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }
  function removeTag(tag: Tag) {
    onChange(value.filter((v) => v.id !== tag.id));
    inputRef.current?.focus();
  }
  function onKeyDown(e) {
    if (e.key === "Enter") { e.preventDefault(); if (open && activeIndex >= 0) addTag(filtered[activeIndex]); }
    else if (e.key === "Backspace" && !input && value.length > 0) removeTag(value[value.length - 1]);
    else if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActiveIndex((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Escape") { setOpen(false); setActiveIndex(-1); }
  }

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-[13px] font-medium text-[#374151]" htmlFor={`${name}-input`}>
          {label}{required && <span className="ml-0.5 text-kz-accent">*</span>}
        </label>
      )}
      <input type="hidden" name={name} value={value.map((t) => t.id).join(",")} />
      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex min-h-[42px] w-full flex-wrap gap-1.5 rounded-lg border px-3 py-2 cursor-text transition-all ${
          error
            ? "border-red-400 ring-2 ring-red-100"
            : "border-[#d1d5db] focus-within:border-kz-accent focus-within:ring-2 focus-within:ring-[rgba(232,98,42,.1)]"
        }`}
      >
        {value.map((tag) => (
          <span key={tag.id} className="inline-flex items-center gap-1 rounded-md bg-[rgba(232,98,42,.08)] px-2.5 py-0.5 text-[12px] font-medium text-kz-accent">
            {tag.name}
            <button type="button" className="ml-0.5 hover:text-kz-accent/60 leading-none" onClick={() => removeTag(tag)}>×</button>
          </span>
        ))}
        <input
          id={`${name}-input`} ref={inputRef} value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); setActiveIndex(-1); }}
          onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 100)}
          onKeyDown={onKeyDown} placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[10ch] border-0 bg-transparent text-[13px] outline-none placeholder:text-gray-400"
          aria-autocomplete="list" autoComplete="off"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {open && filtered.length > 0 && (
        <ul role="listbox" className="mt-1 max-h-48 w-full overflow-auto rounded-lg border border-[#e5e7eb] bg-white shadow-lg z-10 relative">
          {filtered.map((opt, i) => (
            <li key={opt.id} role="option" aria-selected={i === activeIndex}
              className={`cursor-pointer px-3.5 py-2.5 text-[13px] transition-colors ${i === activeIndex ? "bg-[rgba(232,98,42,.06)] text-kz-accent" : "hover:bg-gray-50"}`}
              onMouseDown={(e) => { e.preventDefault(); addTag(opt); }} onMouseEnter={() => setActiveIndex(i)}>
              {opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function renderRichText(text: string, components: Record<string, (children: React.ReactNode) => JSX.Element>) {
  if (!text) return null;
  const re = /<(\w+)>(.*?)<\/\1>/g;
  const out: React.ReactNode[] = [];
  let last = 0, m: RegExpExecArray | null, ki = 0;
  while ((m = re.exec(text))) {
    const [full, tag, inner] = m;
    if (m.index > last) out.push(<React.Fragment key={`t-${ki++}`}>{text.slice(last, m.index)}</React.Fragment>);
    const C = components[tag];
    out.push(<React.Fragment key={`c-${ki++}`}>{C ? C(inner) : inner}</React.Fragment>);
    last = m.index + full.length;
  }
  if (last < text.length) out.push(<React.Fragment key={`e-${ki++}`}>{text.slice(last)}</React.Fragment>);
  return <>{out}</>;
}

function Field({ label, required = false, error = "", children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
        {label}{required && <span className="ml-0.5 text-kz-accent">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
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

export default function RegisterPage() {
  const t = useT("signup");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const roleFromUrl = searchParams.get("role") === "client" ? "client" : "helper";
  const [role, setRole] = React.useState(roleFromUrl);
  const [showPassword, setShowPassword] = React.useState(false);
  const [agree, setAgree] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [skills, setSkills] = React.useState<Tag[]>([]);
  const [jobCategories, setJobCategories] = React.useState([]);
  const [countries, setCountries] = React.useState([]);
  const [country, setCountry] = React.useState(countries?.find((c) => c.code == "DE")?.id || "");
  const [zip, setZip] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [latitude, setLatitude] = React.useState("");
  const [longitude, setLongitude] = React.useState("");
  const [zipOptions, setZipOptions] = React.useState<[]>([]);
  const [selectedZip, setSelectedZip] = React.useState<Zipcode>({ city, state, latitude, longitude, country_id: country, zipcode: zip, street: "", id: 0 });

  const signup = useSignup();
  const collections = useCollections();
  const getCity = getCityByZip();

  React.useEffect(() => { setRole(roleFromUrl); }, [roleFromUrl]);

  function setRoleAndUrl(nextRole: "helper" | "client") {
    setRole(nextRole);
    const params = new URLSearchParams(searchParams);
    params.set("role", nextRole);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  React.useEffect(() => {
    collections.mutate({}, {
      onSuccess: (data) => {
        setJobCategories(data.data.jobCategories);
        setCountries(data.data.countries);
        setCountry((data.data as ApiResponse).countries?.find((c) => c.code == "DE")?.id || "");
      },
      onError: () => {},
    });
  }, []);

  React.useEffect(() => {
    setCity(selectedZip?.city ?? ""); setState(selectedZip?.state ?? "");
    setLatitude(selectedZip?.latitude ?? ""); setLongitude(selectedZip?.longitude ?? "");
  }, [selectedZip]);

  const setFieldError = React.useCallback((name, error) => setErrors((prev) => ({ ...prev, [name]: error || undefined })), []);
  const getFieldError = (name) => errors && errors[name];
  const hasErrors = React.useMemo(() => Object.values(errors || {}).some(Boolean), [errors]);

  function validateField(name, value) {
    const v = typeof value === "string" ? value.trim() : "";
    switch (name) {
      case "firstName": if (!v) return t("form.firstName.error_required"); if (v.length < 2) return t("form.firstName.error_min"); return "";
      case "lastName":  if (!v) return t("form.lastName.error_required");  if (v.length < 2) return t("form.lastName.error_min");  return "";
      case "email":     if (!v) return t("form.email.error_required");     if (!isEmailValid(v)) return t("form.email.error_invalid"); return "";
      case "password":  if (!v) return t("form.password.error_required");  if (v.length < 8) return t("form.password.error_min"); return "";
      case "agree":     if (!value) return t("form.agree.error_required"); return "";
      case "skills":    if (role === "helper" && (!Array.isArray(value) || value.length === 0)) return t("form.skills.error_required"); return "";
      default: return "";
    }
  }

  function handleBlur(e) {
    const { name, value, type, checked } = e.target || {};
    setFieldError(name, validateField(name, type === "checkbox" ? checked : value));
  }
  function handleChange(e) {
    const { name, value, type, checked } = e.target || {};
    if (["firstName","lastName","email","password","agree"].includes(name))
      setFieldError(name, validateField(name, type === "checkbox" ? checked : value));
  }

  const handleZip = (z: string) => {
    setZip(z);
    getCity.mutate({ zip: z, country }, {
      onSuccess: (data) => setZipOptions(data.data.zipcode),
      onError: () => {},
    });
  };

  const pwdScore = React.useMemo(() => {
    const raw = computePwdScore(typeof password === "string" ? password : "");
    return Number.isFinite(raw) ? Math.max(0, Math.min(5, raw)) : 0;
  }, [password]);

  async function onSubmit(e) {
    e.preventDefault();
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const email     = (form.get("email")     as string || "").trim();
    const pass      = (form.get("password")  as string) || "";
    const firstName = (form.get("firstName") as string || "").trim();
    const lastName  = (form.get("lastName")  as string || "").trim();
    const orgName   = (form.get("orgName")   as string || "").trim();
    const website   = (form.get("website")   as string || "").trim();
    const rate      = (form.get("rate")      as string || "").trim();

    const nextErrors = {
      firstName: validateField("firstName", firstName),
      lastName:  validateField("lastName",  lastName),
      email:     validateField("email",     email),
      password:  validateField("password",  pass),
      agree:     validateField("agree",     agree),
      skills:    validateField("skills",    skills),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setMessage({ type: "error", text: `${t("messages.fix_fields")}` });
      const firstInvalid = ["firstName","lastName","email","password","skills"].find((n) => nextErrors[n]);
      if (firstInvalid) { const el = e.currentTarget.querySelector(`[name="${firstInvalid}"]`); if (el?.focus) el.focus(); }
      return;
    }

    try {
      setSubmitting(true);
      const formEl = e.currentTarget;
      signup.mutate({
        first_name: firstName, last_name: lastName, email, password, role, city, country, zip, state, latitude, longitude,
        org_name: orgName, website, skills: skills.map((s) => s.id), rate,
      } as SignupData, {
        onSuccess: () => {
          toast.custom((to) => (
            <div className={`${to.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black/10`}>
              <div className="flex items-center justify-center p-4"><FaCheckCircle className="text-kz-green w-6 h-6" /></div>
              <div className="flex-1 p-4">
                <p className="text-sm font-semibold text-kz-green">{t("toasts.success_title")}</p>
                <p className="mt-1 text-sm text-gray-600">{t("toasts.success_body")}</p>
              </div>
            </div>
          ));
          setAgree(false); setErrors({}); setSubmitting(false); setPassword("");
          setCity(""); setState(""); setLatitude(""); setLongitude(""); setZip(""); setSkills([]);
          formEl.reset();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || `${t("toast.error_fallback")}`);
          setSubmitting(false);
        },
      });
    } catch (err) {
      setMessage({ type: "error", text: (err && err.message) || "Something went wrong." });
    }
  }

  const strengthConfig = [
    { w: "w-0",    color: "bg-transparent", label: "",          textColor: "" },
    { w: "w-1/5",  color: "bg-red-400",     label: "Too weak",  textColor: "text-red-500" },
    { w: "w-2/5",  color: "bg-orange-400",  label: "Weak",      textColor: "text-orange-500" },
    { w: "w-3/5",  color: "bg-yellow-400",  label: "Fair",      textColor: "text-yellow-600" },
    { w: "w-4/5",  color: "bg-lime-500",    label: "Good",      textColor: "text-lime-600" },
    { w: "w-full", color: "bg-kz-green",    label: "Strong",    textColor: "text-kz-green" },
  ];
  const strength = strengthConfig[pwdScore] || strengthConfig[0];
  const submitDisabled = submitting || hasErrors;
  const agreeText = (() => {
    const s = t("form.agree.label_html");
    return s && s !== "form.agree.label_html" ? s : "I agree to the <linkTerms>Terms</linkTerms> and <linkPrivacy>Privacy Policy</linkPrivacy>.";
  })();

  const brandPerks = [
    { icon: "✦", text: role === "helper" ? "Set your own rate and schedule" : "Post a job in under 2 minutes" },
    { icon: "✦", text: role === "helper" ? "Get paid for work in your Kiez" : "100s of verified helpers nearby" },
    { icon: "✦", text: role === "helper" ? "Grow your reputation over time" : "Transparent pricing, no surprises" },
  ];

  return (
    <div className="flex min-h-screen flex-col lg:flex-row pt-16">

      {/* ── LEFT: Brand panel ────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col justify-between px-12 py-10 xl:px-16 xl:py-12"
        style={{ background: "#111110" }}
      >
        {/* Top: logo + intro */}
        <div>
          <div className="mb-12">
            <span className="font-display font-extrabold text-2xl tracking-tight text-white">kiezly</span>
            <span className="ml-1.5 text-kz-accent text-2xl font-extrabold">.</span>
          </div>

          <div className="kz-hero-label" style={{ color: "rgba(255,255,255,.35)" }}>
            {role === "helper" ? "Become a helper" : "Hire local help"}
          </div>

          <h2
            className="font-display font-extrabold text-white leading-[1.08] mb-6"
            style={{ fontSize: "clamp(30px,3.2vw,46px)", letterSpacing: "-1.5px" }}
          >
            Your neighbourhood,<br />
            <span style={{ color: "#e8622a" }}>connected.</span>
          </h2>

          <p className="text-[15px] leading-relaxed mb-10" style={{ color: "rgba(255,255,255,.5)" }}>
            {role === "helper"
              ? "Join thousands of people earning money by helping their neighbours with everyday tasks."
              : "Find trusted local helpers for any task — from cleaning to handyman work."}
          </p>

          <ul className="space-y-4">
            {brandPerks.map((p) => (
              <li key={p.text} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ background: "rgba(232,98,42,.18)", color: "#e8622a" }}>{p.icon}</span>
                <span className="text-[14px]" style={{ color: "rgba(255,255,255,.65)" }}>{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: trust line */}
        <div className="mt-12 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["E","M","K","T"].map((l) => (
                <div key={l} className="w-8 h-8 rounded-full border-2 border-[#111110] flex items-center justify-center text-[11px] font-bold text-white" style={{ background: `hsl(${l.charCodeAt(0) * 37 % 360},45%,35%)` }}>{l}</div>
              ))}
            </div>
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,.4)" }}>
              <span className="text-white font-semibold">10,000+</span> people already on Kiezly
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form panel ─────────────────────────────── */}
      <div className="flex-1 bg-white overflow-y-auto">
        <div className="mx-auto w-full max-w-xl px-6 py-10 xl:px-8">

          {/* Already have an account */}
          <div className="mb-8 flex justify-end">
            <Link
              href={`/signin?role=${role}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#111110] px-4 py-2 text-[13px] text-white transition-all hover:bg-kz-accent"
            >
              Already have an account?
              <span className="font-semibold">Sign in →</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-display font-bold text-[#111110] text-2xl tracking-tight mb-1">
              Create your account
            </h1>
            <p className="text-[14px]" style={{ color: "rgba(17,17,16,.5)" }}>
              Free to join — takes less than 2 minutes.
            </p>
          </div>

          {/* Role toggle */}
          <div className="mb-8 flex rounded-lg p-1" style={{ background: "#f3f4f6" }}>
            {(["helper","client"] as const).map((r) => (
              <button
                key={r} type="button" onClick={() => setRoleAndUrl(r)}
                className={`flex-1 py-2.5 rounded-md text-[13px] font-semibold transition-all ${
                  role === r
                    ? "bg-white text-[#111110] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r === "helper" ? "🛠  " : "📋  "}{t(`roles.${r}`)}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} noValidate className="space-y-5">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("form.firstName.label")} required error={getFieldError("firstName")}>
                <Input name="firstName" required onBlur={handleBlur} onChange={handleChange} error={getFieldError("firstName")} />
              </Field>
              <Field label={t("form.lastName.label")} required error={getFieldError("lastName")}>
                <Input name="lastName" required onBlur={handleBlur} onChange={handleChange} error={getFieldError("lastName")} />
              </Field>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("form.email.label")} required error={getFieldError("email")}>
                <Input type="email" name="email" required autoComplete="email" onBlur={handleBlur} onChange={handleChange} error={getFieldError("email")} />
              </Field>
              <Field label={t("form.phone.label")}>
                <Input type="tel" name="phone" />
              </Field>
            </div>

            {/* Password */}
            <Field label={t("form.password.label")} required error={getFieldError("password")}>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"} name="password"
                  required minLength={8} autoComplete="new-password"
                  onBlur={handleBlur}
                  onChange={(e) => { setPassword(e.target.value || ""); handleChange(e); }}
                  error={getFieldError("password")} className="pr-11"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-3 my-auto text-[15px] text-gray-400 hover:text-gray-600">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2.5">
                  <div className="flex-1 h-1 rounded-full overflow-hidden bg-gray-200">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.w} ${strength.color}`} />
                  </div>
                  <span className={`text-[11px] font-medium w-12 text-right ${strength.textColor}`}>{strength.label}</span>
                </div>
              )}
            </Field>

            {/* Location */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <SelectWithFilter
                  label={t("form.country.label")}
                  labelClass="mb-1.5 block text-[13px] font-medium text-[#374151]"
                  value={country} onChange={(v) => setCountry(v)} options={countries}
                />
              </div>
              <div className="col-span-1">
                <ZipAutocomplete
                  zip={zip} setZip={setZip} selectedObject={selectedZip} setSelectedObject={setSelectedZip}
                  zipOptions={zipOptions} onZipChange={handleZip}
                  label={t("form.zip.label")} placeholder={t("form.zip.placeholder")}
                />
              </div>
              <Field label={t("form.city.label")}>
                <Input name="city" value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>
            </div>

            {/* Role-specific */}
            <div className="rounded-lg p-4" style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}>
              {role === "client" ? (
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t("form.orgName.label")}>
                    <Input name="orgName" />
                  </Field>
                  <Field label={t("form.website.label")}>
                    <Input type="url" name="website" placeholder="https://" />
                  </Field>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <TagInput
                    name="skills" label={t("form.skills.label")} value={skills}
                    onChange={(arr) => { setSkills(arr); setFieldError("skills", validateField("skills", arr)); }}
                    suggestions={jobCategories} required
                    error={getFieldError("skills")} placeholder={t("form.skills.placeholder")}
                  />
                  <Field label={t("form.rate.label")}>
                    <div className="relative">
                      <Input type="number" step="0.5" min="0" name="rate" className="pr-10" />
                      <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[13px] text-gray-400">€/h</span>
                    </div>
                  </Field>
                </div>
              )}
            </div>

            {/* T&C */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox" name="agree"
                className={`mt-0.5 h-4 w-4 rounded accent-kz-accent ${getFieldError("agree") ? "ring-2 ring-red-300" : ""}`}
                checked={agree}
                onChange={(e) => { setAgree(!!(e.target?.checked)); handleChange(e); }}
                onBlur={handleBlur}
              />
              <span className="text-[13px] leading-relaxed" style={{ color: "rgba(17,17,16,.55)" }}>
                {renderRichText(agreeText, {
                  linkTerms: (children) => <Link href="/terms" className="text-[#111110] underline underline-offset-2 hover:text-kz-accent">{children}</Link>,
                  linkPrivacy: (children) => <Link href="/datenschutz" className="text-[#111110] underline underline-offset-2 hover:text-kz-accent">{children}</Link>,
                })}
              </span>
            </label>
            {getFieldError("agree") && <p className="text-xs text-red-500">{getFieldError("agree")}</p>}

            {/* Error banner */}
            {message && (
              <div className={`rounded-lg border px-4 py-3 text-[13px] ${
                message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-600"
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={submitDisabled}
              className="w-full h-[46px] rounded-lg bg-kz-accent text-white font-semibold text-[14px] tracking-wide transition-all hover:bg-[#d4561f] active:scale-[.99] disabled:opacity-50"
            >
              {submitting ? `${t("cta.creating")}` : `${t("cta.create")}`}
            </button>

          </form>
        </div>
      </div>

    </div>
  );
}
