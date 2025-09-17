"use client";

import { useCollections } from "@/lib/react-query/queries/user/account";
import { getProfile, updateProfile } from "@/lib/react-query/queries/user/profile";
import React, { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaCheckCircle } from "react-icons/fa";

/**
 * Kiezly – User Creation & Profile (fixed)
 * -------------------------------------------------------------
 * - Fixes: ReferenceError: classNames is not defined → adds local helper
 * - Adds: real-time live preview, safe defaults, tiny dev-time tests
 * - Tech: React + Tailwind (drop into Next.js as a client component)
 */

// ----------------------------
// Types
// ----------------------------
export type Education = {
  level: "Secondary" | "Vocational" | "Bachelor" | "Master" | "PhD" | "Other";
  field?: string;
  institution?: string;
  year?: string; // YYYY
};

export type SocialLinks = {
  website?: string;
  linkedin?: string;
  x?: string; // Twitter/X
  instagram?: string;
  facebook?: string;
};

export type Verification = {
  idVerified: boolean;
  firstAid: {
    completed: boolean;
    provider?: string;
    certificateId?: string;
    completionDate?: string; // YYYY-MM-DD
    expiryDate?: string; // optional
    fileUrl?: string; // uploaded proof
  };
  policeCertificate: {
    hasCertificate: boolean;
    level?: "Normal" | "Enhanced"; // (Erweitertes Führungszeugnis)
    issueDate?: string; // YYYY-MM-DD
    expiryDate?: string; // policy-dependent
    fileUrl?: string;
  };
};

export type Availability = {
  radiusKm: number; // service radius from base address
  weekdays: string[]; // e.g., ["Mon", "Tue", "Wed"]
  timeWindows: string[]; // e.g., ["Morning", "Afternoon", "Evening", "Weekend"]
};

export type RateCard = {
  hourlyEUR: number;
  fixedPriceAvailable: boolean;
  minHoursPerBooking?: number;
};

export type Address = {
  street?: string;
  postcode?: string;
  city?: string;
  districtOrKiez?: string; // free text like "Weststadt"
};

export type UserRole = 'client' | 'helper'

export type UserProfile = {
    id: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    is_email_verified: boolean;
    first_name: string;
    last_name: string;
    phone?: string | null;
    date_of_birth?: string | null;
    bio?: string | null;
    country?: string | null;
    state?: string | null;
    city?: string | null;
    postal_code?: string | null;
    street?: string | null;
    org_name?: string | null;
    rate?: number | null;
    website?: string | null;
    lat?: number | null;
    lng?: number | null;
    has_first_aid?: boolean | null;
    education_level?: string | null;
    police_verified?: boolean | null;
    avatar_url?: string | null;
    geom?: any | null;
    created_at: Date;
    updated_at: Date
  }

export type User = {
  // account
  email: string;
  password?: string; // only for creation; never return to client

  // profile
  role: "helper" | "client" | "both";
  firstName: string;
  lastName: string;
  displayName?: string; // nickname on profile
  phone?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  gender?: string;
  about?: string;
  photoUrl?: string;

  // location
  address: Address;
  lat?: number;
  lng?: number;

  // helper-specific
  categories: string[]; // e.g., ["Childcare", "Cleaning"]
  languages: string[]; // e.g., ["German", "English"]
  hasWorkPermit?: boolean;
  canInvoice?: boolean; // if offers invoice (for non-mini job gigs)
  availability: Availability;
  rate: RateCard;
  experienceYears?: number;
  education?: Education[];
  certificates?: string[]; // e.g., HACCP, Pflegebasiskurs

  // verification
  verification: Verification;

  // links
  socials: SocialLinks;
};

// ----------------------------
// Dictionaries & helpers
// ----------------------------
const ALL_CATEGORIES = [
  "Childcare",
  "Cleaning",
  "Pet care",
  "Senior support",
  "Errands",
  "Garden",
  "Events",
] as const;

const ALL_LANGUAGES = [
  "German",
  "English",
  "Turkish",
  "Polish",
  "Russian",
  "Arabic",
  "Hindi",
] as const;

