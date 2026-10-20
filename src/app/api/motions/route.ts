import { NextResponse } from "next/server";

const defaultApiUrl = "https://gegevens.tweedekamer.nl/OData/v4/2.0";

export async function GET() {
  const apiUrl = process.env.TWEEDEKAMER_API_URL ?? defaultApiUrl;
  const endpoint = `${apiUrl.replace(/\/$/, "")}/Moties?$top=20&$orderby=Datum%20desc`;

  try {
    const response = await fetch(endpoint, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "De Tweede Kamer API is tijdelijk niet beschikbaar." },
        { status: response.status },
      );
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json(
      { error: "De Tweede Kamer API kon niet worden bereikt." },
      { status: 502 },
    );
  }
}
