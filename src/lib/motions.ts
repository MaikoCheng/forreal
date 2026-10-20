export type Motion = {
  id: string;
  number: string;
  subject: string;
  startedAt: string | null;
  status: string | null;
  meetingYear: string | null;
};

export type MotionVote = {
  party: string;
  stance: "Voor" | "Tegen";
};

export type MotionDetail = Motion & {
  votes: MotionVote[];
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

type ApiVote = {
  Soort: string | null;
  ActorFractie: string | null;
  ActorNaam: string | null;
};

type ApiDecision = {
  BesluitSoort: string | null;
  Stemming?: ApiVote[];
};

const defaultApiUrl = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0";

export async function getMotions(startOfYear: string): Promise<Motion[]> {
  const apiUrl = process.env.TWEEDEKAMER_API_URL ?? defaultApiUrl;
  const motions: Motion[] = [];
  const pageSize = 250;
  let skip = 0;

  while (true) {
    const query = new URLSearchParams({
      $filter: `Soort eq 'Motie' and Verwijderd eq false and GestartOp ge ${startOfYear}`,
      $orderby: "GestartOp desc",
      $top: String(pageSize),
      $skip: String(skip),
      $select: "Id,Nummer,Onderwerp,GestartOp,Status,Vergaderjaar",
    });
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/Zaak?${query}`, {
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
    if (data.value.length < pageSize) break;
    skip += pageSize;
  }

  return motions;
}

export async function getMotionDetail(id: string): Promise<MotionDetail> {
  const apiUrl = process.env.TWEEDEKAMER_API_URL ?? defaultApiUrl;
  const query = new URLSearchParams({
    $expand: "Besluit($expand=Stemming)",
  });
  const response = await fetch(
    `${apiUrl.replace(/\/$/, "")}/Zaak(${id})?${query}`,
    { next: { revalidate: 60 }, headers: { Accept: "application/json" } },
  );

  if (!response.ok) {
    throw new Error(`Tweede Kamer API returned ${response.status}`);
  }

  const motion = (await response.json()) as ApiMotion & { Besluit?: ApiDecision[] };
  const votes = (motion.Besluit ?? [])
    .filter((decision) => decision.BesluitSoort?.startsWith("Stemmen"))
    .flatMap((decision) => decision.Stemming ?? [])
    .flatMap((vote): MotionVote[] => {
      const party = vote.ActorFractie ?? vote.ActorNaam;
      if (!party || vote.Soort === null) return [];
      if (vote.Soort === "Voor") return [{ party, stance: "Voor" as const }];
      if (vote.Soort === "Tegen") return [{ party, stance: "Tegen" as const }];
      return [];
    });

  return {
    id: motion.Id,
    number: motion.Nummer,
    subject: motion.Onderwerp ?? "Onderwerp niet beschikbaar",
    startedAt: motion.GestartOp,
    status: motion.Status,
    meetingYear: motion.Vergaderjaar,
    votes,
  };
}

export function formatMotionDate(value: string | null): string {
  if (!value) return "Datum onbekend";

  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
