"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Motion } from "@/lib/motions";
import type { ManifestoScores } from "@/lib/manifestos";
import curatedStatements from "../../curated-party-statements.json";

type AxisDefinition = {
  id: string;
  label: string;
  description: string;
  x: { low: string; high: string; keywords: string[] };
  y: { low: string; high: string; keywords: string[] };
  politproX: string[];
  politproY: string[];
  invertPolitproX?: boolean;
  invertPolitproY?: boolean;
};

type PartyPosition = {
  name: string;
  x: number;
  y: number;
  votes: number;
  manifestoStatements: number;
  motionVotes: number;
  politproIssues: number;
  manifestoEvidence: number;
  logo?: string;
};

type CuratedStatement = {
  statement_id: number;
  statement: string;
  party_argument: string;
};

type StatementAxisProfile = {
  x?: number;
  y?: number;
};

const statementAxisProfiles: Record<number, StatementAxisProfile> = {
  1: { x: -0.7, y: 0 },
  2: { x: 0, y: 0.8 },
  3: { x: -0.55, y: -0.1 },
  4: { x: 0.45, y: 0 },
  5: { x: -0.45, y: -0.1 },
  6: { x: 0, y: 0.65 },
  7: { x: -0.35, y: -0.1 },
  8: { x: 0, y: 0.75 },
  9: { x: -0.5, y: -0.1 },
  10: { x: 0.35, y: 0 },
  11: { x: 0, y: -0.15 },
  12: { x: -0.25, y: 0.5 },
  13: { x: -0.65, y: -0.15 },
  14: { x: -0.3, y: -0.1 },
  15: { x: 0, y: 0.35 },
  16: { x: 0, y: -0.35 },
  17: { x: 0.6, y: 0.1 },
  18: { x: -0.5, y: 0.45 },
  19: { x: -0.15, y: -0.75 },
  20: { x: 0.45, y: 0.1 },
  21: { x: -0.4, y: 0.25 },
  22: { x: 0, y: 0.75 },
  23: { x: 0.15, y: 0.2 },
  24: { x: -0.5, y: -0.1 },
  25: { x: 0, y: 0.3 },
  26: { x: 0.35, y: 0 },
  27: { x: -0.1, y: -0.75 },
  28: { x: 0, y: 0.2 },
  29: { x: 0.2, y: 0.55 },
  30: { x: 0.15, y: 0.25 },
};

type PolitProIssue = Record<string, number>;

