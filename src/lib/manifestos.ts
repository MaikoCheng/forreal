import { readFile } from "node:fs/promises";
import path from "node:path";

type AxisRule = {
  positive: string[];
  negative: string[];
};

type EvidenceScore = {
  score: number;
  evidence: number;
};

type AiClaim = {
  axis: string;
  dimension: "x" | "y";
  score: number;
  confidence: number;
};

type AiPartyResult = {
  sourceFile?: string;
  scores?: Record<string, { x: number; y: number }>;
  claims?: AiClaim[];
};

export type ManifestoAxisScore = {
  x: number;
  y: number;
  evidence: number;
};

export type ManifestoScores = Record<string, Record<string, ManifestoAxisScore>>;

const partyFiles: Record<string, string> = {
  bbb: "BBBVerkiezingsprogrammaTK2025.pdf",
  cda: "CDAVerkiezingsprogrammaTK2025.pdf",
  christenunie: "CUVerkiezingsprogrammaTK2025.pdf",
  d66: "D66Verkiezingsprogramma20252030.pdf",
  fvd: "FVDverkiezingsprogramma2025.pdf",
  ja21: "JA21VerkiezingsprogrammaTK2025definitief.pdf",
  nsc: "NSCverkiezingsprogramma15092ca4765c16c.pdf",
  pro: "GroenLinksPvdAVerkiezingsprogramma2025.pdf",
  pvdd: "PVDDprogrammatweedekamerverkiezingenokt2025.pdf",
  pvv: "PVVVerkiezingsprogrammaTK2025.pdf",
  sgp: "VerkiezingsprogrammaSGP2025eindversie.pdf",
  sp: "SPverkiezingsprogrammaTK2025.pdf",
  "50plus": "Verkiezingsprogramma2025202950PLUS.pdf",
  volt: "VoltVerkiezingsprogrammaTK2025.pdf",
  vvd: "VVDVerkiezingsprogrammaTK2025.pdf",
};

const rules: Record<string, AxisRule> = {
  classicX: {
    negative: ["herverdeling", "progressief belasting", "sterkste schouders", "publieke voorzieningen", "minimumloon verhogen", "sociale zekerheid versterken"],
    positive: ["belasting verlagen", "lagere belastingen", "minder overheid", "eigen verantwoordelijkheid", "vrije markt", "ondernemen", "regeldruk verminderen"],
  },
  classicY: {
    negative: ["privacy beschermen", "demonstratierecht", "individuele vrijheid", "grondrechten beschermen", "politie minder bevoegdheid"],
    positive: ["zwaarder straffen", "strengere regels", "meer politie", "meer controle", "grensbewaking", "zero tolerance"],
  },
  economyX: {
    negative: ["herverdeling", "armoede bestrijden", "minimumloon verhogen", "publieke investeringen", "sociale zekerheid"],
    positive: ["belasting verlagen", "bezuinigen", "vrije markt", "eigen verantwoordelijkheid", "ondernemers ruimte", "minder regeldruk"],
  },
  migrationY: {
    negative: ["ruimhartig asielbeleid", "vluchtelingen opvangen", "migranten welkom", "internationale solidariteit", "arbeidsmigratie toestaan"],
    positive: ["asielstop", "migratie beperken", "grenzen sluiten", "strengere grens", "minder asiel", "uitzetten"],
  },
  welfareX: {
    negative: ["publieke zorg", "publiek onderwijs", "sociale zekerheid", "betaalbare woningen", "collectieve voorzieningen"],
    positive: ["eigen verantwoordelijkheid", "private zorg", "marktwerking", "minder toeslagen", "minder overheid"],
  },
  welfareY: {
    negative: ["solidariteit", "collectief", "publiek", "verzorgingsstaat versterken", "gelijke kansen"],
    positive: ["eigen verantwoordelijkheid", "zelfredzaamheid", "minder collectief", "minder overheid"],
  },
  orderX: {
    negative: ["privacy beschermen", "demonstratierecht", "individuele vrijheid", "grondrechten", "vrije meningsuiting"],
    positive: ["zwaarder straffen", "meer politie", "strengere handhaving", "openbare orde", "veiligheid voorop"],
  },
  orderY: {
    negative: ["open grenzen", "internationale samenwerking", "europese samenwerking", "wereld zonder grenzen", "multiculturele samenleving"],
    positive: ["nationale soevereiniteit", "nationale identiteit", "nederlandse cultuur", "grenzen bewaken", "eigen land eerst"],
  },
  climateX: {
    negative: ["klimaatneutraal", "duurzame energie", "natuur beschermen", "uitstoot verminderen", "energietransitie"],
    positive: ["economische groei", "betaalbare energie", "geen klimaatdwang", "concurrentiepositie", "ruimte voor bedrijven"],
  },
  climateY: {
    negative: ["normeren", "beprijzen", "verbieden", "vervuiler betaalt", "verplichten"],
    positive: ["marktprikkels", "innovatie", "vrijwillig", "technologische oplossingen", "ondernemers ruimte"],
  },
  culturalX: {
    negative: ["diversiteit", "gelijke rechten", "emancipatie", "multiculturele samenleving", "open samenleving"],
    positive: ["traditie", "nationale cultuur", "christelijke waarden", "gezin centraal", "behoud van identiteit"],
  },
  culturalY: {
    negative: ["persoonlijke vrijheid", "zelfbeschikking", "gelijke rechten", "lgbtq", "emancipatie"],
    positive: ["gemeenschapszin", "christelijke waarden", "traditioneel gezin", "religieuze waarden", "sociale normen"],
  },
};

