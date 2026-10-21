import { connection, NextResponse } from "next/server";
import { getGovernmentCommitments } from "@/lib/motions";

export async function GET() {
  await connection();
  try {
    return NextResponse.json(
      { commitments: await getGovernmentCommitments() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("Regeringstoezeggingen konden niet worden opgehaald.", error);
    return NextResponse.json(
      { error: "De regeringstoezeggingen konden niet worden opgehaald." },
      { status: 502 },
    );
  }
}
