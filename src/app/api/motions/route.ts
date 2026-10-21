import { connection, NextResponse } from "next/server";
import { getMotions } from "@/lib/motions";

export async function GET(request: Request) {
  await connection();
  try {
    const requestedStart = new URL(request.url).searchParams.get("from");
    const startOfYear = requestedStart && /^\d{4}-\d{2}-\d{2}$/.test(requestedStart)
      ? `${requestedStart}T00:00:00Z`
      : `${new Date().getFullYear()}-01-01T00:00:00Z`;
    return NextResponse.json(
      { motions: await getMotions(startOfYear) },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "De Tweede Kamer API kon niet worden bereikt." },
      { status: 502 },
    );
  }
}