type Tag = {
    id: number;
    slug: string;
    name: string;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const TIME_WINDOWS = ["Morning", "Afternoon", "Evening", "Weekend"] as const;

// FIX: Define classNames helper locally to avoid ReferenceError
function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

// ----------------------------
// Main component
// ----------------------------
export default function MyProfile() {
  const [data, setData] = useState<User | null>(null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">My Profile</h1>
      {/* <p className="mt-1 text-sm text-gray-600">Create your account and build a strong profile. Badges like ID, First Aid and Police Certificate help clients hire confidently.</p> */}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border p-6 shadow-sm">
          <OnboardingForm onChange={setData} />
        </div>
        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Live profile preview</h2>
          {data ? (
            <PublicProfile user={data} />
          ) : (
            <div className="text-sm text-gray-500">Start typing in the form to see your live public profile preview here.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------
// Onboarding Form
// ----------------------------
function OnboardingForm({ onChange }: { onChange: (u: User) => void }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const collections = useCollections();
  const pofile = getProfile();
  const updatePofile = updateProfile();

  useEffect(() => {
    collections.mutate({}, {
      onSuccess: (data) => {
        console.log(data);
      },
      onError: (err: any) => {
      }
    });
    pofile.mutate('', {
      onSuccess: (data) => {
        console.log(data);
        setForm({
          ...form,
          firstName: data.user.first_name,
          lastName: data.user.last_name,
          email: data.user.email,
          phone: data.user.phone,
          dateOfBirth: data.user.date_of_birth,
          photoUrl: data.user.avatar_url,
          about: data.user.bio,
          address: {
            city: data.user.city,
            street: data.user.street,
            postcode: data.user.postal_code,
          },
          rate: {
            hourlyEUR: data.user.rate,
            fixedPriceAvailable: false
          }
        })
      },
      onError: (err: any) => {
      }
    });
  }, [])

  const [form, setForm] = useState<User>({
    email: "",
    password: "",
    role: "helper",
    firstName: "",
    lastName: "",
    displayName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    about: "",
    photoUrl: "",
    address: { street: "", postcode: "", city: "", districtOrKiez: "" },
    categories: [],
    languages: ["German"],
    hasWorkPermit: true,
    canInvoice: false,
    availability: { radiusKm: 5, weekdays: ["Mon", "Tue", "Wed"], timeWindows: ["Afternoon"] },
    rate: { hourlyEUR: 15, fixedPriceAvailable: false, minHoursPerBooking: 2 },
    experienceYears: 0,
    education: [],
    certificates: [],
    verification: {
      idVerified: false,
      firstAid: { completed: false },
      policeCertificate: { hasCertificate: false, level: "Enhanced" },
    },
    socials: {},
  });

  // push form updates to parent in real-time (also triggers once on mount)
  useEffect(() => {
    onChange(form);
  }, [form, onChange]);

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.push("Valid email required");
    if (!form.firstName) e.push("First name required");
    if (!form.lastName) e.push("Last name required");
    if (!form.address.city) e.push("City required");
    // if (!form.categories.length) e.push("Select at least one category");
    if (form.rate.hourlyEUR < 12) e.push("Hourly rate must be ≥ 12 € (min wage)");
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
    console.log("Submitted user:", form);
    updatePofile.mutate({
      first_name: form.firstName,
      last_name: form.lastName,
      phone: form.phone,
      date_of_birth: form.dateOfBirth,
      bio: form.about,
      country: 'Germany',
      state: form.address.districtOrKiez,
      city: form.address.city,
      postal_code: form.address.postcode,
      street: form.address.street,
      lat: 0,
      lng: 0,
      has_first_aid: false,
      education_level: '',
      police_verified: false,
      avatar_url: '',
      org_name: '',
      website: '',
      rate: form.rate.hourlyEUR,
      skills: [],
    }, {
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
                Profile Updated!
              </p>
              <p className="mt-1 text-sm text-gray-700">
                
              </p>
            </div>
          </div>
        ));
      },
      onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Registration failed!")
      }
    });
  }
  

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic info */}
      <Section title="Basic information" description="This appears on your public profile.">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="First name" value={form.firstName} onChange={(v) => update((d) => (d.firstName = v))} required />
          <Input label="Last name" value={form.lastName} onChange={(v) => update((d) => (d.lastName = v))} required />
          <Input label="Display name (optional)" value={form.displayName || ""} onChange={(v) => update((d) => (d.displayName = v))} />
          <Input label="Phone" value={form.phone || ""} onChange={(v) => update((d) => (d.phone = v))} />
          <Input label="Date of birth" type="date" value={form.dateOfBirth || ""} onChange={(v) => update((d) => (d.dateOfBirth = v))} />
          <Select label="Gender" value={form.gender || ""} onChange={(v) => update((d) => (d.gender = v))} options={["", "Female", "Male", "Non-binary", "Prefer not to say"]} />
        </div>
        <Textarea label="About you" placeholder="A short intro, experience, strengths…" value={form.about || ""} onChange={(v) => update((d) => (d.about = v))} />
        <Input label="Profile photo URL" placeholder="https://…" value={form.photoUrl || ""} onChange={(v) => update((d) => (d.photoUrl = v))} />
      </Section>

      {/* Location */}
      <Section title="Location">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Street" value={form.address.street || ""} onChange={(v) => update((d) => (d.address.street = v))} />
          <Input label="Postcode" value={form.address.postcode || ""} onChange={(v) => update((d) => (d.address.postcode = v))} />
          <Input label="City" value={form.address.city || ""} onChange={(v) => update((d) => (d.address.city = v))} required />
          <Input label="District / Kiez" value={form.address.districtOrKiez || ""} onChange={(v) => update((d) => (d.address.districtOrKiez = v))} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Service radius (km)" type="number" min={1} max={100} value={form.availability.radiusKm} onChange={(v) => update((d) => (d.availability.radiusKm = Number(v)))} />
          <MultiCheckbox label="Available days" values={form.availability.weekdays} onChange={(vals) => update((d) => (d.availability.weekdays = vals))} options={Array.from(WEEKDAYS)} />
        </div>
        <MultiCheckbox label="Time windows" values={form.availability.timeWindows} onChange={(vals) => update((d) => (d.availability.timeWindows = vals))} options={Array.from(TIME_WINDOWS)} />
      </Section>

      {/* Work */}
      <Section title="Work preferences">
        <MultiCheckbox label="Categories" values={form.categories} onChange={(vals) => update((d) => (d.categories = vals))} options={Array.from(ALL_CATEGORIES)} />
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Hourly rate (€)" type="number" min={12} max={200} value={form.rate.hourlyEUR} onChange={(v) => update((d) => (d.rate.hourlyEUR = Number(v)))} />
          <Switch label="Fixed price available" checked={form.rate.fixedPriceAvailable} onChange={(v) => update((d) => (d.rate.fixedPriceAvailable = v))} />
          <Input label="Min hours per booking" type="number" min={1} max={12} value={form.rate.minHoursPerBooking || 1} onChange={(v) => update((d) => (d.rate.minHoursPerBooking = Number(v)))} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <MultiCheckbox label="Languages" values={form.languages} onChange={(vals) => update((d) => (d.languages = vals))} options={Array.from(ALL_LANGUAGES)} />
          <Switch label="Has work permit" checked={!!form.hasWorkPermit} onChange={(v) => update((d) => (d.hasWorkPermit = v))} />
          <Switch label="Can issue invoice" checked={!!form.canInvoice} onChange={(v) => update((d) => (d.canInvoice = v))} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Years of experience" type="number" min={0} max={40} value={form.experienceYears || 0} onChange={(v) => update((d) => (d.experienceYears = Number(v)))} />
          <TagInput label="Certificates (comma separated)" placeholder="HACCP, Pflegebasiskurs…" value={(form.certificates || []).join(", ")}
            onChange={(v) => update((d) => (d.certificates = v.split(",").map((s) => s.trim()).filter(Boolean)))} />
        </div>
      </Section>

      {/* Education */}
      <Section title="Education">
        <EducationEditor value={form.education || []} onChange={(val) => update((d) => (d.education = val))} />
      </Section>

      {/* Verification */}
      <Section title="Verification & badges">
        <div className="grid gap-6 md:grid-cols-2">
          <Switch label="ID verified" checked={form.verification.idVerified} onChange={(v) => update((d) => (d.verification.idVerified = v))} />
          <Switch label="First Aid completed" checked={form.verification.firstAid.completed} onChange={(v) => update((d) => (d.verification.firstAid.completed = v))} />
        </div>
        {form.verification.firstAid.completed && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input label="Provider" value={form.verification.firstAid.provider || ""} onChange={(v) => update((d) => (d.verification.firstAid.provider = v))} />
            <Input label="Certificate ID" value={form.verification.firstAid.certificateId || ""} onChange={(v) => update((d) => (d.verification.firstAid.certificateId = v))} />
            <Input label="Completion date" type="date" value={form.verification.firstAid.completionDate || ""} onChange={(v) => update((d) => (d.verification.firstAid.completionDate = v))} />
            <Input label="Expiry date (optional)" type="date" value={form.verification.firstAid.expiryDate || ""} onChange={(v) => update((d) => (d.verification.firstAid.expiryDate = v))} />
            <Input label="Proof file URL (temporary)" placeholder="https://…/first-aid.pdf" value={form.verification.firstAid.fileUrl || ""} onChange={(v) => update((d) => (d.verification.firstAid.fileUrl = v))} />
          </div>
        )}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Switch label="Police certificate available" checked={form.verification.policeCertificate.hasCertificate} onChange={(v) => update((d) => (d.verification.policeCertificate.hasCertificate = v))} />
          <Select label="Police certificate level" value={form.verification.policeCertificate.level || "Enhanced"} onChange={(v) => update((d) => (d.verification.policeCertificate.level = v as any))} options={["Normal", "Enhanced"]} />
        </div>
        {form.verification.policeCertificate.hasCertificate && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input label="Issue date" type="date" value={form.verification.policeCertificate.issueDate || ""} onChange={(v) => update((d) => (d.verification.policeCertificate.issueDate = v))} />
            <Input label="Expiry date" type="date" value={form.verification.policeCertificate.expiryDate || ""} onChange={(v) => update((d) => (d.verification.policeCertificate.expiryDate = v))} />
            <Input label="Proof file URL (temporary)" placeholder="https://…/police-certificate.pdf" value={form.verification.policeCertificate.fileUrl || ""} onChange={(v) => update((d) => (d.verification.policeCertificate.fileUrl = v))} />
          </div>
        )}
        <p className="mt-2 text-xs text-gray-500">Note: For childcare, the enhanced police certificate (Erweitertes Führungszeugnis) is recommended.</p>
      </Section>

      {/* Socials */}
      <Section title="Social & web">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Website" placeholder="https://…" value={form.socials.website || ""} onChange={(v) => update((d) => (d.socials.website = v))} />
          <Input label="LinkedIn" placeholder="https://linkedin.com/in/…" value={form.socials.linkedin || ""} onChange={(v) => update((d) => (d.socials.linkedin = v))} />
          <Input label="X (Twitter)" placeholder="https://x.com/…" value={form.socials.x || ""} onChange={(v) => update((d) => (d.socials.x = v))} />
          <Input label="Instagram" placeholder="https://instagram.com/…" value={form.socials.instagram || ""} onChange={(v) => update((d) => (d.socials.instagram = v))} />
          <Input label="Facebook" placeholder="https://facebook.com/…" value={form.socials.facebook || ""} onChange={(v) => update((d) => (d.socials.facebook = v))} />
        </div>
      </Section>

      <div className="flex items-center justify-between gap-4">
        {/* <div className="text-sm text-red-600">{errors[0] || ""}</div> */}
        <button type="submit" className={classNames("rounded-xl px-5 py-2 text-white", errors.length ? "bg-gray-400" : "bg-black hover:bg-gray-800")} disabled={!!errors.length}>
          Update account
        </button>
      </div>
    </form>
  );
}

