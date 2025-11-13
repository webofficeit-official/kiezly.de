export type StepId =
  | "basic"
  | "details"
  | "location"
  | "pricing"
  | "work"
  | "contact";

export type StepDef = {
  id: StepId;
  index: number;
  titleKey: string;
  descKey: string;
  to: (slug?: string) => string;
};

export const STEPS: StepDef[] = [
  {
    id: "basic",
    index: 1,
    titleKey: "basic.header.title",
    descKey: "basic.header.description",
    to: (slug?: string) =>
      slug ? `/post-job/basic-details?slug=${slug}` : `/post-job/basic-details`,
  },
  {
    id: "details",
    index: 2,
    titleKey: "details.header.title",
    descKey: "details.header.sidebar_description",
    to: (slug) => `/post-job/job-details?slug=${slug}`,
  },
  {
    id: "location",
    index: 3,
    titleKey: "location.header.title",
    descKey: "location.header.sidebar_description",
    to: (slug) => `/post-job/location-details?slug=${slug}`,
  },
  {
    id: "pricing",
    index: 4,
    titleKey: "pricing.header.title",
    descKey: "pricing.header.description",
    to: (slug) => `/post-job/pricing-details?slug=${slug}`,
  },
  {
    id: "work",
    index: 5,
    titleKey: "work.header.title",
    descKey: "work.header.sidebar_description",
    to: (slug) => `/post-job/work-details?slug=${slug}`,
  },
  {
    id: "contact",
    index: 6,
    titleKey: "contact.header.title",
    descKey: "contact.header.description",
    to: (slug) => `/post-job/contact-details?slug=${slug}`,
  },
];
