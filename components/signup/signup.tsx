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
import { FaCheckCircle } from "react-icons/fa";
import { SelectWithFilter } from "../input/select";
import ZipAutocomplete from "../input/autocomplete";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useT } from "@/app/[locale]/layout";

// Simple Link shim so this runs outside Next.js too
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

type Tag = {
  id: number;
  slug: string;
  name: string;
};

interface Country {
  id: string | number;
  name: string;
}

interface ApiResponse {
  countries: Country[];
}

interface TagInputProps {
  name: string;
  label?: string;
  value: Tag[]; // Now it's an array of objects
  onChange: (arr: Tag[]) => void;
  suggestions?: Tag[];
  placeholder?: string;
  required?: boolean;
  error?: string;
}

// Utilities
const EMAIL_RE = new RegExp("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
function isEmailValid(email) {
  if (typeof email !== "string") return false;
  const s = email.trim();
  if (s.length === 0) return false;
  return EMAIL_RE.test(s);
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

// ------------------------------
// Taggable Autocomplete (Chips + Suggestions)
// ------------------------------
function TagInput({
  name,
  label,
  value,
  onChange,
  suggestions = [],
  placeholder = "Type a skill and press Enter",
  required = false,
  error,
}: TagInputProps) {
  const [input, setInput] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const inputRef = React.useRef(null);
  const listRef = React.useRef(null);

  // Set of selected names for filtering
  const lowerSelected = React.useMemo(
    () => new Set(value.map((tag) => tag.name.toLowerCase())),
    [value]
  );

  const filtered = React.useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) {
      return suggestions
        .filter((s) => !lowerSelected.has(s.name.toLowerCase()))
        .slice(0, 8);
    }
    return suggestions
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) &&
          !lowerSelected.has(s.name.toLowerCase())
      )
      .slice(0, 8);
  }, [input, suggestions, lowerSelected]);

  function addTag(tag: Tag) {
    if (lowerSelected.has(tag.name.toLowerCase())) return;
    onChange([...value, tag]);
    setInput("");
    setActiveIndex(-1);
    setOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function removeTag(tag: Tag) {
    onChange(value.filter((v) => v.id !== tag.id));
    inputRef.current?.focus();
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && activeIndex >= 0 && activeIndex < filtered.length) {
        addTag(filtered[activeIndex]);
      }
    } else if (e.key === "Backspace" && !input) {
      if (value.length > 0) removeTag(value[value.length - 1]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) =>
        Math.min((i < 0 ? -1 : i) + 1, filtered.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max((i <= 0 ? 0 : i) - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div>
      {label && (
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor={`${name}-input`}
        >
          {label}
          {required ? " *" : ""}
        </label>
      )}

      <input
        type="hidden"
        name={name}
        value={value.map((tag) => tag.id).join(",")}
      />

      <div
        className={`w-full flex flex-wrap gap-2 rounded-xl border px-3 py-1.5 ${
          error ? "border-red-400 ring-2 ring-red-100" : "border-gray-300"
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* <div className="flex flex-wrap gap-2"> */}
        {value.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs"
          >
            {tag.name}
            <button
              type="button"
              className="ml-1 rounded p-0.5 hover:bg-gray-200"
              aria-label={`Remove ${tag.name}`}
              onClick={() => removeTag(tag)}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={`${name}-input`}
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 100)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="flex-1 min-w-[10ch] border-0 bg-transparent px-2 py-1 text-sm outline-none"
          aria-autocomplete="list"
          aria-controls={`${name}-listbox`}
          aria-expanded={open}
          autoComplete="off"
        />
        {/* </div> */}
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          id={`${name}-listbox`}
          role="listbox"
          className="mt-2 max-h-52 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-md"
        >
          {filtered.map((opt, i) => (
            <li
              key={opt.id}
              role="option"
              aria-selected={i === activeIndex}
              className={`cursor-pointer px-3 py-2 text-sm ${
                i === activeIndex ? "bg-gray-100" : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(opt);
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              {opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function renderRichText(
  text: string,
  components: Record<string, (children: React.ReactNode) => JSX.Element>
) {
  if (!text) return null;

  const re = /<(\w+)>(.*?)<\/\1>/g;
  const out: React.ReactNode[] = [];
  let last = 0,
    m: RegExpExecArray | null;
      let keyIndex = 0;

  while ((m = re.exec(text))) {
    const [full, tag, inner] = m;

    if (m.index > last) {
      out.push(
        <React.Fragment key={`text-${keyIndex++}`}>
          {text.slice(last, m.index)}
        </React.Fragment>
      );
    }

    const C = components[tag];

    out.push(
      <React.Fragment key={`tag-${keyIndex++}`}>
        {C ? C(inner) : inner}
      </React.Fragment>
    );

    last = m.index + full.length;
  }

  if (last < text.length) {

    out.push(
      <React.Fragment key={`end-${keyIndex++}`}>
        {text.slice(last)}
      </React.Fragment>
    );
  }


  return <>{out}</>;
}

export default function RegisterPage() {
  const t = useT("signup");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const roleFromUrl =
    searchParams.get("role") === "client" ? "client" : "helper";
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
  const [country, setCountry] = React.useState(
    countries?.find((c) => c.name == "Germany")?.id || ""
  );
  const [zip, setZip] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [latitude, setLatitude] = React.useState("");
  const [longitude, setLongitude] = React.useState("");
  const [zipOptions, setZipOptions] = React.useState<[]>([]);
  const [selectedZip, setSelectedZip] = React.useState<Zipcode>({
    city,
    state,
    latitude,
    longitude,
    country_id: country,
    zipcode: zip,
    street: "",
    id: 0,
  });

  const signup = useSignup();
  const collections = useCollections();
  const getCity = getCityByZip();

  React.useEffect(() => {
    setRole(roleFromUrl);
  }, [roleFromUrl]);

  // Helper to update both state and the URL (without page reload)
  function setRoleAndUrl(nextRole: "helper" | "client") {
    setRole(nextRole);
    const params = new URLSearchParams(searchParams);
    params.set("role", nextRole);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  React.useEffect(() => {
    collections.mutate(
      {},
      {
        onSuccess: (data) => {
          console.log(data);
          setJobCategories(data.data.jobCategories);
          setCountries(data.data.countries);
          setCountry(
            (data.data as ApiResponse).countries?.find(
              (c) => c.name == "Germany"
            )?.id || ""
          );
        },
        onError: (err: any) => {},
      }
    );
  }, []);

  React.useEffect(() => {
    setCity(selectedZip?.city ?? "");
    setState(selectedZip?.state ?? "");
    setLatitude(selectedZip?.latitude ?? "");
    setLongitude(selectedZip?.longitude ?? "");
  }, [selectedZip]);

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
      case "firstName":
        if (!v) return t("form.firstName.error_required");
        if (v.length < 2) return t("form.firstName.error_min");
        return "";
      case "lastName":
        if (!v) return t("form.lastName.error_required");
        if (v.length < 2) return t("form.lastName.error_min");
        return "";
      case "email":
        if (!v) return t("form.email.error_required");
        if (!isEmailValid(v)) return t("form.email.error_invalid");
        return "";
      case "password":
        if (!v) return t("form.password.error_required");
        if (v.length < 8) return t("form.password.error_min");
        return "";
      case "agree":
        if (!value) return t("form.agree.error_required");
        return "";
      case "skills":
        // Only required for helpers
        if (role === "helper" && (!Array.isArray(value) || value.length === 0))
          return t("form.skills.error_required");
        return "";
      default:
        return "";
    }
  }

  function handleBlur(e) {
    const { name, value, type, checked } = e.target || {};
    const val = type === "checkbox" ? checked : value;
    setFieldError(name, validateField(name, val));
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target || {};
    if (
      ["firstName", "lastName", "email", "password", "agree"].includes(name)
    ) {
      const val = type === "checkbox" ? checked : value;
      setFieldError(name, validateField(name, val));
    }
  }

  const handleZip = (z: string) => {
    setZip(z);
    getCity.mutate(
      {
        zip: z,
        country: country,
      },
      {
        onSuccess: (data) => {
          console.log(data);
          setZipOptions(data.data.zipcode);
        },
        onError: (err: any) => {},
      }
    );
  };

  const pwdInput = typeof password === "string" ? password : "";
  const rawScore = React.useMemo(() => computePwdScore(pwdInput), [pwdInput]);
  const pwdScore = Number.isFinite(rawScore)
    ? Math.max(0, Math.min(5, rawScore))
    : 0;

  async function onSubmit(e) {
    e.preventDefault();
    setMessage(null);

    const form = new FormData(e.currentTarget);
    const emailVal = form.get("email");
    const email = typeof emailVal === "string" ? emailVal.trim() : "";
    const passVal = form.get("password");
    const pass = typeof passVal === "string" ? passVal : "";
    const firstNameVal = form.get("firstName");
    const firstName =
      typeof firstNameVal === "string" ? firstNameVal.trim() : "";
    const lastNameVal = form.get("lastName");
    const lastName = typeof lastNameVal === "string" ? lastNameVal.trim() : "";
    const orgNameVal = form.get("orgName");
    const orgName = typeof orgNameVal === "string" ? orgNameVal.trim() : "";
    const websiteVal = form.get("website");
    const website = typeof websiteVal === "string" ? websiteVal.trim() : "";
    const rateVal = form.get("rate");
    const rate = typeof rateVal === "string" ? rateVal.trim() : "";

    const nextErrors = {
      firstName: validateField("firstName", firstName),
      lastName: validateField("lastName", lastName),
      email: validateField("email", email),
      password: validateField("password", pass),
      agree: validateField("agree", agree),
      skills: validateField("skills", skills),
    };
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      setMessage({ type: "error", text: `${t("messages.fix_fields")}` });
      const firstInvalid = [
        "firstName",
        "lastName",
        "email",
        "password",
        "skills",
      ].find((n) => nextErrors[n]);
      if (firstInvalid) {
        const el = e.currentTarget.querySelector(`[name="${firstInvalid}"]`);
        if (el && typeof el.focus === "function") el.focus();
      }
      return;
    }

    const payload = Object.fromEntries(form.entries());
    payload.role = role;

    try {
      setSubmitting(true);
      const newPayload: SignupData = {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role,
        city,
        country,
        zip,
        state,
        latitude,
        longitude,
        org_name: orgName,
        website,
        skills: skills.map((s) => s.id),
        rate,
      };
      const formEl = e.currentTarget;
      signup.mutate(newPayload, {
        onSuccess: (data) => {
          toast.custom((to) => (
            <div
              className={`${
                to.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              {/* Icon */}
              <div className="flex items-center justify-center p-4">
                <FaCheckCircle className="text-green-500 w-6 h-6" />
              </div>
              {/* Text */}
              <div className="flex-1 w-0 p-4">
                <p className="text-sm font-semibold text-green-600">
                  {t("toasts.success_title")}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {t("toasts.success_body")}
                </p>
              </div>
            </div>
          ));
          setAgree(false);
          setErrors({});
          setSubmitting(false);
          setPassword("");
          setCity("");
          setState("");
          setLatitude("");
          setLongitude("");
          setZip("");
          setSkills([]);
          formEl.reset();
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message || `${t("toast.error_fallback")}`
          );
          setSubmitting(false);
        },
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: (err && err.message) || "Something went wrong.",
      });
    } finally {
    }
  }

  const strengthClasses = [
    "w-0 bg-transparent",
    "w-1/5 bg-red-400",
    "w-2/5 bg-orange-400",
    "w-3/5 bg-yellow-400",
    "w-4/5 bg-lime-500",
    "w-full bg-green-500",
  ];
  const safeStrengthClass = strengthClasses[pwdScore] || strengthClasses[0];

  const submitDisabled = submitting || hasErrors;
  const s = t("form.agree.label_html");

  const text =
    s && s !== "form.agree.label_html"
      ? s
      : "I agree to the <linkTerms>Terms</linkTerms> and <linkPrivacy>Privacy Policy</linkPrivacy>.";

  return (
    <main className="flex-1 bg-gray-50">
      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

            <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 gap-2">
              {/* Subtitle */}
              <p dangerouslySetInnerHTML={{ __html: t("subtitle_html") }} />

              {/* Sign-in link */}
              <p className="text-sm text-gray-600">
                {t("cta.signin_prompt")}{" "}
                <Link
                  href={`/signin?role=${role}`}
                  className="text-black font-medium hover:underline"
                >
                  {t("cta.signin")}
                </Link>
              </p>
            </div>
          </div>

          {/* Role selector */}
          <div className="mt-6 inline-flex rounded-full bg-gray-100 p-1 text-sm">
            <button
              type="button"
              onClick={() => setRoleAndUrl("helper")}
              className={`rounded-full px-4 py-2 ${
                role === "helper"
                  ? "bg-white shadow ring-1 ring-black/5"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {t("roles.helper")}
            </button>
            <button
              type="button"
              onClick={() => setRoleAndUrl("client")}
              className={`rounded-full px-4 py-2 ${
                role === "client"
                  ? "bg-white shadow ring-1 ring-black/5"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {t("roles.client")}
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={onSubmit}
            noValidate
            className="mt-8 grid grid-cols-1 gap-5"
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-1 block text-sm font-medium"
                >
                  {t("form.firstName.label")}
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  required
                  aria-invalid={!!getFieldError("firstName")}
                  aria-describedby={
                    getFieldError("firstName") ? "firstName-error" : undefined
                  }
                  onBlur={handleBlur}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-3 py-2 ${
                    getFieldError("firstName")
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-300 focus:ring-black/20"
                  }`}
                />
                {getFieldError("firstName") && (
                  <p id="firstName-error" className="mt-1 text-xs text-red-600">
                    {getFieldError("firstName")}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-1 block text-sm font-medium"
                >
                  {t("form.lastName.label")}
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  required
                  aria-invalid={!!getFieldError("lastName")}
                  aria-describedby={
                    getFieldError("lastName") ? "lastName-error" : undefined
                  }
                  onBlur={handleBlur}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-3 py-2 ${
                    getFieldError("lastName")
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-300 focus:ring-black/20"
                  }`}
                />
                {getFieldError("lastName") && (
                  <p id="lastName-error" className="mt-1 text-xs text-red-600">
                    {getFieldError("lastName")}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium"
                >
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
                  htmlFor="phone"
                  className="mb-1 block text-sm font-medium"
                >
                  {t("form.phone.label")}
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2"
                />
              </div>
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
                  minLength={8}
                  aria-invalid={!!getFieldError("password")}
                  aria-describedby={
                    getFieldError("password") ? "password-error" : undefined
                  }
                  onBlur={handleBlur}
                  onChange={(e) => {
                    setPassword((e.target && e.target.value) || "");
                    handleChange(e);
                  }}
                  className={`w-full rounded-xl border px-3 py-2 pr-12 ${
                    getFieldError("password")
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-300 focus:ring-black/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-2 my-auto rounded-lg px-2 text-xs text-gray-600 hover:bg-gray-100"
                >
                  {showPassword
                    ? `${t("form.password.hide")}`
                    : `${t("form.password.show")}`}
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
              <p className="mt-1 text-xs text-gray-500">
                {t("form.password.hint")}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <SelectWithFilter
                  label={t("form.country.label")}
                  labelClass="mb-1 block text-sm font-medium text-gray-700"
                  value={country}
                  onChange={(v) => setCountry(v)}
                  options={countries}
                />
              </div>
              <div>
                <ZipAutocomplete
                  zip={zip}
                  setZip={setZip}
                  selectedObject={selectedZip}
                  setSelectedObject={setSelectedZip}
                  zipOptions={zipOptions}
                  onZipChange={handleZip}
                  label={t("form.zip.label")}
                  placeholder={t("form.zip.placeholder")}
                />
              </div>
              <div>
                <label
                  htmlFor="city"
                  className="mb-1 block text-sm font-medium"
                >
                  {t("form.city.label")}
                </label>
                <input
                  id="city"
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            {role === "client" ? (
              <fieldset className="rounded-2xl border border-gray-200 p-4">
                <legend className="px-1 text-sm font-semibold text-gray-700">
                  {t("sections.client")}
                </legend>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="orgName"
                      className="mb-1 block text-sm font-medium"
                    >
                      {t("form.orgName.label")}
                    </label>
                    <input
                      id="orgName"
                      name="orgName"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="website"
                      className="mb-1 block text sm font-medium"
                    >
                      {t("form.website.label")}
                    </label>
                    <input
                      id="website"
                      type="url"
                      name="website"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>
              </fieldset>
            ) : (
              <fieldset className="rounded-2xl border border-gray-200 p-4">
                <legend className="px-1 text-sm font-semibold text-gray-700">
                  {t("sections.helper")}
                </legend>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <TagInput
                      name="skills"
                      label={t("form.skills.label")}
                      value={skills}
                      onChange={(arr) => {
                        setSkills(arr);
                        setFieldError("skills", validateField("skills", arr));
                      }}
                      suggestions={jobCategories}
                      required={role === "helper"}
                      error={getFieldError("skills")}
                      placeholder={t("form.skills.placeholder")}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="rate"
                      className="mb-1 block text-sm font-medium"
                    >
                      {t("form.rate.label")}
                    </label>
                    <input
                      id="rate"
                      type="number"
                      step="0.5"
                      min="0"
                      name="rate"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>
              </fieldset>
            )}

            <div className="space-y-3">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  name="agree"
                  className={`mt-1 h-4 w-4 rounded ${
                    getFieldError("agree") ? "ring-2 ring-red-300" : ""
                  }`}
                  checked={agree}
                  onChange={(e) => {
                    setAgree(!!(e.target && e.target.checked));
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  aria-invalid={!!getFieldError("agree")}
                  aria-describedby={
                    getFieldError("agree") ? "agree-error" : undefined
                  }
                />
                <span>
                  {renderRichText(text, {
                    linkTerms: (children) => (
                      <Link href="/terms" className="underline">
                        {children}
                      </Link>
                    ),
                    linkPrivacy: (children) => (
                      <Link href="/datenschutz" className="underline">
                        {children}
                      </Link>
                    ),
                  })}
                  .
                </span>
              </label>
              {getFieldError("agree") && (
                <p id="agree-error" className="-mt-2 pl-7 text-xs text-red-600">
                  {getFieldError("agree")}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitDisabled}
              className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-white disabled:opacity-60"
              aria-disabled={submitDisabled}
            >
              {submitting ? `${t("cta.creating")}` : `${t("cta.create")}`}
            </button>
            <p className="text-sm text-gray-600">
              {t("cta.signin_prompt")}
              <Link
                href={`/signin?role=${role}`}
                className="text-black font-medium hover:underline"
              >
                {t("cta.signin")}
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
