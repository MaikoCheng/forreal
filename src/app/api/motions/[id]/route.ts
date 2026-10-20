import { NextResponse } from "next/server";
import { getMotionDetail } from "@/lib/motions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Ongeldig motie-id." }, { status: 400 });
  }

  try {
    return NextResponse.json(await getMotionDetail(id));
  } catch {
    return NextResponse.json(
      { error: "De details van deze motie konden niet worden opgehaald." },
      { status: 502 },
    );
  }
}