const politproIssues: Record<string, PolitProIssue> = {
  redistribution: {
    sp: 16.7,
    pro: 29.5,
    "50plus": 35,
    denk: 36.2,
    christenunie: 41.1,
    pvdd: 42.2,
    volt: 45.6,
    sgp: 48.6,
    pvv: 52.2,
    d66: 54,
    cda: 54,
    groep_markuszower: 55,
    mona_keijzer: 60,
    bbb: 62.2,
    fvd: 71.2,
    vvd: 72,
    ja21: 78,
  },
  spending: {
    sp: 0,
    pvdd: 10,
    pro: 15,
    "50plus": 25,
    christenunie: 40,
    denk: 40,
    cda: 50,
    volt: 50,
    d66: 60,
    bbb: 60,
    mona_keijzer: 60,
    fvd: 70,
    groep_markuszower: 75,
    pvv: 80,
    vvd: 80,
    ja21: 85,
  },
  protectionism: {
    volt: 23.3,
    d66: 26.7,
    vvd: 26.7,
    ja21: 30,
    fvd: 40,
    cda: 50,
    denk: 50,
    "50plus": 55,
    christenunie: 56.7,
    pro: 58.4,
    sgp: 60,
    pvdd: 75,
    groep_markuszower: 75,
    mona_keijzer: 75,
    pvv: 80,
    sp: 86.7,
    bbb: 86.7,
  },
  civlib: {
    pvdd: 16,
    d66: 18,
    volt: 20,
    pro: 25,
    denk: 32.5,
    sp: 38,
    christenunie: 42,
    "50plus": 50,
    cda: 64,
    mona_keijzer: 72,
    bbb: 74,
    vvd: 80,
    ja21: 82,
    sgp: 82.5,
    fvd: 92,
    groep_markuszower: 95,
    pvv: 98,
  },
  women: {
    volt: 12,
    pro: 15,
    d66: 16,
    pvdd: 18,
    vvd: 42,
    sp: 42.5,
    "50plus": 45,
    christenunie: 46,
    ja21: 50,
    cda: 54,
    mona_keijzer: 58,
    bbb: 60,
    pvv: 66,
    groep_markuszower: 68,
    denk: 77.5,
    fvd: 82,
    sgp: 98,
  },
  lgbtq: {
    d66: 6,
    pro: 10,
    volt: 10,
    pvdd: 16,
    sp: 40,
    "50plus": 40,
    vvd: 46,
    cda: 50,
    ja21: 52,
    mona_keijzer: 62,
    christenunie: 62,
    bbb: 64,
    groep_markuszower: 70,
    pvv: 72,
    denk: 74,
    fvd: 86.7,
    sgp: 98.3,
  },
  sameSexMarriage: {
    pro: 2,
    d66: 2,
    pvdd: 2,
    volt: 2,
    vvd: 6,
    sp: 6,
    "50plus": 10,
    ja21: 15,
    pvv: 27.5,
    groep_markuszower: 28,
    bbb: 36.7,
    mona_keijzer: 38,
    cda: 42.5,
    christenunie: 54,
    denk: 70,
    fvd: 74,
    sgp: 98,
  },
  religion: {
    d66: 11.7,
    sp: 11.7,
    volt: 14,
    pro: 15.8,
    vvd: 21.7,
    pvdd: 22,
    ja21: 30,
    "50plus": 45,
    bbb: 58.3,
    fvd: 60,
    groep_markuszower: 65,
    mona_keijzer: 68,
    pvv: 68.6,
    cda: 77.1,
    denk: 81.7,
    christenunie: 90,
    sgp: 98.6,
  },
  urbanRural: {
    volt: 15.7,
    d66: 18.6,
    pro: 22.9,
    denk: 25,
    pvdd: 31.4,
    vvd: 41.4,
    "50plus": 48,
    sp: 50,
    fvd: 51.7,
    ja21: 55,
    pvv: 55.7,
    groep_markuszower: 60,
    christenunie: 63.3,
    cda: 68.8,
    sgp: 85.7,
    mona_keijzer: 92,
    bbb: 98.8,
  },
  climate: {
    pvdd: 5,
    volt: 8.3,
    pro: 8.4,
    d66: 10,
    christenunie: 30,
    sp: 38,
    cda: 40,
    vvd: 45,
    denk: 50,
    "50plus": 52,
    sgp: 62,
    mona_keijzer: 84,
    bbb: 86.7,
    pvv: 88.3,
    groep_markuszower: 89,
    ja21: 95,
    fvd: 98.3,
  },
  environment: {
    pvdd: 22,
    pro: 27,
    d66: 34,
    christenunie: 38,
    volt: 38,
    sp: 44,
    denk: 50,
    "50plus": 50,
    cda: 56,
    sgp: 60,
    vvd: 62,
    mona_keijzer: 72,
    bbb: 72,
    ja21: 75,
    groep_markuszower: 75,
    pvv: 76,
    fvd: 78,
  },
  migration: {
    denk: 12.2,
    volt: 20.9,
    pvdd: 24,
    d66: 25,
    pro: 27.5,
    christenunie: 42.5,
    sp: 55.8,
    "50plus": 60,
    cda: 60,
    bbb: 79.2,
    mona_keijzer: 82,
    vvd: 85.8,
    sgp: 86.7,
    ja21: 94,
    groep_markuszower: 97,
    pvv: 98.3,
    fvd: 99.2,
  },
  multiculturalism: {
    denk: 18.9,
    volt: 22,
    pro: 26.8,
    d66: 30,
    pvdd: 33,
    christenunie: 52.7,
    sp: 57.3,
    "50plus": 60,
    cda: 62.7,
    bbb: 76.4,
    mona_keijzer: 78,
    vvd: 80.9,
    sgp: 86,
    ja21: 92,
    groep_markuszower: 95,
    pvv: 95.5,
    fvd: 97.3,
  },
  ethnicMinorities: {
    denk: 0,
    pvdd: 15,
    volt: 15,
    pro: 17.5,
    d66: 25,
    christenunie: 40,
    sp: 45,
    cda: 50,
    "50plus": 50,
    vvd: 65,
    bbb: 65,
    mona_keijzer: 68,
    sgp: 80,
    ja21: 85,
    groep_markuszower: 94,
    pvv: 95,
    fvd: 100,
  },
  nationalism: {
    pvdd: 23.3,
    denk: 23.3,
    christenunie: 36.7,
    pro: 40,
    d66: 40,
    volt: 40,
    sp: 43.3,
    "50plus": 48,
    cda: 53.3,
    bbb: 53.3,
    mona_keijzer: 56,
    vvd: 56.7,
    sgp: 56.7,
    pvv: 60,
    ja21: 62,
    groep_markuszower: 65,
    fvd: 66.7,
  },
  executive: {
    d66: 8.3,
    volt: 13.3,
    christenunie: 16,
    pro: 16.7,
    pvdd: 24,
    sp: 34,
    cda: 35,
    "50plus": 45,
    denk: 46.7,
    sgp: 52.5,
    vvd: 58.3,
    ja21: 62,
    mona_keijzer: 80,
    bbb: 84,
    groep_markuszower: 90,
    fvd: 91.7,
    pvv: 93.3,
  },
  judicial: {
    pro: 5,
    d66: 5,
    pvdd: 5,
    sp: 5,
    christenunie: 5,
    volt: 5,
    denk: 5,
    vvd: 10,
    cda: 10,
    sgp: 10,
    "50plus": 15,
    bbb: 25,
    mona_keijzer: 30,
    ja21: 35,
    fvd: 85,
    groep_markuszower: 88,
    pvv: 90,
  },
  regions: {
    bbb: 23.3,
    mona_keijzer: 25,
    sgp: 35,
    d66: 36.7,
    vvd: 43.3,
    christenunie: 43.3,
    pro: 50,
    ja21: 50,
    "50plus": 50,
    cda: 53.3,
    denk: 55,
    groep_markuszower: 58,
    pvv: 60,
    pvdd: 60,
    sp: 60,
    volt: 63.3,
    fvd: 66.7,
  },
};

