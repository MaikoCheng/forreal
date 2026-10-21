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

export type MemberProfile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  education: Array<{ title: string | null; institution: string | null; place: string | null; from: string | null; to: string | null }>;
  careers: Array<{ title: string | null; employer: string | null; place: string | null; from: string | null; to: string | null }>;
  secondaryFunctions: Array<{ description: string | null; from: string | null; to: string | null; type: string | null; explanation: string | null }>;
  travels: Array<{ purpose: string | null; destination: string | null; from: string | null; to: string | null; paidBy: string | null }>;
};

export type MotionDetail = Motion & {
  submittingParties: string[];
  votes: MotionVote[];
  text: string;
};

export type GovernmentCommitment = {
  id: string;
  number: string | null;
  activityNumber: string | null;
  createdAt: string | null;
  minister: string | null;
  ministerRole: string | null;
  ministry: string | null;
  status: string | null;
  dueDate: string | null;
  text: string | null;
  addressedTo: Array<{ personId: string; partyId: string; personName: string | null; partyName: string | null }>;
};

export type PaginationItem = number | "ellipsis";

export function getPaginationItems(totalPages: number, currentPage: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sortedPages = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  return sortedPages.flatMap((page, index) => {
    const previousPage = sortedPages[index - 1];
    return index > 0 && page - previousPage > 1
      ? ["ellipsis" as const, page]
      : [page];
  });
}

type ODataResponse<T> = {
  value: T[];
  "@odata.nextLink"?: string;
};

type ApiPerson = {
  Id: string;
  Voornamen: string | null;
  Achternaam: string | null;
  Functie: string | null;
  Geboortedatum: string | null;
  Geboorteplaats: string | null;
};

type ApiCareer = {
  Persoon_Id: string;
  Functie: string | null;
  Werkgever: string | null;
  Plaats: string | null;
  Van: string | null;
  TotEnMet: string | null;
};

type ApiEducation = {
  Persoon_Id: string;
  OpleidingNL: string | null;
  Instelling: string | null;
  Plaats: string | null;
  Van: string | null;
  TotEnMet: string | null;
};

type ApiSecondaryFunction = {
  Persoon_Id: string;
  Omschrijving: string | null;
  Van: string | null;
  TotEnMet: string | null;
  Soort: string | null;
  Toelichting: string | null;
};

type ApiTravel = {
  Persoon_Id: string;
  Doel: string | null;
  Bestemming: string | null;
  Van: string | null;
  TotEnMet: string | null;
  BetaaldDoor: string | null;
};

type ApiCommitmentRecipient = {
  Toezegging_Id: string;
  Persoon_Id: string;
  Fractie_Id: string;
  Persoon?: { Voornamen: string | null; Achternaam: string | null };
  Fractie?: { Afkorting: string | null; NaamNL: string | null };
};

type ApiCommitment = {
  Id: string;
  Nummer: string | null;
  ActiviteitNummer: string | null;
  Aanmaakdatum: string | null;
  Voornaam: string | null;
  Achternaam: string | null;
  Functie: string | null;
  Ministerie: string | null;
  Status: string | null;
  DatumNakoming: string | null;
  Tekst: string | null;
  ToegezegdAan?: ApiCommitmentRecipient[];
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
const memberProfileCacheSeconds = 24 * 60 * 60;

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

export async function getCabinetMotions(startOfYear: string): Promise<Motion[]> {
  const apiUrl = process.env.TWEEDEKAMER_API_URL ?? defaultApiUrl;
  const cabinetParties = new Set(["CDA", "D66", "VVD"]);
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
      $expand: "Besluit($select=Soort,Tekst;$expand=Stemming($select=Soort,FractieNaam))",
    });
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/Zaak?${query}`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Tweede Kamer API returned ${response.status}`);

    const data = (await response.json()) as ODataResponse<ApiMotion>;
    motions.push(...data.value.map((motion) => {
      const votes = (motion.Besluit ?? [])
        .filter(isVotingDecision)
        .flatMap((decision) => decision.Stemming ?? [])
        .flatMap((vote): MotionVote[] => {
          if (!vote.FractieNaam || !cabinetParties.has(vote.FractieNaam) || vote.Soort === null) return [];
          const stance = normalizeVoteStance(vote.Soort);
          return stance
            ? [{ party: vote.FractieNaam, personId: null, name: null, stance }]
            : [];
        });
      return {
        id: motion.Id,
        number: motion.Nummer,
        subject: motion.Onderwerp ?? "Onderwerp niet beschikbaar",
        startedAt: motion.Datum,
        status: null,
        meetingYear: motion.Vergaderjaar,
        hasVote: (motion.Besluit ?? []).some(isVotingDecision),
        outcome: getOutcome(motion.Besluit),
        submittingParties: [],
        submittingMembers: [],
        votes,
      };
    }).filter((motion) => new Set(motion.votes.map((vote) => vote.stance)).size > 1));
    if (data.value.length < pageSize) break;
    skip += pageSize;
  }
  return motions;
}

