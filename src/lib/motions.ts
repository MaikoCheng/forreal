export type Motion = {
  id: string;
  number: string;
  subject: string;
  startedAt: string | null;
  status: string | null;
  meetingYear: string | null;
  hasVote: boolean;
  outcome: "Aangenomen" | "Niet aangenomen" | "Nog niet gestemd";
  submittingParties: string[];
  submittingMembers: MotionMember[];
  votes: MotionVote[];
};

export type MotionMember = {
  personId: string;
  name: string;
  party: string | null;
};

export type MotionVote = {
  personId: string | null;
  name: string | null;
  party: string;
  stance: "Voor" | "Tegen" | "Niet deelgenomen";
};

export type MotionDetail = Motion & {
  submittingParties: string[];
  votes: MotionVote[];
  text: string;
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
  Besluit?: ApiDecision[];
  Document?: ApiDocument[];
  ZaakActor?: ApiZaakActor[];
};

type ApiVote = {
  Soort: string | null;
  ActorFractie: string | null;
  ActorNaam: string | null;
  Persoon_Id: string | null;
};

type ApiDecision = {
  BesluitSoort: string | null;
  Stemming?: ApiVote[];
};

type ApiDocument = {
  Soort: string | null;
  DocumentNummer: string | null;
  HuidigeDocumentVersie?: {
    ExterneIdentifier: string | null;
  };
};

type ApiZaakActor = {
  ActorFractie: string | null;
  ActorNaam: string | null;
  Relatie: string | null;
  Persoon_Id: string | null;
};

const defaultApiUrl = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0";

function getOutcome(decisions: ApiDecision[] | undefined): Motion["outcome"] {
  const vote = decisions?.find((decision) => decision.BesluitSoort?.startsWith("Stemmen"));
  if (!vote) return "Nog niet gestemd";
  return vote.BesluitSoort?.toLocaleLowerCase("nl-NL").includes("aangenomen")
    ? "Aangenomen"
    : "Niet aangenomen";
}

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
      $expand: "Besluit($select=BesluitSoort;$expand=Stemming($select=Soort,ActorFractie,ActorNaam,Persoon_Id)),ZaakActor($select=ActorFractie,ActorNaam,Relatie,Persoon_Id)",
    });
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/Zaak?${query}`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Tweede Kamer API returned ${response.status}`);
    }

    const data = (await response.json()) as ODataResponse<ApiMotion>;
    motions.push(...data.value.map((motion) => {
      const votes = (motion.Besluit ?? [])
        .filter((decision) => decision.BesluitSoort?.startsWith("Stemmen"))
        .flatMap((decision) => decision.Stemming ?? [])
        .flatMap((vote): MotionVote[] => {
          const party = vote.ActorFractie ?? vote.ActorNaam;
          if (!party || vote.Soort === null) return [];
          const stance = normalizeVoteStance(vote.Soort);
          return stance
            ? [{ party, personId: vote.Persoon_Id, name: vote.ActorNaam, stance }]
            : [];
        });
      const submittingMembers = getSubmittingMembers(motion.ZaakActor);
      return {
        id: motion.Id,
        number: motion.Nummer,
        subject: motion.Onderwerp ?? "Onderwerp niet beschikbaar",
        startedAt: motion.GestartOp,
        status: motion.Status,
        meetingYear: motion.Vergaderjaar,
        hasVote: (motion.Besluit ?? []).some((decision) => decision.BesluitSoort?.startsWith("Stemmen")),
        outcome: getOutcome(motion.Besluit),
        submittingParties: [...new Set(
          (motion.ZaakActor ?? [])
            .flatMap((actor) => actor.Relatie === "Indiener" && actor.ActorFractie
              ? [actor.ActorFractie]
              : []),
        )],
        submittingMembers,
        votes,
      };
    }));
    if (data.value.length < pageSize) break;
    skip += pageSize;
  }

  return motions;
}