const axes: AxisDefinition[] = [
  {
    id: "classic",
    label: "Klassiek kompas",
    description:
      "Economisch links tegenover economisch rechts, met progressieve en conservatieve keuzes op de verticale as.",
    x: {
      low: "Economisch links",
      high: "Economisch rechts",
      keywords: [
        "belasting",
        "economie",
        "ondernemen",
        "markt",
        "inkomen",
        "arbeid",
        "bedrijf",
      ],
    },
    y: {
      low: "Progressief",
      high: "Conservatief",
      keywords: [
        "veiligheid",
        "politie",
        "justitie",
        "straf",
        "grens",
        "asiel",
        "migratie",
      ],
    },
    politproX: ["redistribution", "spending"],
    politproY: ["civlib", "executive", "judicial"],
  },
  {
    id: "economy-migration",
    label: "Economie & migratie",
    description:
      "De relatie tussen economische keuzes en de aanpak van migratie.",
    x: {
      low: "Meer herverdeling",
      high: "Meer markt",
      keywords: [
        "belasting",
        "inkomen",
        "armoede",
        "uitkering",
        "loon",
        "arbeid",
        "ondernemen",
        "vermogen",
      ],
    },
    y: {
      low: "Minder migratie",
      high: "Meer migratie",
      keywords: [
        "asiel",
        "migratie",
        "vluchteling",
        "grens",
        "inburgering",
        "arbeidsmigrant",
      ],
    },
    politproX: ["redistribution", "spending"],
    politproY: ["migration"],
    invertPolitproY: true,
  },
  {
    id: "welfare",
    label: "Sociale zekerheid & publieke voorzieningen",
    description:
      "Hoe partijen zich uitspreken over publieke voorzieningen en collectieve bescherming.",
    x: {
      low: "Meer publieke zorg",
      high: "Meer eigen verantwoordelijkheid",
      keywords: [
        "zorg",
        "onderwijs",
        "pensioen",
        "uitkering",
        "wonen",
        "kinderopvang",
      ],
    },
    y: {
      low: "Minder collectief",
      high: "Meer collectief",
      keywords: [
        "overheid",
        "publiek",
        "sociaal",
        "collectief",
        "solidariteit",
        "toeslag",
      ],
    },
    politproX: ["redistribution", "spending"],
    politproY: ["women", "lgbtq", "sameSexMarriage", "religion"],
    invertPolitproY: true,
  },
  {
    id: "order-nation",
    label: "Civiele orde & natie",
    description:
      "Individuele vrijheid tegenover justitie en rechtspraak, en cosmopolitisme tegenover nationale gerichtheid.",
    x: {
      low: "Civiele vrijheden",
      high: "Justitie & rechtspraak",
      keywords: [
        "veiligheid",
        "politie",
        "justitie",
        "straf",
        "demonstratie",
        "privacy",
        "terrorisme",
      ],
    },
    y: {
      low: "Cosmopolitisch",
      high: "Nationalistisch",
      keywords: [
        "europa",
        "eu",
        "internationaal",
        "verdrag",
        "grens",
        "nederland",
        "soevereiniteit",
      ],
    },
    politproX: ["civlib", "executive", "judicial"],
    politproY: ["nationalism", "multiculturalism", "ethnicMinorities"],
  },
  {
    id: "climate-economy",
    label: "Klimaat & economie",
    description:
      "De keuze tussen snelle klimaatmaatregelen en economische ruimte.",
    x: {
      low: "Sneller vergroenen",
      high: "Economische ruimte",
      keywords: [
        "klimaat",
        "stikstof",
        "co2",
        "energie",
        "duurzaam",
        "milieu",
        "natuur",
      ],
    },
    y: {
      low: "Meer regulering",
      high: "Meer marktprikkels",
      keywords: [
        "belasting",
        "heffing",
        "verbod",
        "norm",
        "subsidie",
        "ondernemen",
        "industrie",
      ],
    },
    politproX: ["climate", "environment"],
    politproY: ["redistribution", "spending"],
  },
  {
    id: "cultural",
    label: "Culturele as",
    description:
      "Culturele openheid tegenover nadruk op traditie en nationale identiteit.",
    x: {
      low: "Open",
      high: "Traditioneel",
      keywords: [
        "cultuur",
        "gezin",
        "religie",
        "traditie",
        "identiteit",
        "nederland",
        "onderwijs",
      ],
    },
    y: {
      low: "Persoonlijke vrijheid",
      high: "Gemeenschapsnormen",
      keywords: [
        "emancipatie",
        "gelijkheid",
        "lgbt",
        "discriminatie",
        "gezin",
        "religie",
        "vrijheid",
      ],
    },
    politproX: [
      "multiculturalism",
      "ethnicMinorities",
      "nationalism",
      "urbanRural",
      "regions",
    ],
    politproY: ["women", "lgbtq", "sameSexMarriage", "religion", "civlib"],
  },
];

