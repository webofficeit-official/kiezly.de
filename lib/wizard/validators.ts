import { StepId } from "./steps";

export type Errors = Record<string, string>;
type T = (k: string) => string;
const trim = (v: unknown): string => {
  if (typeof v === "string") return v.trim();
  if (v === null || v === undefined) return "";
  return String(v).trim();
};
const isBlank = (v: unknown) => trim(v) === "";
const toNum = (v: unknown): number => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isNaN(n) ? NaN : n;
};
const toDate = (v: unknown): Date | null => {
  if (isBlank(v)) return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
};

export const validateBasic = (d: Record<string, any>, t: T): Errors => {
  const e: Errors = {};
  if (!d.title || d.title.trim() === "")
    e.title = t("basic.validation.title_required");
  else if (d.title.length < 8) e.title = t("basic.validation.title_min");
  if (!d.slug || d.slug.trim() === "")
    e.slug = t("basic.validation.slug_required");
  if (!d.category_id || d.category_id === "")
    e.category_id = t("basic.validation.category_required");
  return e;
};

export const validateDetails = (d: Record<string, any>, t: T): Errors => {
  const e: Errors = {};
  if (!d.description || d.description.trim() === "") {
    e.description = t("details.validation.description_required");
  } else {
    const text = d.description.replace(/<(.|\n)*?>/g, "").trim();
    if (!text) e.description = t("details.validation.description_empty");
  }
  return e;
};

export const validateLocation = (d: Record<string, any>, t: T): Errors => {
  const e: Errors = {};
  if (!d.country_id) e.country_id = t("location.validation.country_required");
  if (!trim(d.postal_code))
    e.postal_code = t("location.validation.postal_code_required");
  if (!trim(d.street)) e.street = t("location.validation.street_required");
  if (!trim(d.city)) e.city = t("location.validation.city_required");
  if (!trim(d.state)) e.state = t("location.validation.state_required");
  return e;
};
export const validatePricing = (d: Record<string, any>, t: T): Errors => {
  const e: Errors = {};

  // required selects
  if (isBlank(d.currency))
    e.currency = t("pricing.validation.currency_required");
  if (isBlank(d.price_type))
    e.price_type = t("pricing.validation.price_type_required");

  const type = String(d.price_type || "");

  if (type === "fixed") {
    const val = toNum(d.price_value);
    if (!(val > 0)) e.price_value = t("pricing.validation.fixed_gt_zero");
  }

  if (type === "range") {
    const min = toNum(d.price_min);
    const max = toNum(d.price_max);

    if (isBlank(d.price_min) || !(min >= 0)) {
      e.price_min = t("pricing.validation.min_gte_zero");
    }
    if (isBlank(d.price_max) || Number.isNaN(max) || max < min) {
      e.price_max = t("pricing.validation.max_gte_min");
    }
  }

  return e;
};
export const validateWork = (d: Record<string, any>, t: T): Errors => {
  const e: Errors = {};

  if (isBlank(d.work_mode)) e.work_mode = t("work.validation.work_mode_required");

  const start = toDate(d.starts_at);
  const end   = toDate(d.ends_at);

  if (!start) e.starts_at = t("work.validation.start_required");

  // only compare if both parse to valid dates
  if (start && end && end < start) {
    e.ends_at = t("work.validation.end_after_start");
  }

  return e;
};
export const validateContact = (d: Record<string, any>, t: T): Errors => {
  const e: Errors = {};

  const method = d.contact_method || d.contactMethod; // support either key naming
  if (!method) {
    e.contact_method = t("contact.validation.method_required");
    return e; // if no method, no need to check further
  }

  // ---------- Email ----------
  if (["email_relay", "direct_email"].includes(method)) {
    const email = (d.contact_email || "").trim();
    if (!email) {
      e.contact_email = t("contact.validation.email_required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        e.contact_email = t("contact.validation.email_invalid");
      }
    }
  }

  // ---------- Phone ----------
  if (method === "phone") {
    const phone = (d.contact_phone || "").trim();
    if (!phone) e.contact_phone = t("contact.validation.phone_required");
  }

  // ---------- External Link ----------
  if (method === "external_link") {
    const link = (d.contact_link || "").trim();
    if (!link) {
      e.contact_link = t("contact.validation.link_required");
    } else {
      try {
        const url = new URL(link);
        if (!["http:", "https:"].includes(url.protocol)) {
          e.contact_link = t("contact.validation.link_protocol");
        }
      } catch {
        e.contact_link = t("contact.validation.link_invalid");
      }
    }
  }

  return e;
};

export const validators: Record<
  StepId,
  (d: Record<string, any>, t: T) => Errors
> = {
  basic: validateBasic,
  details: validateDetails,
  location: validateLocation,
  pricing: validatePricing,
  work: validateWork,
  contact: validateContact,
};

// A simple helper you can use anywhere
export const isStepComplete = (step: StepId, d: Record<string, any>, t: T) =>
  Object.keys(validators[step](d, t)).length === 0;
