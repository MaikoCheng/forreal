export type Motion = {
  id: string;
  number: string;
  subject: string;
  startedAt: string | null;
  status: string | null;
  meetingYear: string | null;
};

type ODataResponse<T> = {
  value: T[];
  "@odata.nextLink"?: string;
};

type ApiMotion = {
  Id: string;
  Nummer: string;
  Onderwerp: string | null;
  GestartOp: string | null;
  Status: string | null;
  Vergaderjaar: string | null;
};

const defaultApiUrl = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0";

export async function getMotions(startOfYear: string): Promise<Motion[]> {
  const apiUrl = process.env.TWEEDEKAMER_API_URL ?? defaultApiUrl;
  const query = new URLSearchParams({
    $filter: `Soort eq 'Motie' and Verwijderd eq false and GestartOp ge ${startOfYear}`,
    $orderby: "GestartOp desc",
    $top: "250",
    $select: "Id,Nummer,Onderwerp,GestartOp,Status,Vergaderjaar",
  });
  let nextUrl: string | undefined = `${apiUrl.replace(/\/$/, "")}/Zaak?${query}`;
  const motions: Motion[] = [];

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Tweede Kamer API returned ${response.status}`);
    }

    const data = (await response.json()) as ODataResponse<ApiMotion>;
    motions.push(...data.value.map((motion) => ({
      id: motion.Id,
      number: motion.Nummer,
      subject: motion.Onderwerp ?? "Onderwerp niet beschikbaar",
      startedAt: motion.GestartOp,
      status: motion.Status,
      meetingYear: motion.Vergaderjaar,
    })));
    nextUrl = data["@odata.nextLink"];
  }

  return motions;
}

export function formatMotionDate(value: string | null): string {
  if (!value) return "Datum onbekend";

  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