const partyLogos: Record<string, string> = {
  bbb: "/images/agents/bbb.svg.webp",
  cda: "/images/agents/cda.svg.webp",
  christenunie: "/images/agents/christenunie.png",
  d66: "/images/agents/d66.png",
  denk: "/images/agents/denk.png",
  "50plus": "/images/agents/50PLUS_(nl)_Logo.svg",
  fvd: "/images/agents/fvd.svg.webp",
  ja21: "/images/agents/ja21.svg.webp",
  groepmarkuszower: "/images/agents/markuszower.jpg",
  monakeijzer: "/images/agents/Mona_Keijzer,_January_2025.jpg",
  nsc: "/images/agents/NSC_partijlogo.svg",
  pro: "/images/agents/PRO.jpg",
  pvv: "/images/agents/pvv.png",
  sgp: "/images/agents/sgp.jpg",
  sp: "/images/agents/sp.svg",
  volt: "/images/agents/volt.png",
  vvd: "/images/agents/vvd.svg.webp",
  pvdd: "/images/agents/partij_voor_de_dieren.jpg",
};

const portraitLogoKeys = new Set(["groepmarkuszower", "monakeijzer"]);

const partyAliases: Record<string, string> = {
  boerburgerbeweging: "bbb",
  christendemocratischappel: "cda",
  democraten66: "d66",
  forumvoordemocratie: "fvd",
  groenlinkspvda: "pro",
  nieuwesocialecontract: "nsc",
  partijvoordedieren: "pvdd",
  partijvoordevrijheid: "pvv",
  socialistischepartij: "sp",
  staatkundiggereformeerdepartij: "sgp",
  volkspartijvoorvrijheiden: "vvd",
  cu: "christenunie",
  keijzer: "monakeijzer",
};