export async function getMemberProfiles(personIds: string[]): Promise<MemberProfile[]> {
  const uniqueIds = [...new Set(personIds)]
    .filter((id) => /^[0-9a-f-]{36}$/i.test(id))
    .sort();
  if (uniqueIds.length === 0) return [];

  const apiUrl = process.env.TWEEDEKAMER_API_URL ?? defaultApiUrl;
  const baseUrl = apiUrl.replace(/\/$/, "");
  const request = async <T>(entity: string, query: URLSearchParams) => {
    const response = await fetch(`${baseUrl}/${entity}?${query}`, {
      next: { revalidate: memberProfileCacheSeconds },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(45_000),
    });
    if (!response.ok) throw new Error(`Tweede Kamer API returned ${response.status}`);
    return (await response.json() as ODataResponse<T>).value;
  };

  const chunks = Array.from({ length: Math.ceil(uniqueIds.length / 10) }, (_, index) =>
    uniqueIds.slice(index * 10, (index + 1) * 10),
  );
  const results: Array<[ApiPerson[], ApiCareer[], ApiEducation[], ApiSecondaryFunction[], ApiTravel[]]> = [];
  for (let index = 0; index < chunks.length; index += 2) {
    const batchResults = await Promise.all(chunks.slice(index, index + 2).map(async (ids) => {
      const filter = ids.map((id) => `Persoon_Id eq ${id}`).join(" or ");
      const personFilter = ids.map((id) => `Id eq ${id}`).join(" or ");
      const responses = await Promise.allSettled([
        request<ApiPerson>("Persoon", new URLSearchParams({
          $filter: personFilter,
          $select: "Id,Voornamen,Achternaam,Functie,Geboortedatum,Geboorteplaats",
        })),
        request<ApiCareer>("PersoonLoopbaan", new URLSearchParams({
          $filter: `${filter} and Verwijderd eq false`,
          $select: "Persoon_Id,Functie,Werkgever,Plaats,Van,TotEnMet",
          $orderby: "Persoon_Id,Volgorde",
        })),
        request<ApiEducation>("PersoonOnderwijs", new URLSearchParams({
          $filter: `${filter} and Verwijderd eq false`,
          $select: "Persoon_Id,OpleidingNL,Instelling,Plaats,Van,TotEnMet",
          $orderby: "Persoon_Id,Volgorde",
        })),
        request<ApiSecondaryFunction>("PersoonNevenfunctie", new URLSearchParams({
          $filter: `${filter} and Verwijderd eq false`,
          $select: "Persoon_Id,Omschrijving,Van,TotEnMet,Soort,Toelichting",
          $orderby: "Persoon_Id,Volgorde",
        })),
        request<ApiTravel>("PersoonReis", new URLSearchParams({
          $filter: `${filter} and Verwijderd eq false`,
          $select: "Persoon_Id,Doel,Bestemming,Van,TotEnMet,BetaaldDoor",
        })),
      ]);
      return responses.map((response, responseIndex) => {
        if (response.status === "fulfilled") return response.value;
        console.warn("Tweede Kamer-profieldeel kon niet worden opgehaald.", {
          entity: ["Persoon", "PersoonLoopbaan", "PersoonOnderwijs", "PersoonNevenfunctie", "PersoonReis"][responseIndex],
          ids,
          error: response.reason,
        });
        return [];
      }) as [
        ApiPerson[],
        ApiCareer[],
        ApiEducation[],
        ApiSecondaryFunction[],
        ApiTravel[],
      ];
    }));
    results.push(...batchResults);
  }
  const people = results.flatMap(([items]) => items);
  const careers = results.flatMap(([, items]) => items);
  const education = results.flatMap(([, , items]) => items);
  const secondaryFunctions = results.flatMap(([, , , items]) => items);
  const travels = results.flatMap(([, , , , items]) => items);

  return people.map((person) => ({
    id: person.Id,
    firstName: person.Voornamen,
    lastName: person.Achternaam,
    role: person.Functie,
    birthDate: person.Geboortedatum,
    birthPlace: person.Geboorteplaats,
    education: education.filter((item) => item.Persoon_Id === person.Id).map((item) => ({
      title: item.OpleidingNL,
      institution: item.Instelling,
      place: item.Plaats,
      from: item.Van,
      to: item.TotEnMet,
    })),
    careers: careers.filter((item) => item.Persoon_Id === person.Id).map((item) => ({
      title: item.Functie,
      employer: item.Werkgever,
      place: item.Plaats,
      from: item.Van,
      to: item.TotEnMet,
    })),
    secondaryFunctions: secondaryFunctions.filter((item) => item.Persoon_Id === person.Id).map((item) => ({
      description: item.Omschrijving,
      from: item.Van,
      to: item.TotEnMet,
      type: item.Soort,
      explanation: item.Toelichting,
    })),
    travels: travels
      .filter((item) => item.Persoon_Id === person.Id)
      .sort((first, second) => (second.Van ?? "").localeCompare(first.Van ?? ""))
      .map((item) => ({
        purpose: item.Doel,
        destination: item.Bestemming,
        from: item.Van,
        to: item.TotEnMet,
        paidBy: item.BetaaldDoor,
      })),
  }));
}