export async function getMotionDetail(id: string): Promise<MotionDetail> {
  const apiUrl = process.env.TWEEDEKAMER_API_URL ?? defaultApiUrl;
  const query = new URLSearchParams({
    $select: "Id,Nummer,Onderwerp,GestartOp,Status,Vergaderjaar",
    $expand: "Besluit($select=BesluitSoort;$expand=Stemming($select=Soort,ActorFractie,ActorNaam,Persoon_Id)),Document($select=Soort,DocumentNummer;$expand=HuidigeDocumentVersie($select=ExterneIdentifier)),ZaakActor($select=ActorFractie,ActorNaam,Relatie,Persoon_Id)",
  });
  const response = await fetch(
    `${apiUrl.replace(/\/$/, "")}/Zaak(${id})?${query}`,
    {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!response.ok) {
    throw new Error(`Tweede Kamer API returned ${response.status}`);
  }

  const motion = (await response.json()) as ApiMotion;
  const votes = (motion.Besluit ?? [])
    .filter((decision) => decision.BesluitSoort?.startsWith("Stemmen"))
    .flatMap((decision) => decision.Stemming ?? [])
    .flatMap((vote): MotionVote[] => {
      const party = vote.ActorFractie ?? vote.ActorNaam;
      if (!party || vote.Soort === null) return [];
      const stance = normalizeVoteStance(vote.Soort);
      return stance
        ? [{ party, personId: vote.Persoon_Id, name: vote.ActorNaam, stance }]
        : [];
    });
  const outcome = getOutcome(motion.Besluit);
  const submittingParties = [...new Set(
    (motion.ZaakActor ?? [])
      .flatMap((actor) => actor.Relatie === "Indiener" && actor.ActorFractie
        ? [actor.ActorFractie]
        : []),
  )];
  const submittingMembers = getSubmittingMembers(motion.ZaakActor);
  const document = motion.Document?.find((item) => item.Soort === "Motie");
  const text = document?.DocumentNummer
    ? await getMotionText(document.DocumentNummer, {
        Nummer: motion.Nummer,
        Onderwerp: motion.Onderwerp,
        submittingParties,
        externalIdentifier: document.HuidigeDocumentVersie?.ExterneIdentifier,
      })
    : "De tekst van deze motie is niet beschikbaar.";

  return {
    id: motion.Id,
    number: motion.Nummer,
    subject: motion.Onderwerp ?? "Onderwerp niet beschikbaar",
    startedAt: motion.GestartOp,
    status: motion.Status,
    meetingYear: motion.Vergaderjaar,
    hasVote: votes.length > 0 || outcome !== "Nog niet gestemd",
    outcome,
    submittingParties,
    submittingMembers,
    votes,
    text,
  };
}

function normalizeVoteStance(value: string): MotionVote["stance"] | null {
  const normalized = value.toLocaleLowerCase("nl-NL");
  if (normalized === "voor") return "Voor";
  if (normalized === "tegen") return "Tegen";
  if (normalized.includes("afwezig") || normalized.includes("niet deelgenomen")) {
    return "Niet deelgenomen";
  }
  return null;
}

function getSubmittingMembers(actors: ApiZaakActor[] | undefined): MotionMember[] {
  return [...new Map(
    (actors ?? [])
      .filter((actor) => actor.Relatie === "Indiener" && actor.Persoon_Id && actor.ActorNaam)
      .map((actor) => [
        actor.Persoon_Id as string,
        {
          personId: actor.Persoon_Id as string,
          name: actor.ActorNaam as string,
          party: actor.ActorFractie,
        },
      ]),
  ).values()];
}

async function getMotionText(
  documentNumber: string,
  motion: Pick<ApiMotion, "Nummer" | "Onderwerp"> & {
    submittingParties: string[];
    externalIdentifier: string | null | undefined;
  },
): Promise<string> {
  const logContext = {
    documentNumber,
    motionNumber: motion.Nummer,
    subject: motion.Onderwerp ?? "Onderwerp niet beschikbaar",
    submittingParties: motion.submittingParties,
  };

  const urls = [
    ...(motion.externalIdentifier
      ? [`https://zoek.officielebekendmakingen.nl/${encodeURIComponent(motion.externalIdentifier)}.pdf`]
      : []),
    `https://www.tweedekamer.nl/downloads/document?id=${encodeURIComponent(documentNumber)}`,
  ];

  for (const [index, url] of urls.entries()) {
    try {
      const response = await fetch(url, {
        next: { revalidate: 3600 },
        headers: { Accept: "application/pdf" },
        signal: AbortSignal.timeout(15_000),
      });
      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
      if (!response.ok || !contentType.includes("pdf")) {
        const log = {
          ...logContext,
          url,
          status: response.status,
          statusText: response.statusText,
          contentType: contentType || "onbekend",
        };
        if (index < urls.length - 1) {
          console.warn("Primaire motiedocument-URL is niet beschikbaar; fallback wordt geprobeerd.", log);
        } else {
          console.error("Motiedocument kon niet als PDF worden opgehaald.", log);
        }
        continue;
      }

    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: Buffer.from(await response.arrayBuffer()) });
    try {
      const result = await parser.getText();
      const text = result.text.replace(/\r\n/g, "\n").trim();
      const motionStart = text.search(/\bDe\s+kamer\b/i);
      const motionText = (motionStart >= 0 ? text.slice(motionStart) : text)
        .replace(/\s*KST-[\s\S]*$/i, "")
        .replace(/^\s*--\s*\d+\s+of\s+\d+\s*--\s*$/gmi, "")
        .trim();
      if (!motionText) {
        console.error("PDF bevat geen herkenbare motietekst.", logContext);
      }
      return motionText || "De tekst van deze motie is niet beschikbaar.";
    } finally {
      await parser.destroy();
    }
    } catch (error) {
      if (error instanceof DOMException && error.name === "TimeoutError") {
        console.error("Ophalen van motietekst duurde te lang.", { ...logContext, url, error });
      } else {
        console.error("Motiedocument kon niet worden verwerkt.", { ...logContext, url, error });
      }
      if (index === urls.length - 1) {
        return "De tekst van deze motie kon niet worden opgehaald.";
      }
    }
  }

  return "De tekst van deze motie kon niet worden opgehaald.";
}

export function formatMotionDate(value: string | null): string {
  if (!value) return "Datum onbekend";

  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
