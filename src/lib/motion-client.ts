import type { Motion } from "./motions";

const motionsRequests = new Map<string, Promise<Motion[]>>();
const cabinetMotionsRequests = new Map<string, Promise<Motion[]>>();
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
          // The network result remains valid when session storage is unavailable.
        }
      }
      return data.motions;
    });
  motionsRequests.set(cacheKey, motionsRequest);
  return motionsRequest;
}

export function getCachedCabinetMotions(from: string): Promise<Motion[]> {
  const existingRequest = cabinetMotionsRequests.get(from);
  if (existingRequest) return existingRequest;
  const storageKey = `forreal-cabinet-motions:v2:${from}`;
  if (typeof window !== "undefined") {
    const cached = window.sessionStorage.getItem(storageKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as { cachedAt: number; motions: Motion[] };
        if (Date.now() - parsed.cachedAt < motionCacheTtl) {
          const cachedRequest = Promise.resolve(parsed.motions);
          cabinetMotionsRequests.set(from, cachedRequest);
          return cachedRequest;
        }
        window.sessionStorage.removeItem(storageKey);
      } catch {
        window.sessionStorage.removeItem(storageKey);
      }
    }
  }
  const request = fetch(`/api/cabinet-motions?from=${encodeURIComponent(from)}&v=2`)
    .then(async (response) => {
      if (!response.ok) throw new Error("Cabinet motion request failed");
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
          // The network result remains valid when session storage is unavailable.
        }
      }
      return data.motions;
    });
  cabinetMotionsRequests.set(from, request);
  return request;
}
