import { connection, NextResponse } from "next/server";
import { getCabinetMotions } from "@/lib/motions";

const responseCache = new Map<string, { expiresAt: number; value: Awaited<ReturnType<typeof getCabinetMotions>> | Promise<Awaited<ReturnType<typeof getCabinetMotions>>> }>();
const cacheDuration = 10 * 60 * 1000;

export async function GET(request: Request) {
  await connection();
  const requestedStart = new URL(request.url).searchParams.get("from");
  const startDate = requestedStart && /^\d{4}-\d{2}-\d{2}$/.test(requestedStart)
    ? requestedStart
    : "2026-02-23";
  try {
    const startOfYear = `${startDate}T00:00:00Z`;
    const cached = responseCache.get(startDate);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({ motions: await cached.value }, {
        headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
      });
    }
    const requestPromise = getCabinetMotions(startOfYear);
    responseCache.set(startDate, { expiresAt: Date.now() + cacheDuration, value: requestPromise });
    return NextResponse.json({ motions: await requestPromise }, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
    });
  } catch {
    responseCache.delete(startDate);
    return NextResponse.json(
      { error: "De kabinetstemmingen konden niet worden opgehaald." },
      { status: 502 },
    );
  }
}