// ----------------------------
// Public profile (Preview)
// ----------------------------
function PublicProfile({ user }: { user: User }) {
  const hasName = (user.displayName && user.displayName.trim()) || (user.firstName || user.lastName);
  const name = hasName ? (user.displayName || `${user.firstName} ${user.lastName}`.trim()) : "New helper";
  const cityLine = [user.address?.city, user.address?.districtOrKiez].filter(Boolean).join(" • ");

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <img src={user.photoUrl || "https://placehold.co/96x96"} alt={name} className="h-24 w-24 rounded-2xl object-cover" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-semibold">{name}</h3>
            <Badges verification={user.verification} />
          </div>
          <div className="mt-1 text-sm text-gray-600">
            {cityLine || "Add your city"}{user.languages?.length ? ` • ${user.languages.join(", ")}` : ""}
          </div>
          {user.about && <p className="mt-3 text-gray-800">{user.about}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoTile title="Categories" content={user.categories?.length ? user.categories.join(", ") : "–"} />
        <InfoTile title="Rate" content={`${user.rate?.hourlyEUR ?? "–"} €/h${user.rate?.minHoursPerBooking ? ` • min ${user.rate.minHoursPerBooking} h` : ""}`} />
        <InfoTile title="Availability" content={`${(user.availability?.weekdays || []).join(", ") || "–"} • ${(user.availability?.timeWindows || []).join(", ") || "–"}`} />
        <InfoTile title="Experience" content={`${user.experienceYears ?? 0} years`} />
      </div>

      {user.education?.length ? (
        <section>
          <h4 className="mb-2 text-lg font-semibold">Education</h4>
          <ul className="space-y-2">
            {user.education.map((ed, i) => (
              <li key={i} className="rounded-xl border p-3">
                <div className="font-medium">{ed.level}{ed.field ? ` – ${ed.field}` : ""}</div>
                <div className="text-sm text-gray-600">{ed.institution || ""}{ed.year ? ` • ${ed.year}` : ""}</div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(user.socials && Object.values(user.socials).some(Boolean)) && (
        <section>
          <h4 className="mb-2 text-lg font-semibold">Links</h4>
          <div className="flex flex-wrap gap-2 text-sm">
            {user.socials.website && <a className="rounded-full border px-3 py-1" href={user.socials.website}>Website</a>}
            {user.socials.linkedin && <a className="rounded-full border px-3 py-1" href={user.socials.linkedin}>LinkedIn</a>}
            {user.socials.x && <a className="rounded-full border px-3 py-1" href={user.socials.x}>X</a>}
            {user.socials.instagram && <a className="rounded-full border px-3 py-1" href={user.socials.instagram}>Instagram</a>}
            {user.socials.facebook && <a className="rounded-full border px-3 py-1" href={user.socials.facebook}>Facebook</a>}
          </div>
        </section>
      )}

      <section>
        <h4 className="mb-2 text-lg font-semibold">Documents</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <DocRow label="First Aid" value={user.verification.firstAid.completed ? `${user.verification.firstAid.provider || "Provider"}${user.verification.firstAid.completionDate ? ` • ${user.verification.firstAid.completionDate}` : ""}` : "Not provided"} href={user.verification.firstAid.fileUrl} />
          <DocRow label="Police certificate" value={user.verification.policeCertificate.hasCertificate ? `${user.verification.policeCertificate.level || ""}${user.verification.policeCertificate.issueDate ? ` • ${user.verification.policeCertificate.issueDate}` : ""}` : "Not provided"} href={user.verification.policeCertificate.fileUrl} />
        </div>
      </section>
    </div>
  );
}

function InfoTile({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{title}</div>
      <div className="mt-1 text-base">{content || "–"}</div>
    </div>
  );
}

function DocRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-sm text-gray-600">{value}</div>
      </div>
      {href ? (
        <a className="rounded-lg border px-3 py-1 text-sm" href={href}>View</a>
      ) : (
        <span className="text-xs text-gray-400">–</span>
      )}
    </div>
  );
}

function Badges({ verification }: { verification: Verification }) {
  const items: { label: string; active: boolean }[] = [
    { label: "ID", active: verification.idVerified },
    { label: "First Aid", active: verification.firstAid.completed },
    { label: "Police", active: verification.policeCertificate.hasCertificate },
  ];
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((b, i) => (
        <span key={i} className={classNames("rounded-full border px-2 py-0.5 text-xs", b.active ? "bg-emerald-50 border-emerald-300" : "border-gray-300 text-gray-500")}>{b.label}</span>
      ))}
    </div>
  );
}