const partyDisplayNames: Record<string, string> = {
  groepmarkuszower: "Groep Markuszower",
  monakeijzer: "Mona Keijzer",
};

const politproPartyAliases: Record<string, string> = {
  groepmarkuszower: "groep_markuszower",
  markuszower: "groep_markuszower",
  monakeijzer: "mona_keijzer",
};

function partyKey(party: string): string {
  const normalized = party.toLocaleLowerCase("nl-NL").replace(/[^a-z0-9]/g, "");
  return partyAliases[normalized] ?? normalized;
}

function politproValue(issue: string, party: string): number | undefined {
  const issueValues = politproIssues[issue];
  if (!issueValues) return undefined;
  return issueValues[party] ?? issueValues[politproPartyAliases[party] ?? party];
}

function normalize(value: string): string {
  return value.toLocaleLowerCase("nl-NL");
}

function axisSignal(subject: string, keywords: string[]): number {
  const text = normalize(subject);
  const matches = keywords.filter((keyword) => text.includes(keyword)).length;
  return matches;
}

function statementAgreement(argument: string): number {
  const text = normalize(argument).slice(0, 420);
  const opposition = [
    "gaat te ver",
    "niet aan de orde",
    "geen voorstander",
    "geen steun",
    "niet steunen",
    "wijzen wij af",
    "wijst .* af",
    "moet blijven",
    "moet behouden",
    "terugdraaien",
    "niet .* verhogen",
    "niet .* uitbreiden",
    "niet .* invoeren",
    "afschaffen",
    "verminderen",
  ];
  const support = [
    "wij zijn voor",
    "wij steunen",
    "wij willen",
    "wij pleiten",
    "moet worden ingevoerd",
    "moet omhoog",
    "moet verhogen",
    "moet uitbreiden",
    "moet strenger",
    "moet makkelijker",
    "moet worden afgeschaft",
  ];
  const countMatches = (patterns: string[]) =>
    patterns.reduce((count, pattern) => count + (new RegExp(pattern).test(text) ? 1 : 0), 0);
  const oppositionScore = countMatches(opposition) * 2;
  const supportScore = countMatches(support);
  if (oppositionScore === supportScore) return 0;
  return oppositionScore > supportScore ? -1 : 1;
}