function countMatches(text: string, phrases: string[]): number {
  return phrases.reduce((total, phrase) => {
    const matches = text.match(new RegExp(phrase, "gi"));
    return total + (matches?.length ?? 0);
  }, 0);
}

function scoreText(text: string, rule: AxisRule): EvidenceScore {
  const positive = countMatches(text, rule.positive);
  const negative = countMatches(text, rule.negative);
  const evidence = positive + negative;
  if (!evidence) return { score: 0, evidence: 0 };
  const score = Math.max(-1, Math.min(1, (positive - negative) / Math.sqrt(evidence * 4)));
  return { score, evidence };
}

let scoresPromise: Promise<ManifestoScores> | undefined;

export function getManifestoScores(): Promise<ManifestoScores> {
  scoresPromise ??= buildManifestoScores();
  return scoresPromise;
}

async function buildManifestoScores(): Promise<ManifestoScores> {
  const axisRules: Record<string, [AxisRule, AxisRule]> = {
    classic: [rules.classicX, rules.classicY],
    "economy-migration": [rules.economyX, rules.migrationY],
    welfare: [rules.welfareX, rules.welfareY],
    "order-nation": [rules.orderX, rules.orderY],
    "climate-economy": [rules.climateX, rules.climateY],
    cultural: [rules.culturalX, rules.culturalY],
  };

  const aiScores = await readAiScores();
  if (aiScores) return buildAiScores(aiScores, axisRules);

  const directory = path.join(process.cwd(), "data", "manifestos");
  const entries = await Promise.all(
    Object.entries(partyFiles).map(async ([party, filename]) => {
      const { PDFParse } = await import("pdf-parse");
      const { getData: getPdfWorkerData } = await import(/* webpackIgnore: true */ "pdf-parse/worker");
      PDFParse.setWorker(getPdfWorkerData());
      const parser = new PDFParse({
        data: await readFile(path.join(directory, filename)),
      });
      try {
        const result = await parser.getText();
        const text = result.text.toLocaleLowerCase("nl-NL").replace(/\s+/g, " ");
        return [party, text] as const;
      } finally {
        await parser.destroy();
      }
    }),
  );

  const deterministicScores = Object.fromEntries(entries.map(([party, text]) => [
    party,
    Object.fromEntries(Object.entries(axisRules).map(([axis, [xRule, yRule]]) => {
      const x = scoreText(text, xRule);
      const y = scoreText(text, yRule);
      return [axis, { x: x.score, y: y.score, evidence: x.evidence + y.evidence }];
    })),
  ]));
  return deterministicScores;
}

function buildAiScores(
  aiScores: {
    parties: Record<string, AiPartyResult>;
  },
  axisRules: Record<string, [AxisRule, AxisRule]>,
): ManifestoScores {
  return Object.fromEntries(Object.keys(partyFiles).map((party) => {
    const savedScores = aiScores.parties[party]?.scores;
    if (savedScores) {
      if (!isReliableAiScore(savedScores)) return [party, null];
      const axisScores = Object.fromEntries(Object.keys(axisRules).map((axis) => {
        const score = savedScores[axis];
        return [
          axis,
          {
            x: typeof score?.x === "number" ? score.x * 2 - 1 : 0,
            y: typeof score?.y === "number" ? score.y * 2 - 1 : 0,
            evidence: score ? 2 : 0,
          },
        ];
      }));
      return [party, axisScores];
    }

    const claims = aiScores.parties[party]?.claims ?? [];
    const axisScores = Object.fromEntries(Object.keys(axisRules).map((axis) => {
      const axisClaims = claims.filter((claim) => claim.axis === axis);
      const scoreFor = (dimension: "x" | "y") => {
        const dimensionClaims = axisClaims.filter((claim) => claim.dimension === dimension);
        const weight = dimensionClaims.reduce((sum, claim) => sum + claim.confidence, 0);
        if (!weight) return 0;
        return dimensionClaims.reduce(
          (sum, claim) => sum + claim.score * claim.confidence,
          0,
        ) / weight;
      };
      return [
        axis,
        {
          x: scoreFor("x"),
          y: scoreFor("y"),
          evidence: axisClaims.length,
        },
      ];
    }));
    return [party, axisScores];
  }).filter(([, axisScores]) => axisScores !== null));
}

function isReliableAiScore(scores: Record<string, { x: number; y: number }>): boolean {
  const values = Object.values(scores).flatMap((score) => [score.x, score.y]);
  if (values.length !== 12) return false;
  const uniqueValues = new Set(values);
  return !(uniqueValues.size === 1 && [0.1, 0.5, 0.9].includes(values[0]));
}

async function readAiScores(): Promise<{
  parties: Record<string, AiPartyResult>;
} | null> {
  try {
    return JSON.parse(
      await readFile(path.join(process.cwd(), "data", "manifesto-ai-scores.json"), "utf8"),
    ) as { parties: Record<string, AiPartyResult> };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}
