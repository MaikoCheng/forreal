import type { Motion } from "./motions";

const motionsRequests = new Map<string, Promise<Motion[]>>();
const motionCacheTtl = 5 * 60 * 1000;

export function getCachedMotions(from?: string): Promise<Motion[]> {
  const cacheKey = from ?? "default";
  const existingRequest = motionsRequests.get(cacheKey);
  if (existingRequest) return existingRequest;
  const query = from ? `?from=${encodeURIComponent(from)}` : "";
  const storageKey = `forreal-motions:${cacheKey}`;
  if (typeof window !== "undefined") {
    const cached = window.sessionStorage.getItem(storageKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as { cachedAt: number; motions: Motion[] };
        if (Date.now() - parsed.cachedAt < motionCacheTtl) {
          const cachedRequest = Promise.resolve(parsed.motions);
          motionsRequests.set(cacheKey, cachedRequest);
          return cachedRequest;
        }
        window.sessionStorage.removeItem(storageKey);
      } catch {
        window.sessionStorage.removeItem(storageKey);
      }
    }
  }
  const motionsRequest = fetch(`/api/motions${query}`)
    .then(async (response) => {
      if (!response.ok) throw new Error("Motion request failed");
      return response.json() as Promise<{ motions: Motion[] }>;
    })
    .then((data) => {
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(storageKey, JSON.stringify({
            cachedAt: Date.now(),
            motions: data.motions,
          }));
        } catch {
          // Session storage can be unavailable or full; the network result remains valid.
        }
      }
      return data.motions;
    });
  motionsRequests.set(cacheKey, motionsRequest);
  return motionsRequest;
}