function getPositions(
  motions: Motion[],
  axis: AxisDefinition,
  manifestoScores: ManifestoScores,
): PartyPosition[] {
  const partyScores = new Map<string, {
    name: string;
    xTotal: number;
    xWeight: number;
    yTotal: number;
    yWeight: number;
  }>();

  const manifestoByParty = new Map<string, {
    name: string;
    xTotal: number;
    xCount: number;
    yTotal: number;
    yCount: number;
  }>();
  const profile = (statement: CuratedStatement) => statementAxisProfiles[statement.statement_id];

  Object.entries(curatedStatements).forEach(([partyName, statements]) => {
    const key = partyKey(partyName);
    statements.forEach((statement) => {
      const statementProfile = profile(statement as CuratedStatement);
      if (!statementProfile) return;
      const agreement = statementAgreement(
        (statement as CuratedStatement).party_argument,
      );
      if (!agreement) return;
      const existing = manifestoByParty.get(key) ?? {
        name: partyName,
        xTotal: 0,
        xCount: 0,
        yTotal: 0,
        yCount: 0,
      };
      if (statementProfile.x !== undefined) {
        existing.xTotal += statementProfile.x * agreement;
        existing.xCount += 1;
      }
      if (statementProfile.y !== undefined) {
        existing.yTotal += statementProfile.y * agreement;
        existing.yCount += 1;
      }
      manifestoByParty.set(key, existing);
    });
  });

  motions.forEach((motion) => {
    const xSignal = axisSignal(motion.subject, axis.x.keywords);
    const ySignal = axisSignal(motion.subject, axis.y.keywords);
    if (!xSignal && !ySignal) return;

    motion.votes.forEach((vote) => {
      const key = partyKey(vote.party);
      const existing = partyScores.get(key) ?? {
        name: vote.party,
        xTotal: 0,
        xWeight: 0,
        yTotal: 0,
        yWeight: 0,
      };
      const stance = vote.stance === "Voor" ? 1 : -1;
      if (xSignal) {
        existing.xTotal += stance * xSignal;
        existing.xWeight += xSignal;
      }
      if (ySignal) {
        existing.yTotal += stance * ySignal;
        existing.yWeight += ySignal;
      }
      partyScores.set(key, existing);
    });
  });

  const partyNames = new Map(manifestoByParty);
  partyScores.forEach((party, key) => {
    if (!partyNames.has(key)) {
      partyNames.set(key, {
        name: party.name,
        xTotal: 0,
        xCount: 0,
        yTotal: 0,
        yCount: 0,
      });
    }
  });
  Object.values(politproIssues).forEach((issue) => {
    Object.keys(issue).forEach((key) => {
      const normalizedKey = partyKey(key);
      if (!partyNames.has(normalizedKey)) {
        partyNames.set(normalizedKey, {
          name: partyDisplayNames[normalizedKey] ?? normalizedKey.toUpperCase(),
          xTotal: 0,
          xCount: 0,
          yTotal: 0,
          yCount: 0,
        });
      }
    });
  });
  Object.keys(manifestoScores).forEach((key) => {
    if (!partyNames.has(key)) {
      partyNames.set(key, {
        name: partyDisplayNames[key] ?? key.toUpperCase(),
        xTotal: 0,
        xCount: 0,
        yTotal: 0,
        yCount: 0,
      });
    }
  });

  return [...partyNames.entries()]
    .map((party) => {
      const [key, manifesto] = party;
      const motion = partyScores.get(key);
      const increaseContrast = (value: number) =>
        Math.sign(value) * Math.pow(Math.abs(value), 0.55);
      const manifestoX = manifesto.xCount ? manifesto.xTotal / manifesto.xCount : 0;
      const manifestoY = manifesto.yCount ? manifesto.yTotal / manifesto.yCount : 0;
      const motionX = motion?.xWeight ? motion.xTotal / motion.xWeight : 0;
      const motionY = motion?.yWeight ? motion.yTotal / motion.yWeight : 0;
      const usesManifesto = axis.id === "classic" && (manifesto.xCount > 0 || manifesto.yCount > 0);
      const issueScore = (issues: string[], fallback: number, invert = false) => {
        if (!issues.length) return fallback;
        const knownScores = issues.flatMap((issue) => {
          const value = politproValue(issue, key);
          if (value === undefined) return [];
          const normalized = value / 50 - 1;
          return [invert ? -normalized : normalized];
        });
        const missingCount = issues.length - knownScores.length;
        const total = knownScores.reduce((sum, value) => sum + value, 0)
          + fallback * missingCount;
        return total / issues.length;
      };
      const customX = usesManifesto ? manifestoX * 0 + motionX * 1 : motionX;
      const customY = usesManifesto ? manifestoY * 0 + motionY * 1 : motionY;
      const manifestoScore = manifestoScores[key]?.[axis.id];
      const manifestoXScore = manifestoScore?.x ?? customX;
      const manifestoYScore = manifestoScore?.y ?? customY;
      const politproX = issueScore(axis.politproX, customX, axis.invertPolitproX);
      const politproY = issueScore(axis.politproY, customY, axis.invertPolitproY);
      const x = increaseContrast(politproX * 0.8+ manifestoXScore * 0.2);
      const y = increaseContrast(politproY * 0.8 + manifestoYScore * 0.2);
      const politproCount = axis.politproX.filter((issue) => politproValue(issue, key) !== undefined).length
        + axis.politproY.filter((issue) => politproValue(issue, key) !== undefined).length;
      return {
        name: manifesto.name,
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-1, Math.min(1, y)),
        votes: (usesManifesto ? manifesto.xCount + manifesto.yCount : 0) + (motion?.xWeight ?? 0) + (motion?.yWeight ?? 0),
        manifestoStatements: usesManifesto ? manifesto.xCount + manifesto.yCount : 0,
        motionVotes: (motion?.xWeight ?? 0) + (motion?.yWeight ?? 0),
        politproIssues: politproCount,
        manifestoEvidence: manifestoScore?.evidence ?? 0,
        logo: partyLogos[partyAliases[key] ?? key],
      };
    })
    .filter((party) => party.politproIssues >= 1 || party.manifestoStatements >= 2 || party.motionVotes >= 2)
    .sort((a, b) => b.votes - a.votes);
}