export async function getGovernmentCommitments(): Promise<GovernmentCommitment[]> {
  const apiUrl = process.env.TWEEDEKAMER_API_URL ?? defaultApiUrl;
  const baseUrl = apiUrl.replace(/\/$/, "");
  const commitments: ApiCommitment[] = [];
  const pageSize = 250;
  let skip = 0;

  while (true) {
    const query = new URLSearchParams({
      $filter: "Verwijderd eq false",
      $orderby: "Aanmaakdatum desc",
      $top: String(pageSize),
      $skip: String(skip),
      $select: "Id,Nummer,ActiviteitNummer,Aanmaakdatum,Voornaam,Achternaam,Functie,Ministerie,Status,DatumNakoming,Tekst",
      $expand: "ToegezegdAan($select=Toezegging_Id,Persoon_Id,Fractie_Id;$expand=Persoon($select=Voornamen,Achternaam),Fractie($select=Afkorting,NaamNL))",
    });
    const response = await fetch(`${baseUrl}/Toezegging?${query}`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(45_000),
    });
    if (!response.ok) {
      throw new Error(`Tweede Kamer API returned ${response.status}`);
    }
    const data = await response.json() as ODataResponse<ApiCommitment>;
    commitments.push(...data.value);
    if (data.value.length < pageSize) break;
    skip += pageSize;
  }

  return commitments.map((commitment) => ({
    id: commitment.Id,
    number: commitment.Nummer,
    activityNumber: commitment.ActiviteitNummer,
    createdAt: commitment.Aanmaakdatum,
    minister: [commitment.Voornaam, commitment.Achternaam].filter(Boolean).join(" ") || null,
    ministerRole: commitment.Functie,
    ministry: commitment.Ministerie,
    status: commitment.Status,
    dueDate: commitment.DatumNakoming?.startsWith("0001-") ? null : commitment.DatumNakoming,
    text: commitment.Tekst,
    addressedTo: (commitment.ToegezegdAan ?? []).map((recipient) => ({
      personId: recipient.Persoon_Id,
      partyId: recipient.Fractie_Id,
      personName: [recipient.Persoon?.Voornamen, recipient.Persoon?.Achternaam].filter(Boolean).join(" ") || null,
      partyName: recipient.Fractie?.Afkorting ?? recipient.Fractie?.NaamNL ?? null,
    })),
  }));
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
