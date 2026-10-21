import { connection, NextResponse } from "next/server";
import { getMemberProfiles } from "@/lib/motions";

export async function GET(request: Request) {
  await connection();
  const ids = new URL(request.url).searchParams.get("ids")?.split(",") ?? [];
  try {
    return NextResponse.json(
      { members: await getMemberProfiles(ids) },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch (error) {
    console.error("Kamerlidprofielen konden niet worden opgehaald.", error);
    return NextResponse.json(
      { error: "De profielen van Kamerleden konden niet worden opgehaald." },
      { status: 502 },
    );
  }
}