function positionLabel(value: number, low: string, high: string): string {
  return value < -0.2 ? low : value > 0.2 ? high : "Midden";
}

function spreadOverlappingPositions(positions: PartyPosition[]): PartyPosition[] {
  const laidOut = positions.map((position) => ({ ...position }));
  const minimumDistance = 0.16;
  const boundary = 0.84;

  for (let iteration = 0; iteration < 12; iteration += 1) {
    for (let firstIndex = 0; firstIndex < laidOut.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < laidOut.length; secondIndex += 1) {
        const first = laidOut[firstIndex];
        const second = laidOut[secondIndex];
        const deltaX = second.x - first.x;
        const deltaY = second.y - first.y;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance >= minimumDistance) continue;

        const angle = distance > 0.001
          ? Math.atan2(deltaY, deltaX)
          : ((firstIndex + secondIndex) % 8) * (Math.PI / 4);
        const adjustment = (minimumDistance - Math.max(distance, 0.001)) / 2;
        const offsetX = Math.cos(angle) * adjustment;
        const offsetY = Math.sin(angle) * adjustment;
        first.x = Math.max(-boundary, Math.min(boundary, first.x - offsetX));
        first.y = Math.max(-boundary, Math.min(boundary, first.y - offsetY));
        second.x = Math.max(-boundary, Math.min(boundary, second.x + offsetX));
        second.y = Math.max(-boundary, Math.min(boundary, second.y + offsetY));
      }
    }
  }

  return laidOut;
}