// ----------------------------
// Editors & Controls
// ----------------------------
function EducationEditor({ value, onChange }: { value: Education[]; onChange: (v: Education[]) => void }) {
  const [items, setItems] = useState<Education[]>(value);
  useEffect(() => setItems(value), [value]);

  function pushBlank() {
    const next = [...items, { level: "Bachelor" as Education["level"] }];
    setItems(next);
    onChange(next);
  }
  function updateAt(index: number, patch: Partial<Education>) {
    const next = items.map((x, i) => (i === index ? { ...x, ...patch } : x));
    setItems(next);
    onChange(next);
  }
  function remove(index: number) {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {items.map((ed, i) => (
        <div key={i} className="grid gap-3 md:grid-cols-4">
          <Select label="Level" value={ed.level} onChange={(v) => updateAt(i, { level: v as Education["level"] })} options={["Secondary", "Vocational", "Bachelor", "Master", "PhD", "Other"]} />
          <Input label="Field of study" value={ed.field || ""} onChange={(v) => updateAt(i, { field: v })} />
          <Input label="Institution" value={ed.institution || ""} onChange={(v) => updateAt(i, { institution: v })} />
          <div className="flex items-end gap-2">
            <Input label="Year" type="number" value={ed.year || ""} onChange={(v) => updateAt(i, { year: v })} />
            <button type="button" onClick={() => remove(i)} className="h-10 rounded-lg border px-3 text-sm">Remove</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={pushBlank} className="rounded-xl border px-3 py-2 text-sm">+ Add education</button>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      {children}
      <hr className="border-gray-100" />
    </section>
  );
}

function Input({ label, value, onChange, type = "text", required, placeholder, min, max }: {
  label: string;
  value: any;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-700">{label}{required && <span className="text-red-600">*</span>}</span>
      <input
        className="w-full rounded-xl border px-3 py-2 outline-none ring-0 focus:border-black"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        required={required}
      />
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-700">{label}</span>
      <textarea className="w-full rounded-xl border px-3 py-2 outline-none focus:border-black" rows={4} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-700">{label}</span>
      <select className="w-full rounded-xl border px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>{o || "Select"}</option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({ label, checked, onChange }: { label: React.ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" className="h-4 w-4" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border px-3 py-2">
      <span className="text-sm">{label}</span>
      <button type="button" onClick={() => onChange(!checked)} className={classNames("h-6 w-11 rounded-full border p-0.5 text-left", checked ? "bg-black" : "bg-gray-200")}
        aria-pressed={checked}
      >
        <span className={classNames("block h-5 w-5 rounded-full bg-white transition", checked ? "translate-x-5" : "translate-x-0")} />
      </button>
    </div>
  );
}

function MultiCheckbox({ label, options, values, onChange }: { label: string; options: string[]; values: string[]; onChange: (next: string[]) => void }) {
  function toggle(val: string) {
    const set = new Set(values);
    if (set.has(val)) set.delete(val); else set.add(val);
    onChange(Array.from(set));
  }
  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-700">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button type="button" key={opt} onClick={() => toggle(opt)} className={classNames("rounded-full border px-3 py-1 text-sm", values.includes(opt) ? "bg-black text-white" : "")}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

function TagInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-700">{label}</span>
      <input className="w-full rounded-xl border px-3 py-2 outline-none focus:border-black" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      <span className="mt-1 block text-xs text-gray-500">Use commas to separate multiple entries.</span>
    </label>
  );
}

// ----------------------------
// Tiny dev-time tests (run in browser console, won't block UI)
// ----------------------------
if (typeof window !== "undefined") {
  try {
    console.assert(classNames("a", false, undefined, "b") === "a b", "classNames should join truthy strings");
    console.assert(classNames() === "", "classNames should return empty string when no args");
  } catch (e) {
    // noop – safe in production
  }
}
