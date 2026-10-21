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
  Datum: string | null;
  Vergaderjaar: string | null;
  Besluit?: ApiDecision[];
  Document?: ApiDocument[];
  ZaakActor?: ApiZaakActor[];
};

type ApiVote = {
  Soort: string | null;
  FractieNaam: string | null;
  Naam: string | null;
  Persoon_Id: string | null;
};

type ApiDecision = {
  Soort: string | null;
  Tekst: string | null;
  Stemming?: ApiVote[];
};

type ApiDocument = {
  Soort: string | null;
  Nummer: string | null;
  HuidigeDocumentVersie?: {
    ExterneIdentifier: string | null;
  };
};

type ApiZaakActor = {
  FractieNaam: string | null;
  Naam: string | null;
  Rol: string | null;
  Persoon_Id: string | null;
};

const defaultApiUrl = "https://gegevensmagazijn.tweedekamer.nl/OData/v5";

function isVotingDecision(decision: ApiDecision): boolean {
  const type = decision.Soort?.toLocaleLowerCase("nl-NL") ?? "";
  return type.startsWith("stemmen") || type.startsWith("stemming");
}

function getOutcome(decisions: ApiDecision[] | undefined): Motion["outcome"] {
  const vote = decisions?.find(isVotingDecision);
  if (!vote) return "Nog niet gestemd";
  return `${vote.Soort ?? ""} ${vote.Tekst ?? ""}`.toLocaleLowerCase("nl-NL").includes("aangenomen")
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
      $filter: `Soort eq 'Motie' and Verwijderd eq false and Datum ge ${startOfYear}`,
      $orderby: "Datum desc",
      $top: String(pageSize),
      $skip: String(skip),
      $select: "Id,Nummer,Onderwerp,Datum,Vergaderjaar",
      $expand: "Besluit($select=Soort,Tekst;$expand=Stemming($select=Soort,FractieNaam,Naam,Persoon_Id)),ZaakActor($select=FractieNaam,Naam,Rol,Persoon_Id)",
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
        .filter(isVotingDecision)
        .flatMap((decision) => decision.Stemming ?? [])
        .flatMap((vote): MotionVote[] => {
          const party = vote.FractieNaam ?? vote.Naam;
          if (!party || vote.Soort === null) return [];
          const stance = normalizeVoteStance(vote.Soort);
          return stance
            ? [{ party, personId: vote.Persoon_Id, name: vote.Naam, stance }]
            : [];
        });
      const submittingMembers = getSubmittingMembers(motion.ZaakActor);
      return {
        id: motion.Id,
        number: motion.Nummer,
        subject: motion.Onderwerp ?? "Onderwerp niet beschikbaar",
        startedAt: motion.Datum,
        status: null,
        meetingYear: motion.Vergaderjaar,
        hasVote: (motion.Besluit ?? []).some(isVotingDecision),
        outcome: getOutcome(motion.Besluit),
        submittingParties: [...new Set(
          (motion.ZaakActor ?? [])
            .flatMap((actor) => actor.Rol === "Indiener" && actor.FractieNaam
              ? [actor.FractieNaam]
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
    $select: "Id,Nummer,Onderwerp,Datum,Vergaderjaar",
    $expand: "Besluit($select=Soort,Tekst;$expand=Stemming($select=Soort,FractieNaam,Naam,Persoon_Id)),Document($select=Soort,Nummer;$expand=HuidigeDocumentVersie($select=ExterneIdentifier)),ZaakActor($select=FractieNaam,Naam,Rol,Persoon_Id)",
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
    .filter(isVotingDecision)
    .flatMap((decision) => decision.Stemming ?? [])
    .flatMap((vote): MotionVote[] => {
      const party = vote.FractieNaam ?? vote.Naam;
      if (!party || vote.Soort === null) return [];
      const stance = normalizeVoteStance(vote.Soort);
      return stance
        ? [{ party, personId: vote.Persoon_Id, name: vote.Naam, stance }]
        : [];
    });
  const outcome = getOutcome(motion.Besluit);
  const submittingParties = [...new Set(
    (motion.ZaakActor ?? [])
      .flatMap((actor) => actor.Rol === "Indiener" && actor.FractieNaam
        ? [actor.FractieNaam]
        : []),
  )];
  const submittingMembers = getSubmittingMembers(motion.ZaakActor);
  const document = motion.Document?.find((item) =>
    item.Soort?.toLocaleLowerCase("nl-NL").startsWith("motie"),
  );
  const text = document?.Nummer
      ? await getMotionText(document.Nummer, {
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
    startedAt: motion.Datum,
    status: null,
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
      .filter((actor) => actor.Rol === "Indiener" && actor.Persoon_Id && actor.Naam)
      .map((actor) => [
        actor.Persoon_Id as string,
        {
          personId: actor.Persoon_Id as string,
          name: actor.Naam as string,
          party: actor.FractieNaam,
        },
      ]),
  ).values()];
}

async function extractPdfText(data: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const { getData: getPdfWorkerData } = await import(/* webpackIgnore: true */ "pdf-parse/worker");
  PDFParse.setWorker(getPdfWorkerData());
  const parser = new PDFParse({ data });
  try {
    return (await parser.getText()).text;
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(data: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  return (await mammoth.extractRawText({ buffer: data })).value;
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
      const isPdf = contentType.includes("pdf");
      const isDocx = contentType.includes("wordprocessingml.document");
      if (!response.ok || (!isPdf && !isDocx)) {
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
          console.error("Motiedocument kon niet als PDF of DOCX worden opgehaald.", log);
        }
        continue;
      }

      const documentData = Buffer.from(await response.arrayBuffer());
      const rawText = isPdf
        ? await extractPdfText(documentData)
        : await extractDocxText(documentData);
      const text = rawText.replace(/\r\n/g, "\n").trim();
      const motionStart = text.search(/\bDe\s+kamer\b/i);
      const motionText = (motionStart >= 0 ? text.slice(motionStart) : text)
        .replace(/\s*KST-[\s\S]*$/i, "")
        .replace(/^\s*--\s*\d+\s+of\s+\d+\s*--\s*$/gmi, "")
        .trim();
      if (!motionText) {
        console.error("Document bevat geen herkenbare motietekst.", logContext);
      }
      return motionText || "De tekst van deze motie is niet beschikbaar.";
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