export default function PartySpectrum({ motions }: { motions: Motion[] }) {
  const [selectedAxis, setSelectedAxis] = useState(axes[0].id);
  const [manifestoScores, setManifestoScores] = useState<ManifestoScores>({});
  const axis = axes.find((item) => item.id === selectedAxis) ?? axes[0];
  const positions = useMemo(
    () => spreadOverlappingPositions(getPositions(motions, axis, manifestoScores)),
    [motions, axis, manifestoScores],
  );

  useEffect(() => {
    fetch("/api/manifestos")
      .then(async (response) => {
        if (!response.ok) throw new Error("Manifesto request failed");
        return response.json() as Promise<{ scores: ManifestoScores }>;
      })
      .then((data) => setManifestoScores(data.scores))
      .catch((error) => console.error("Manifesto-scores konden niet worden opgehaald.", error));
  }, []);

  return (
    <section id="spectrums" className="md3-browser border-y border-[var(--md-outline-variant)] py-10 sm:py-14">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-600">
          Partijen op de kaart
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Hoe verschillen partijen?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Een indicatieve positionering op basis van stemmingen over moties. Kies een
          spectrum om een ander inhoudelijk verband te bekijken.
        </p>
      </div>

      <div className="-mx-1 mb-7 flex snap-x gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="tablist" aria-label="Politieke spectra">
        {axes.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selectedAxis === item.id}
            onClick={() => setSelectedAxis(item.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${
              selectedAxis === item.id
                ? "border-slate-800 bg-slate-800 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-slate-500"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-4 text-white shadow-sm sm:overflow-visible sm:p-7">
        <div className="mb-7 max-w-2xl">
          <h3 className="text-xl font-bold">{axis.label}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{axis.description}</p>
        </div>

        {positions.length === 0 ? (
          <div className="grid min-h-96 place-items-center rounded-2xl border border-slate-800 bg-slate-900 text-center text-sm text-slate-400">
            Er zijn nog niet genoeg stemmingen om dit spectrum te berekenen.
          </div>
        ) : (
          <div className="relative mx-auto aspect-[1.05] min-h-[20rem] max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 sm:aspect-[1.45] sm:min-h-96 sm:overflow-visible">
            <div className="absolute inset-x-0 top-1/2 border-t border-slate-700" />
            <div className="absolute inset-y-0 left-1/2 border-l border-slate-700" />
            <div className="absolute inset-x-2 bottom-2 flex justify-between gap-4 text-[0.6rem] font-bold uppercase tracking-wider text-slate-500 sm:inset-x-0 sm:bottom-[-2rem] sm:text-[0.65rem]">
              <span>{axis.x.low}</span>
              <span>{axis.x.high}</span>
            </div>
            <span className="absolute right-full top-0 mr-3 hidden -translate-y-full whitespace-nowrap text-right text-[0.65rem] font-bold uppercase tracking-wider text-slate-500 sm:block">
              {axis.y.high}
            </span>
            <span className="absolute right-full bottom-0 mr-3 hidden translate-y-full whitespace-nowrap text-right text-[0.65rem] font-bold uppercase tracking-wider text-slate-500 sm:block">
              {axis.y.low}
            </span>

            {positions.map((party) => (
              <button
                key={partyKey(party.name)}
                type="button"
                title={`${party.name}: ${positionLabel(party.x, axis.x.low, axis.x.high)} · ${positionLabel(party.y, axis.y.low, axis.y.high)}`}
                aria-label={`${party.name}, ${positionLabel(party.x, axis.x.low, axis.x.high)} en ${positionLabel(party.y, axis.y.low, axis.y.high)}`}
                className="group absolute grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full border-2 border-slate-950 bg-white p-1 shadow-lg transition hover:z-10 hover:scale-110 focus:z-10 focus:scale-110 sm:size-12"
                style={{
                  left: `clamp(24px, ${50 + party.x * 42}%, calc(100% - 24px))`,
                  top: `clamp(24px, ${50 - party.y * 42}%, calc(100% - 24px))`,
                }}
              >
                {party.logo ? (
                  <Image
                    src={party.logo}
                    alt=""
                    width={40}
                    height={40}
                    className={`size-full rounded-full ${
                      portraitLogoKeys.has(partyKey(party.name)) ? "object-cover" : "object-contain"
                    }`}
                  />
                ) : (
                  <span className="text-[0.65rem] font-black text-slate-800">
                    {party.name.slice(0, 3).toUpperCase()}
                  </span>
                )}
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 shadow-xl group-hover:block group-focus:block">
                  {party.name}
                </span>
              </button>
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-xs leading-5 text-slate-400">
           De posities zijn berekend op basis van stemmingen over moties en partijprogramma&apos;s, en kunnen afwijken van de daadwerkelijke standpunten van partijen. Ook hebben sommige partijen weinig stemmingen of partijprogramma-uitspraken, waardoor hun positie minder betrouwbaar is.
        </p>
      </div>
    </section>
  );
}
