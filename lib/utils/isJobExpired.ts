import dayjs from "dayjs";

export type ExpirableJob = {
  status?: string | null;
  ends_at?: string | null;
  expires_at?: string | null;
};

export function isJobExpired(job?: ExpirableJob | null): boolean {
  if (!job) return false;


  if (job.status === "expired" || job.status === "closed") {
    return true;
  }
  const expiryDate = job.expires_at ?? job.ends_at;

  if (!expiryDate) return false;

  return dayjs(expiryDate).isBefore(dayjs());
}
