import { connection, NextResponse } from "next/server";
import { getManifestoScores } from "@/lib/manifestos";

export async function GET() {
  await connection();
  try {
    return NextResponse.json({ scores: await getManifestoScores() });
  } catch (error) {
    console.error("Manifesto's konden niet worden verwerkt.", error);
    return NextResponse.json(
      { error: "De verkiezingsprogramma's konden niet worden verwerkt." },
      { status: 500 },
    );
  }
}
