import apiClient from "@/lib/config/axios-client";

export type LocationKind = "city" | "state" | "country" | "street" | "postal";
export type LocationSuggestion =
  | { label: string; kind: LocationKind }
  | { label: string; kind: LocationKind; lat: number; lng: number };

type Options = { limit?: number; onlyOpen?: boolean; withCoords?: boolean };

export async function fetchLocationSuggestions(
  q: string,
  opts: Options = {},
  signal?: AbortSignal
): Promise<LocationSuggestion[]> {
  const params: Record<string, string | number> = { q };
  if (opts.limit) params.limit = opts.limit;
  if (opts.onlyOpen === false) params.onlyOpen = "0";
  if (opts.withCoords) params.withCoords = "1";

  const res = await apiClient.get("/jobs/location-suggestions", { params, signal });


  const items = res?.data?.data?.items ?? [];
  return items as LocationSuggestion[];
}