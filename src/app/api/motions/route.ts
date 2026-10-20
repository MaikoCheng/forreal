import { NextResponse } from "next/server";
import { getMotions } from "@/lib/motions";

export async function GET() {
  try {
    return NextResponse.json({ motions: await getMotions() });
  } catch {
    return NextResponse.json(
      { error: "De Tweede Kamer API kon niet worden bereikt." },
      { status: 502 },
    );
  }
}
