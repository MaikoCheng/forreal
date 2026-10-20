import { NextResponse } from "next/server";
import { getMotions } from "@/lib/motions";

export async function GET() {
  try {
    const startOfYear = `${new Date().getFullYear()}-01-01T00:00:00Z`;
    return NextResponse.json({ motions: await getMotions(startOfYear) });
  } catch {
    return NextResponse.json(
      { error: "De Tweede Kamer API kon niet worden bereikt." },
      { status: 502 },
    );
  }
}
