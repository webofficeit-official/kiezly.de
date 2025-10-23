"use client";

import { useAuth } from "@/lib/context/auth-context";
import { getCityByZip, useCollections, Zipcode } from "@/lib/react-query/queries/user/account";
import { getProfile, updateProfile, uploadDocument, uploadProfilePic } from "@/lib/react-query/queries/user/profile";
import React, { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaCheckCircle, FaTrash } from "react-icons/fa";
import { Listbox, Popover } from "@headlessui/react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay } from "date-fns";
import { SelectWithFilter } from "./input/select";
import ZipAutocomplete from "./input/autocomplete";
import { RichTextEditor } from "./shared-ui/rich-text-editor/rich-text-editor";
import { useT } from "@/app/[locale]/layout";

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
    fileId?: string; // uploaded proof
    fileUrl?: string; // uploaded proof
  };
  policeCertificate: {
    hasCertificate: boolean;
    level?: string; // (Erweitertes Führungszeugnis)
    issueDate?: string; // YYYY-MM-DD
    expiryDate?: string; // policy-dependent
    fileUrl?: string;
    fileId?: string; // uploaded proof
  };
};

export type Availability = {
  lat: number;
  lng: number;
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
  state?: string;
  country?: string;
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
  radius: number;
  lat?: number | null;
  lng?: number | null;
  has_first_aid?: boolean | null;
  first_aid: {
    provider: string | null;
    certificateId: string | null;
    completionDate: string | null;
    expiryDate: string | null;
    fileUrl: string | null;
    fileId: string | null;
  }
  education_level?: string | null;
  police_verified?: boolean | null;
  police_certificate: {
    level: string | null;
    issueDate: string | null;
    expiryDate: string | null;
    fileUrl: string | null;
    fileId: string | null;
  }
  avatar_url?: string | null;
  geom?: any | null;
  display_name: string | null;
  gender: string | null;
  district: string | null;
  fixed_price: boolean;
  min_hours: number | null;
  work_permit: boolean | null;
  issue_invoice: boolean;
  experience: number | null;
  certificates: string | null;
  skills: Tag[];
  languages: any[];
  weekdays: any[];
  time_windows: any[];
  created_at: Date;
  updated_at: Date;
  social_links: {
    platform: string;
    url: string;
  }[];
  education?: Education[];
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
  orgName?: string; // nickname on profile
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
  categories: any[]; // e.g., ["Childcare", "Cleaning"]
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

type Tag = {
  id: number;
  name: string;
};

// FIX: Define classNames helper locally to avoid ReferenceError
function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

// ----------------------------
// Main component
// ----------------------------
export default function MyProfile() {
  const collections = useCollections();
   const t = useT("profile");

  const [data, setData] = useState<User | null>(null);
  const [weekdays, setWeekdays] = useState([]);
  const [timeWindows, setTimeWindows] = useState([]);
  const [jobCategories, setJobCategories] = React.useState([])
  const [languages, setLanguages] = React.useState([])

  const [countries, setCountries] = React.useState([])

  useEffect(() => {
    collections.mutate({}, {
      onSuccess: (data) => {
        setWeekdays(data.data.weekdays)
        setTimeWindows(data.data.timeWindows)
        setJobCategories(data.data.jobCategories)
        setLanguages(data.data.languages)
        setCountries(data.data.countries)
      },
      onError: (err: any) => {
      }
    });
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      {/* <p className="mt-1 text-sm text-gray-600">Create your account and build a strong profile. Badges like ID, First Aid and Police Certificate help clients hire confidently.</p> */}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border p-6 shadow-sm">
          <OnboardingForm onChange={setData} weekdays={weekdays} timeWindows={timeWindows} jobCategories={jobCategories} languages={languages} countries={countries} />
        </div>
        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">{t("preview.title")}</h2>
          {data ? (
            <PublicProfile user={data} jobCategories={jobCategories} languages={languages} />
          ) : (
            <div className="text-sm text-gray-500">{t("preview.empty")}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export type OnboardingFormProps = {
  onChange: (u: User, weekdays: any[], timeWindows: any[], jobCategories: object[], languages: object[]) => void;
  weekdays: any[];
  timeWindows: any[];
  jobCategories: { id: string; name: string; }[];
  languages: { id: string; name: string; }[];
  countries: { id: string; name: string; }[];
};

// ----------------------------
// Onboarding Form
// ----------------------------
function OnboardingForm({ onChange, weekdays, timeWindows, jobCategories, languages, countries }: OnboardingFormProps) {
  const updatePofile = updateProfile();
  const uploadMutation = uploadDocument();
  const uploadProfile = uploadProfilePic();

  const myProfile = useAuth()
  const getCity = getCityByZip();
  const t=useT('profile')

  let formatted = ''
  if (myProfile?.user?.date_of_birth) {
    const updatedDateOfBirth = new Date(myProfile?.user?.date_of_birth || '');
    formatted = updatedDateOfBirth?.toISOString().split("T")[0] ?? ''
  }

  useEffect(() => {
    setForm({
      firstName: myProfile?.user?.first_name ?? '',
      lastName: myProfile?.user?.last_name ?? '',
      displayName: myProfile?.user?.display_name ?? '',
      orgName: myProfile?.user?.org_name ?? '',
      email: myProfile?.user?.email ?? '',
      phone: myProfile?.user?.phone ?? '',
      dateOfBirth: formatted,
      gender: myProfile?.user?.gender ?? '',
      photoUrl: myProfile?.user?.avatar_url ?? '',
      about: myProfile?.user?.bio ?? '',
      address: {
        city: myProfile?.user?.city ?? '',
        street: myProfile?.user?.street ?? '',
        postcode: myProfile?.user?.postal_code ?? '',
        districtOrKiez: myProfile?.user?.district ?? '',
        state: myProfile?.user?.state ?? '',
        country: myProfile?.user?.country ?? '',
      },
      rate: {
        hourlyEUR: myProfile?.user?.rate ?? 0,
        fixedPriceAvailable: myProfile?.user?.fixed_price ?? false,
        minHoursPerBooking: myProfile?.user?.min_hours ?? 0
      },
      categories: myProfile?.user?.skills?.map(skill => skill.id),
      languages: myProfile?.user?.languages?.map(lan => lan.id),
      availability: {
        weekdays: myProfile?.user?.weekdays ?? [],
        timeWindows: myProfile?.user?.time_windows ?? [],
        radiusKm: myProfile?.user?.radius ?? 5,
        lat: myProfile?.user?.lat ?? 0,
        lng: myProfile?.user?.lng ?? 0,
      },
      verification: {
        firstAid: {
          completed: myProfile?.user?.has_first_aid,
          provider: myProfile?.user?.first_aid?.provider,
          certificateId: myProfile?.user?.first_aid?.certificateId,
          completionDate: myProfile?.user?.first_aid?.completionDate,
          expiryDate: myProfile?.user?.first_aid?.expiryDate,
          fileUrl: myProfile?.user?.first_aid?.fileUrl,
          fileId: myProfile?.user?.first_aid?.fileId,
        },
        idVerified: myProfile?.user?.is_email_verified,
        policeCertificate: {
          hasCertificate: myProfile?.user?.police_verified,
          level: myProfile?.user?.police_certificate?.level,
          issueDate: myProfile?.user?.police_certificate?.issueDate,
          expiryDate: myProfile?.user?.police_certificate?.expiryDate,
          fileUrl: myProfile?.user?.police_certificate?.fileUrl,
          fileId: myProfile?.user?.police_certificate?.fileId,
        }
      },
      hasWorkPermit: myProfile?.user?.work_permit,
      canInvoice: myProfile?.user?.issue_invoice,
      experienceYears: myProfile?.user?.experience ?? 0,
      certificates: myProfile?.user?.certificates?.split(","),
      password: '',
      education: myProfile?.user?.education,
      role: myProfile?.user?.role ?? 'helper',
      socials: {
        website: myProfile?.user?.social_links?.find((link) => link.platform === "website")?.url || "",
        linkedin: myProfile?.user?.social_links?.find((link) => link.platform === "linkedin")?.url || "",
        x: myProfile?.user?.social_links?.find((link) => link.platform === "x")?.url || "",
        instagram: myProfile?.user?.social_links?.find((link) => link.platform === "instagram")?.url || "",
        facebook: myProfile?.user?.social_links?.find((link) => link.platform === "facebook")?.url || "",
      },
    })
  }, [myProfile]);

  const [form, setForm] = useState<User>({
    firstName: myProfile?.user?.first_name ?? '',
    lastName: myProfile?.user?.last_name ?? '',
    displayName: myProfile?.user?.display_name ?? '',
    orgName: myProfile?.user?.org_name ?? '',
    email: myProfile?.user?.email ?? '',
    phone: myProfile?.user?.phone ?? '',
    dateOfBirth: formatted ?? '',
    gender: myProfile?.user?.gender ?? '',
    photoUrl: myProfile?.user?.avatar_url ?? '',
    about: myProfile?.user?.bio ?? '',
    address: {
      city: myProfile?.user?.city ?? '',
      street: myProfile?.user?.street ?? '',
      postcode: myProfile?.user?.postal_code ?? '',
      districtOrKiez: myProfile?.user?.district ?? '',
      state: myProfile?.user?.state ?? '',
      country: myProfile?.user?.country ?? '',
    },
    rate: {
      hourlyEUR: myProfile?.user?.rate ?? 0,
      fixedPriceAvailable: myProfile?.user?.fixed_price ?? false,
      minHoursPerBooking: myProfile?.user?.min_hours ?? 0
    },
    categories: myProfile?.user?.skills?.map(skill => skill.id),
    languages: myProfile?.user?.languages?.map(lan => lan.id),
    availability: {
      weekdays: myProfile?.user?.weekdays ?? [],
      timeWindows: myProfile?.user?.time_windows ?? [],
      radiusKm: myProfile?.user?.radius ?? 5,
      lat: myProfile?.user?.lat ?? 0,
      lng: myProfile?.user?.lng ?? 0,
    },
    verification: {
      firstAid: {
        completed: myProfile?.user?.has_first_aid,
        provider: myProfile?.user?.first_aid?.provider,
        certificateId: myProfile?.user?.first_aid?.certificateId,
        completionDate: myProfile?.user?.first_aid?.completionDate,
        expiryDate: myProfile?.user?.first_aid?.expiryDate,
        fileUrl: myProfile?.user?.first_aid?.fileUrl,
        fileId: myProfile?.user?.first_aid?.fileId,
      },
      idVerified: myProfile?.user?.is_email_verified,
      policeCertificate: {
        hasCertificate: myProfile?.user?.police_verified,
        level: myProfile?.user?.police_certificate?.level,
        issueDate: myProfile?.user?.police_certificate?.issueDate,
        expiryDate: myProfile?.user?.police_certificate?.expiryDate,
        fileUrl: myProfile?.user?.police_certificate?.fileUrl,
        fileId: myProfile?.user?.police_certificate?.fileId,
      }
    },
    hasWorkPermit: myProfile?.user?.work_permit,
    canInvoice: myProfile?.user?.issue_invoice,
    experienceYears: myProfile?.user?.experience ?? 0,
    certificates: myProfile?.user?.certificates?.split(","),
    password: '',
    education: myProfile?.user?.education,
    role: myProfile?.user?.role ?? 'helper',
    socials: {
      website: myProfile?.user?.social_links?.find((link) => link.platform === "website")?.url || "",
      linkedin: myProfile?.user?.social_links?.find((link) => link.platform === "linkedin")?.url || "",
      x: myProfile?.user?.social_links?.find((link) => link.platform === "x")?.url || "",
      instagram: myProfile?.user?.social_links?.find((link) => link.platform === "instagram")?.url || "",
      facebook: myProfile?.user?.social_links?.find((link) => link.platform === "facebook")?.url || "",
    },
  });
  const [zipOptions, setZipOptions] = React.useState<[]>([]);
  const [selectedZip, setSelectedZip] = React.useState<Zipcode>({
    city: form?.address?.city ?? myProfile?.user?.city,
    state: form?.address?.state ?? myProfile?.user?.state,
    latitude: `${form?.availability?.lat ?? myProfile?.user?.lat}`,
    longitude: `${form?.availability?.lng ?? myProfile?.user?.lng}`,
    country_id: Number(form?.address?.country ?? myProfile?.user?.country),
    zipcode: form?.address?.postcode ?? myProfile?.user?.postal_code,
    street: myProfile?.user?.street,
    id: 0,
  });

  const handleZip = (z: string) => {
    setForm({
      ...form,
      address: {
        ...form.address,
        postcode: z
      }
    })
    getCity.mutate({
      zip: z,
      country: form.address.country
    }, {
      onSuccess: (data) => {
        setZipOptions(data.data.zipcode);
      },
      onError: (err: any) => {
      }
    });
  }

  React.useEffect(() => {
    setForm({
      ...form,
      address: {
        ...form.address,
        city: selectedZip?.city ?? form.address.city,
        state: selectedZip?.state ?? form.address.state,
        districtOrKiez: selectedZip?.city ?? form.address.districtOrKiez,
      },
      availability: {
        ...form.availability,
        lat: Number(selectedZip?.latitude) ?? form.availability.lat,
        lng: Number(selectedZip?.longitude) ?? form.availability.lng,
      }
    })
  }, [selectedZip])

  // push form updates to parent in real-time (also triggers once on mount)
  useEffect(() => {
    onChange(form, weekdays, timeWindows, jobCategories, languages);
  }, [form, onChange]);

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.push(t("errors.email_required"));
    if (!form.firstName) e.push(t("errors.first_required"));
    if (!form.lastName) e.push(t("errors.last_required"));
    if (!form.address.city) e.push(t("errors.city_required"));
    // if (!form.categories.length) e.push("Select at least one category");
    // if (form.rate.hourlyEUR < 12) e.push("Hourly rate must be ≥ 12 € (min wage)");
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
    updatePofile.mutate({
      first_name: form.firstName,
      last_name: form.lastName,
      phone: form.phone,
      date_of_birth: form.dateOfBirth,
      bio: form.about,
      state: form.address.state,
      country: form.address.country,
      city: form.address.city,
      postal_code: form.address.postcode,
      street: form.address.street,
      radius: form.availability.radiusKm,
      lat: form.availability.lat,
      lng: form.availability.lng,
      has_first_aid: form.verification.firstAid.completed,
      first_aid: {
        provider: form.verification.firstAid.provider,
        certificateId: form.verification.firstAid.certificateId,
        completionDate: form.verification.firstAid.completionDate,
        expiryDate: form.verification.firstAid.expiryDate,
        fileUrl: form.verification.firstAid.fileUrl,
        fileId: form.verification.firstAid.fileId
      },
      education_level: '',
      police_verified: form.verification.policeCertificate.hasCertificate,
      police_certificate: {
        level: form.verification.policeCertificate.level,
        issueDate: form.verification.policeCertificate.issueDate,
        expiryDate: form.verification.policeCertificate.expiryDate,
        fileUrl: form.verification.policeCertificate.fileUrl,
        fileId: form.verification.policeCertificate.fileId
      },
      avatar_url: form.photoUrl,
      website: '',
      rate: form.rate.hourlyEUR,
      display_name: form.displayName,
      org_name: form.orgName,
      gender: form.gender,
      district: form.address.districtOrKiez,
      fixed_price: form.rate.fixedPriceAvailable,
      min_hours: form.rate.minHoursPerBooking,
      work_permit: form.hasWorkPermit,
      issue_invoice: form.canInvoice,
      experience: form.experienceYears,
      certificates: form.certificates?.map(c => c).join(', '),
      skills: form.categories,
      languages: form.languages,
      weekdays: form.availability.weekdays,
      time_windows: form.availability.timeWindows,
      socialLinks: Object.entries(form.socials)
        .filter(([_, url]) => url)
        .map(([platform, url]) => ({ platform, url })),
      education: form.education
    }, {
      onSuccess: (data) => {
        myProfile.loadUser()
        toast.custom((to) => (
          <div
            className={`${to.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            {/* Icon */}
            <div className="flex items-center justify-center p-4">
              <FaCheckCircle className="text-green-500 w-6 h-6" />
            </div>
            {/* Text */}
            <div className="flex-1 w-0 p-4">
              <p className="text-sm font-semibold text-green-600">
               {t("toasts.updated_title")}
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
  function handleFileUpload(file: File | File[] | null, type: string) {
    if (!file) {
      console.log("No file selected");
      return;
    }

    if (Array.isArray(file)) {
      console.log("Multiple files:", file, type);
    } else {
      if (type == 'profile_pic') {
        uploadProfile.mutate(
          { file },
          {
            onSuccess: (data) => {
              update((d) => (d.photoUrl = data.data.filePath))
            },
            onError: (err) => {
              console.error("Upload failed:", err);
            },
          }
        );
      } else {
        uploadMutation.mutate(
          { file, type },
          {
            onSuccess: (data) => {
              if (type == 'police_clearance') {
                update((d) => (d.verification.policeCertificate.fileUrl = data.document.file_url))
                update((d) => (d.verification.policeCertificate.fileId = data.document.id))
              }
              if (type == 'first_aid') {
                update((d) => (d.verification.firstAid.fileUrl = data.document.file_url))
                update((d) => (d.verification.firstAid.fileId = data.document.id))
              }
            },
            onError: (err) => {
              console.error("Upload failed:", err);
            },
          }
        );
      }

    }
  }



  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic info */}
      <Section title={t("sections.basic.title")} description={t("sections.basic.description")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label={t("fields.firstName.label")} value={form.firstName} onChange={(v) => update((d) => (d.firstName = v))} required />
          <Input label={t("fields.lastName.label")} value={form.lastName} onChange={(v) => update((d) => (d.lastName = v))} required />
          {myProfile?.user?.role == "helper" ?
            <Input label={t("fields.displayName.label")} value={form.displayName || ""} onChange={(v) => update((d) => (d.displayName = v))} /> :
            <Input label={t("fields.orgName.label")} value={form.orgName || ""} onChange={(v) => update((d) => (d.orgName = v))} />
          }
          <Input label={t("fields.phone.label")} value={form.phone || ""} onChange={(v) => update((d) => (d.phone = v))} />
          <DateInput label={t("fields.dob.label")} value={form.dateOfBirth || ""} onChange={(v) => update((d) => (d.dateOfBirth = v))} placeholder={t("fields.dob.select_date")}/>
          <Select label={t("fields.gender.label")} value={form.gender || ""} onChange={(v) => update((d) => (d.gender = v))} options={["", "Female", "Male", "Non-binary", "Prefer not to say"]} placeholder={t("fields.gender.placeholder")} />
        </div>
        <RichTextEditor label={t("fields.about.label")} value={form.about || ""} onChange={(v) => update((d) => (d.about = v))} />
        <FileInput label={t("fields.photo.label")} accept={t("fields.photo.accept")} onChange={(v) => handleFileUpload(v, 'profile_pic')} />
      </Section>

      {/* Location */}
      <Section title={t("sections.location.title")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label={t("fields.street.label")} value={form.address.street || ""} onChange={(v) => update((d) => (d.address.street = v))} />
          <ZipAutocomplete
            zip={form.address.postcode}
            setZip={(v) => update((d) => (d.address.postcode = v))}
            selectedObject={selectedZip}
            setSelectedObject={setSelectedZip}
            zipOptions={zipOptions}
            onZipChange={handleZip}
            label={t("fields.postcode.label")}
            labelClass="mb-1 block text-gray-700 text-sm"
            className="w-full rounded-xl border px-2 py-1.5 outline-none ring-0 focus:border-black"
            placeholder={t("fields.postcode.placeholder")}
          />
          <Input label={t("fields.city.label")} value={form.address.city || ""} onChange={(v) => update((d) => (d.address.city = v))} required />
          <Input label={t("fields.district.label")} value={form.address.districtOrKiez || ""} onChange={(v) => update((d) => (d.address.districtOrKiez = v))} />
          <Input label={t("fields.state.label")} value={form.address.state || ""} onChange={(v) => update((d) => (d.address.state = v))} />
          {/* <Input label="Country" value={form.address.country || ""} onChange={(v) => update((d) => (d.address.country = v))} /> */}
          <SelectWithFilter label={t("fields.country.label")} labelClass="mb-1 block text-gray-700" value={form.address.country || ""} onChange={(v) => update((d) => (d.address.country = v))} options={countries} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label={t("fields.lat.label")} type="number" value={form.availability.lat} onChange={(v) => update((d) => (d.availability.lat = Number(v)))} />
          <Input label={t("fields.lng.label")} type="number" value={form.availability.lng} onChange={(v) => update((d) => (d.availability.lng = Number(v)))} />
          {myProfile?.user?.role == "helper" && <Input label={t("fields.radius.label")} type="number" min={1} max={100} value={form.availability.radiusKm} onChange={(v) => update((d) => (d.availability.radiusKm = Number(v)))} />}
          {myProfile?.user?.role == "helper" && <MultiCheckbox label={t("fields.available_days.label")} values={form.availability.weekdays} onChange={(vals) => update((d) => (d.availability.weekdays = vals))} options={Array.from(weekdays)} />}
        </div>
        {myProfile?.user?.role == "helper" && <MultiCheckbox label={t("fields.time_windows.label")} values={form.availability.timeWindows} onChange={(vals) => update((d) => (d.availability.timeWindows = vals))} options={Array.from(timeWindows)} />}
      </Section>

      {/* Work */}
      {myProfile?.user?.role == "helper" && <Section title={t("sections.work.title")}>
        <div className="py-2">
          <MultiCheckboxWithObject label={t("fields.categories.label")} values={form.categories} onChange={(vals) => update((d) => (d.categories = vals))} options={Array.from(jobCategories)} />
        </div>
        <div className="grid gap-6 md:grid-cols-2 py-2">
          <Input label={t("fields.hourly.label")} type="number" min={12} max={200} value={form.rate.hourlyEUR} onChange={(v) => update((d) => (d.rate.hourlyEUR = Number(v)))} />
          <Input label={t("fields.min_hours.label")} type="number" min={1} max={12} value={form.rate.minHoursPerBooking || 1} onChange={(v) => update((d) => (d.rate.minHoursPerBooking = Number(v)))} />
        </div>
        <div className="grid gap-6 md:grid-cols-2 py-2">
          <Switch label={t("fields.fixed_price.label")} checked={form.rate.fixedPriceAvailable} onChange={(v) => update((d) => (d.rate.fixedPriceAvailable = v))} />
          <MultiSelect label={t("fields.languages.label")} values={form.languages} onChange={(vals) => update((d) => (d.languages = vals))} options={Array.from(languages)} placeholder={t("fields.languages.placeholder")}/>
        </div>
        <div className="grid gap-4 md:grid-cols-2 py-2">
          <Switch label={t("fields.work_permit.label")} checked={!!form.hasWorkPermit} onChange={(v) => update((d) => (d.hasWorkPermit = v))} />
          <Switch label={t("fields.invoice.label")} checked={!!form.canInvoice} onChange={(v) => update((d) => (d.canInvoice = v))} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 py-2">
          <Input label={t("fields.experience.label")} type="number" min={0} max={40} value={form.experienceYears || 0} onChange={(v) => update((d) => (d.experienceYears = Number(v)))} />
          <TagInput label={t("fields.certificates.label")} placeholder={t("fields.certificates.placeholder")} value={(form.certificates || []).join(", ")}
            onChange={(v) => update((d) => (d.certificates = v.split(",").map((s) => s.trim()).filter(Boolean)))} hint={t("fields.certificates.hint")}/>
        </div>
      </Section>}

      {/* Education */}
      {myProfile?.user?.role == "helper" && <Section title={t("sections.education.title")}>
        <EducationEditor value={form.education || []} onChange={(val) => update((d) => (d.education = val))} hint={t("fields.edu_add.label")} />
      </Section>}

      {/* Verification */}
      {myProfile?.user?.role == "helper" && <Section title={t("sections.verification.title")}>
        <div className="grid gap-6 md:grid-cols-2">
          <Switch label={t("fields.id_verified.label")} checked={form.verification.idVerified} onChange={(v) => update((d) => (d.verification.idVerified = v))} />
          <Switch label={t("fields.first_aid_completed.label")} checked={form.verification.firstAid.completed} onChange={(v) => update((d) => (d.verification.firstAid.completed = v))} />
        </div>
        {form.verification.firstAid.completed && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input label={t("fields.first_aid_provider.label")} value={form.verification.firstAid.provider || ""} onChange={(v) => update((d) => (d.verification.firstAid.provider = v))} />
            <Input label={t("fields.first_aid_id.label")} value={form.verification.firstAid.certificateId || ""} onChange={(v) => update((d) => (d.verification.firstAid.certificateId = v))} />
            <DateInput label={t("fields.first_aid_completion.label")} value={form.verification.firstAid.completionDate || ""} onChange={(v) => update((d) => (d.verification.firstAid.completionDate = v))} />
            <DateInput label={t("fields.first_aid_expiry.label")} value={form.verification.firstAid.expiryDate || ""} onChange={(v) => update((d) => (d.verification.firstAid.expiryDate = v))} />
            <FileInput label={t("fields.first_aid_upload.label")} accept=".pdf,.doc,.docx" onChange={(v) => handleFileUpload(v, 'first_aid')} />
          </div>
        )}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Switch label={t("fields.police_has.label")} checked={form.verification.policeCertificate.hasCertificate} onChange={(v) => update((d) => (d.verification.policeCertificate.hasCertificate = v))} />
          <Select label={t("fields.police_level.label")} value={form.verification.policeCertificate.level || "Enhanced"} onChange={(v) => update((d) => (d.verification.policeCertificate.level = v as any))} options={["Normal", "Enhanced"]} />
        </div>
        {form.verification.policeCertificate.hasCertificate && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DateInput label={t("fields.police_issue.label")} value={form.verification.policeCertificate.issueDate || ""} onChange={(v) => update((d) => (d.verification.policeCertificate.issueDate = v))} />
            <DateInput label={t("fields.police_expiry.label")} value={form.verification.policeCertificate.expiryDate || ""} onChange={(v) => update((d) => (d.verification.policeCertificate.expiryDate = v))} />
            <FileInput label={t("fields.police_upload.label")} accept=".pdf,.doc,.docx" onChange={(v) => handleFileUpload(v, 'police_clearance')} />
          </div>
        )}
        <p className="mt-2 text-xs text-gray-500">{t("sections.verification.note")}</p>
      </Section>}

      {/* Socials */}
      <Section title={t("sections.social.title")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label={t("fields.website.label")} placeholder="https://…" value={form.socials.website || ""} onChange={(v) => update((d) => (d.socials.website = v))} />
          <Input label={t("fields.linkedin.label")} placeholder="https://linkedin.com/in/…" value={form.socials.linkedin || ""} onChange={(v) => update((d) => (d.socials.linkedin = v))} />
          <Input label={t("fields.x.label")}  placeholder="https://x.com/…" value={form.socials.x || ""} onChange={(v) => update((d) => (d.socials.x = v))} />
          <Input label={t("fields.instagram.label")}  placeholder="https://instagram.com/…" value={form.socials.instagram || ""} onChange={(v) => update((d) => (d.socials.instagram = v))} />
          <Input label={t("fields.facebook.label")} placeholder="https://facebook.com/…" value={form.socials.facebook || ""} onChange={(v) => update((d) => (d.socials.facebook = v))} />
        </div>
      </Section>

      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-red-600">{errors[0] || ""}</div>
        <button type="submit" className={classNames("rounded-xl px-5 py-2 text-white", errors.length ? "bg-gray-400" : "bg-black hover:bg-gray-800")} disabled={!!errors.length}>
         {t("buttons.update")}
        </button>
      </div>
    </form>
  );
}

// ----------------------------
// Public profile (Preview)
// ----------------------------
function PublicProfile({ user, jobCategories, languages }: {
  user: User, jobCategories: {
    id: string;
    name: string;
  }[], languages: {
    id: string;
    name: string;
  }[]
}) {
  const hasName = (user?.role == "helper" ? (user.displayName && user.displayName.trim()) : (user.orgName && user.orgName.trim())) || (user.firstName || user.lastName);
  const name = hasName ? ((user?.role == "helper" ? user.displayName : user.orgName) || `${user.firstName} ${user.lastName}`.trim()) : "New helper";
  const cityLine = [user.address?.city, user.address?.districtOrKiez, user.address?.state, user.address?.country].filter(Boolean).join(" • ");
  const myProfile = useAuth();
  const t=useT("profile")

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
            {cityLine || "Add your city"}{user.languages?.length ? ` • ${user.languages.map(id => languages.find(lan => lan.id === id)?.name || "").join(", ")}` : ""}
          </div>
          {user.about &&
            <div
              className="text-gray-700 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: user.about || "" }}
            />
          }
        </div>
      </div>

      {myProfile?.user?.role == "helper" && <div className="grid gap-4 sm:grid-cols-2">
        <InfoTile title={t("preview.tiles.categories")} content={user.categories?.length ? user.categories.map(id => jobCategories.find(cat => cat.id === id)?.name || "Unknown").join(", ") : "–"} />
        <InfoTile title={t("preview.tiles.rate")} content={`${user.rate?.hourlyEUR ?? "–"} €/h${user.rate?.minHoursPerBooking ? ` • min ${user.rate.minHoursPerBooking} h` : ""}`} />
        <InfoTile title={t("preview.tiles.availability")} content={`${(user.availability?.weekdays || []).join(", ") || "–"} • ${(user.availability?.timeWindows || []).join(", ") || "–"}`} />
        <InfoTile title={t("preview.tiles.experience")} content={`${user.experienceYears ?? 0} years`} />
      </div>}

      {myProfile?.user?.role == "helper" && user.education?.length ? (
        <section>
          <h4 className="mb-2 text-lg font-semibold">{t("preview.tiles.education")}</h4>
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
          <h4 className="mb-2 text-lg font-semibold">{t("preview.tiles.links")} </h4>
          <div className="flex flex-wrap gap-2 text-sm">
            {user.socials.website && <a className="rounded-full border px-3 py-1" href={user.socials.website} target="__blank">{t("fields.website.label")}</a>}
            {user.socials.linkedin && <a className="rounded-full border px-3 py-1" href={user.socials.linkedin} target="__blank">{t("fields.linkedin.label")}</a>}
            {user.socials.x && <a className="rounded-full border px-3 py-1" href={user.socials.x} target="__blank">{t("fields.x.label")}</a>}
            {user.socials.instagram && <a className="rounded-full border px-3 py-1" href={user.socials.instagram} target="__blank">{t("fields.instagram.label")}</a>}
            {user.socials.facebook && <a className="rounded-full border px-3 py-1" href={user.socials.facebook} target="__blank">{t("fields.facebook.label")}</a>}
          </div>
        </section>
      )}
      {myProfile?.user?.role == "helper" &&
        <section>
          <h4 className="mb-2 text-lg font-semibold">{t("preview.tiles.documents")}</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <DocRow label={t("preview.doc_rows.first_aid")} value={user.verification.firstAid.completed ? `${user.verification.firstAid.provider || "Provider"}${user.verification.firstAid.completionDate ? ` • ${user.verification.firstAid.completionDate}` : ""}` : t("preview.doc_rows.not_provided")} href={user.verification.firstAid.fileUrl} />
            <DocRow label={t("preview.doc_rows.police")} value={user.verification.policeCertificate.hasCertificate ? `${user.verification.policeCertificate.level || ""}${user.verification.policeCertificate.issueDate ? ` • ${user.verification.policeCertificate.issueDate}` : ""}` :  t("preview.doc_rows.not_provided")} href={user.verification.policeCertificate.fileUrl} />
          </div>
        </section>
      }
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
  const t=useT("profile")
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-sm text-gray-600">{value}</div>
      </div>
      {href ? (
        <a className="rounded-lg border px-3 py-1 text-sm" href={href}>{t("buttons.view")}</a>
      ) : (
        <span className="text-xs text-gray-400">–</span>
      )}
    </div>
  );
}

function Badges({ verification }: { verification: Verification }) {
  const myProfile = useAuth()
  const t=useT("profile")

  const items: { label: string; active: boolean, hide: boolean }[] = [
    { label: t("preview.badges.id"), active: verification.idVerified, hide: false },
    { label: t("preview.badges.first_aid"), active: verification.firstAid.completed, hide: myProfile?.user?.role == "client" },
    { label: t("preview.badges.police"), active: verification.policeCertificate.hasCertificate, hide: myProfile?.user?.role == "client" },
  ];
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((b, i) => (
        <span key={i} className={classNames("rounded-full border px-2 py-0.5 text-xs", b.active ? "bg-emerald-50 border-emerald-300" : "border-gray-300 text-gray-500", b.hide ? "hidden" : "")}>{b.label}</span>
      ))}
    </div>
  );
}

// ----------------------------
// Editors & Controls
// ----------------------------
function EducationEditor({ value, onChange,hint="Add" }: { value: Education[]; onChange: (v: Education[]) => void ,hint?:string}) {
  const t=useT('profile')
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
          <Select label={t("fields.edu_level.label")} value={ed.level} onChange={(v) => updateAt(i, { level: v as Education["level"] })} options={["Secondary", "Vocational", "Bachelor", "Master", "PhD", "Other"]} />
          <Input label={t("fields.edu_field.label")} value={ed.field || ""} onChange={(v) => updateAt(i, { field: v })} />
          <Input label={t("fields.edu_institution.label")} value={ed.institution || ""} onChange={(v) => updateAt(i, { institution: v })} />
          <div className="flex items-end gap-2">
            <Input label={t("fields.edu_year.label")}  type="number" value={ed.year || ""} onChange={(v) => updateAt(i, { year: v })} />
            <button type="button" onClick={() => remove(i)} className="h-10 rounded-lg border px-3 text-sm"><FaTrash /></button>
          </div>
        </div>
      ))}
      <button type="button" onClick={pushBlank} className="rounded-xl border px-3 py-2 text-sm">{hint}</button>
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

function DateInput({
  label,
  value,
  onChange,
  required,
  placeholder="Select date"
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?:string;
}) {
  const [month, setMonth] = useState(new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i); // Last 100 years
  const months = Array.from({ length: 12 }, (_, i) => format(new Date(2024, i, 1), "MMMM"));

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = new Date(month);
    newMonth.setMonth(parseInt(e.target.value));
    setMonth(newMonth);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = new Date(month);
    newMonth.setFullYear(parseInt(e.target.value));
    setMonth(newMonth);
  };

  return (
    <div className="block text-sm">
      <span className="mb-1 block text-gray-700">
        {label}
        {required && <span className="text-red-600">*</span>}
      </span>

      <Popover className="relative">
        <Popover.Button className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-left shadow-sm focus:border-black">
          {value ? format(new Date(value), "yyyy-MM-dd") : placeholder}
          <CalendarIcon className="h-4 w-4 text-gray-400" />
        </Popover.Button>

        <Popover.Panel className="absolute z-10 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
          {/* Month navigation with dropdowns */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMonth(subMonths(month, 1))}
              className="rounded p-1 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex space-x-2">
              <select
                value={month.getMonth()}
                onChange={handleMonthChange}
                className="rounded-md bg-background text-sm px-1 py-0.5"
              >
                {months.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={month.getFullYear()}
                onChange={handleYearChange}
                className="rounded-md bg-background text-sm px-1 py-0.5"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setMonth(addMonths(month, 1))}
              className="rounded p-1 hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="font-medium text-gray-500">
                {d}
              </div>
            ))}
            {days.map((day) => (
              <button
                key={day.toISOString()}
                onClick={() => onChange(format(day, "yyyy-MM-dd"))}
                className={`rounded-lg px-2 py-1 text-sm hover:bg-gray-100 ${value && isSameDay(new Date(value), day)
                  ? "bg-black text-white"
                  : "text-gray-700"
                  }`}
              >
                {format(day, "d")}
              </button>
            ))}
          </div>
        </Popover.Panel>
      </Popover>
    </div>
  );
}

function FileInput({
  label,
  onChange,
  required,
  accept,
  multiple,
}: {
  label: string;
  onChange: (file: File | File[] | null) => void;
  required?: boolean;
  accept?: string;
  multiple?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>

      <input
        type="file"
        required={required}
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          const files = e.target.files;
          if (!files || files.length === 0) {
            onChange(null);
          } else {
            onChange(multiple ? Array.from(files) : files[0]);
          }
        }}
        className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white text-sm shadow-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
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

function Select({
  label,
  value,
  onChange,
  options,
  placeholder="Select"
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?:string
}) {
  return (
    <div className="text-sm">
      <span className="mb-1 block text-gray-700">{label}</span>

      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-black">
            {value || placeholder}
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Listbox.Button>

          <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg focus:outline-none">
            {options.map((o) => (
              <Listbox.Option
                key={o}
                value={o}
                className="cursor-pointer select-none px-3 py-2 text-sm text-gray-700 ui-active:bg-gray-100"
              >
                {({ selected }) => (
                  <div className="flex items-center justify-between">
                    <span>{o}</span>
                    {selected && <Check className="h-4 w-4 text-gray-600" />}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
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
          <button type="button" key={opt} onClick={() => toggle(opt)} className={classNames("rounded-full border px-3 py-1 text-sm", values?.includes(opt) ? "bg-black text-white" : "")}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

function MultiCheckboxWithObject({ label, options, values, onChange }: {
  label: string; options: {
    id: string;
    name: string;
  }[]; values: any[]; onChange: (next: string[]) => void
}) {
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
          <button type="button" key={opt.id} onClick={() => toggle(opt.id)} className={classNames("rounded-full border px-3 py-1 text-sm", values?.includes(opt.id) ? "bg-black text-white" : "")}>{opt.name}</button>
        ))}
      </div>
    </div>
  );
}

function MultiSelect({
  label,
  options,
  values,
  onChange,
  placeholder="Select..."
}: {
  label: string;
  options: { id: string; name: string }[];
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?:string;
}) {
  function toggle(val: string) {
    const set = new Set(values);
    set.has(val) ? set.delete(val) : set.add(val);
    onChange(Array.from(set));
  }

  return (
    <div className="text-sm">
      <span className="mb-1 block text-gray-700">{label}</span>
      <Listbox value={values} onChange={onChange} multiple>
        <div className="relative">
          <Listbox.Button className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20">
            {values?.length
              ? options
                .filter((o) => values.includes(o.id))
                .map((o) => o.name)
                .join(", ")
              : placeholder}
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg focus:outline-none">
            {options.map((opt) => (
              <Listbox.Option key={opt.id} value={opt.id}>
                {({ selected }) => (
                  <div className="flex items-center justify-between px-3 py-2 text-sm">
                    <span>{opt.name}</span>
                    {selected && <Check className="h-4 w-4 text-black" />}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}


function TagInput({ label, value, onChange, placeholder,hint="" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string,hint?:string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-700">{label}</span>
      <input className="w-full rounded-xl border px-3 py-2 outline-none focus:border-black" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      <span className="mt-1 block text-xs text-gray-500">{hint}</span>
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
