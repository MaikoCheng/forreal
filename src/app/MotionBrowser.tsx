"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { formatMotionDate, type Motion, type MotionDetail } from "@/lib/motions";
import PartySpectrum from "./PartySpectrum";
import { getCachedMotions } from "@/lib/motion-client";

const themeKeywords: Record<string, string[]> = {
  Wonen: [
    "woon",
    "woning",
    "huur",
    "hypotheek",
    "nieuwbouw",
    "huisvesting",
    "huurcontract",
    "woningmarkt",
    "woningnood",
    "woningbouw",
    "huurprijs",
    "huurtoeslag",
    "woningcorporatie",
    "woningbeleid",
    "woningtekort",
    "woningverhuur",
    "woningverkoop",
    "woningrenovatie",
    "woningonderhoud",
    "woningkwaliteit",
    "woningduurzaamheid",
    "woninginnovatie",
    "woningfinanciering",
    "woningtoewijzing",
    "woningtoegang",
    "woningprijzen",
    "woningmarktbeleid",
    "woningmarktontwikkeling",
    "woningmarktregulering",
    "woningmarktmonitoring",
    "woningmarktonderzoek",
    "woningmarkttrends",
    "woningmarktprognoses",
    "woningmarkteffecten",
    "woningmarktevaluatie",
    "woningmarktvergelijking",
    "woningmarktanalyse",
    "woningmarktstrategie",
    "woningmarktplanning",
    "woningmarktbeleidsevaluatie",
    "dakloos",
    "daklozen",
    "dakloosheid",
    "sociale huur",
    "huurwoning",
    "huurwoningen",
    "koopwoning",
    "koopwoningen",
    "huisjesmelker",
    "huisjesmelkers",
    "omgevingswet",
    "ruimtelijke ordening",
    "ruimtelijke ontwikkeling",
    "volkshuisvesting",
    "woonbeleid",
    "woonzorg",
    "buiten slapen",

    "wonen",
  ],

  Zorg: [
    "zorg",
    "beperking",
    "PTSS",
    "health",
    "drugs",
    "arbo",
    "alcohol",
    "hulpverlening",
    "zorgplicht",
    "PTSS-loket",
    "GGZ",
    "medisch",
    "ziekenhuis",
    "kraam",
    "gezondheid",
    "zorginkoop",
    "patiënt",
    "verpleging",
    "medicatie",
    "dokter",
    "arts",
    "verpleegkundige",
    "gezondheidszorg",
    "zorgverzekering",
    "zorgtoeslag",
    "zorgkosten",
    "zorginstelling",
    "zorgverlener",
    "zorgbehoefte",
    "zorgbeleid",
    "zorgsysteem",
    "zorgkwaliteit",
    "zorginnovatie",
    "zorgtechnologie",
    "eigen risico",
    "ggz",
    "thuiszorg",
    "ouderenzorg",
    "jeugdzorg",
    "gehandicaptenzorg",
    "preventieve zorg",
    "curatieve zorg",
    "palliatieve zorg",
    "mentale gezondheid",
    "psychische zorg",
    "gezondheidsbevordering",
    "gezondheidsbeleid",
    "ouder",
    "ouderen",
    "jeugd",
    "jeugdbescherming",
    "jeugdwet",
    "wmo",
    "wlz",
    "zvw",
    "pgb",
    "geneesmiddel",
    "geneesmiddelen",
    "farmacie",
    "apotheek",
    "ambulance",
    "spoedeisende hulp",
    "spoedeisende zorg",
    "ziekenhuiszorg",
    "ouderenzorg",
    "mantelzorg",
    "hospice",
    "palliatief",
    "donorkind",
    "spermadonatie",
    "fertiliteit",
    "prenataal",
    "vroeggeboorte",
    "euthanasie",
    "zorgfraude",
    "zorgaanbieder",
    "zorginstelling",
    "wachttijd",
    "wachtlijst",
    "traumageriatrie",
    "roken",
    "tabak",
    "wiet",
    "bekostiging",
    "bekostigingsmodel",
    "igj",
    "sneltest",
    "prehospitaal",
    "screening",
    "tele-seh",
    "regionaal ziekenhuis",
    "superziekenhuis",
    "luisterlijn",
    "koorts",
    "mental",
    "mentaal",
    "griep",
    "vaccin",
    "handicap",
    "ziekte",
  ],

  Onderwijs: [
    "onderwijs",
    "school",
    "student",
    "leraar",
    "opleiding",
    "universiteit",
    "basisschool",
    "middelbare school",
    "voortgezet onderwijs",
    "hoger onderwijs",
    "onderwijsbeleid",
    "onderwijskwaliteit",
    "onderwijsinnovatie",
    "onderwijstechnologie",
    "school",
    "scholen",
    "wetenschap",
    "mbo",
    "vmbo",
    "hbo",
    "mbo-student",
    "studenten",
    "studiefinanciering",
    "studieschuld",
    "collegegeld",
    "schooluitval",
    "kinderopvang",
    "stage",
    "stages",
    "lerarentekort",
    "lerarenopleiding",
    "pabo",
    "universiteiten",
    "hogescholen",
    "wetenschappelijk onderzoek",
    "academisch",
    "promotie",
  ],

  "Klimaat & Milieu": [
    "klimaat",
    "stikstof",
    "habitat",
    "natuur",
    "pfas",
    "pfas-stoffen",
    "CO2",
    "diepzeemijnbouw",
    "De MER",
    "CO2-uitstoot",
    "vergroen",
    "gaswin",
    "schiphol",
    "fossiel",
    "energie",
    "duurzaam",
    "kankerverwekkende stoffen",
    "natuur",
    "milieu",
    "elektrisch",
    "broeikasgas",
    "klimaatverandering",
    "klimaatbeleid",
    "klimaatadaptatie",
    "klimaatmitigatie",
    "klimaatwet",
    "klimaatakkoord",
    "klimaatcrisis",
    "klimaatimpact",
    "klimaatfinanciering",
    "klimaatonderzoek",
    "klimaatbewustzijn",
    "fossiele brandstoffen",
    "hernieuwbare energie",
    "energie-efficiëntie",
    "energieopwekking",
    "energievoorziening",
    "energiebeleid",
    "energietransitie",
    "energieverbruik",
    "energieprijzen",
    "energiearmoede",
    "energiebesparing",
    "energielabels",
    "energietarieven",
    "fossielebrandstofsubsidies",
    "water",
    "waterkwaliteit",
    "waterbeheer",
    "waterveiligheid",
    "watervervuiling",
    "waterbeschikbaarheid",
    "droogte",
    "overstroming",
    "dijken",
    "landbouw",
    "boeren",
    "boer",
    "mest",
    "mestbeleid",
    "natuurgebied",
    "natuurgebieden",
    "biodiversiteit",
    "stikstofdepositie",
    "uitstoot",
    "emissie",
    "emissies",
    "co2",
    "circulaire economie",
    "circulair",
    "afval",
    "afvalstoffen",
    "recycling",
    "windenergie",
    "windmolen",
    "windmolens",
    "zonnepanelen",
    "zonne-energie",
    "kernenergie",
    "kerncentrale",
    "tata steel",
    "luchtkwaliteit",
    "ecologi",
  ],

  Migratie: [
    "migratie",
    "asiel",
    "vluchteling",
    "inburgering",
    "immigratie",
    "emigratie",
    "migranten",
    "migratiebeleid",
    "migratiestromen",
    "migratiecrisis",
    "migratievraagstukken",
    "migratieonderzoek",
    "migratiegeschiedenis",
    "migratie-impact",
    "migratie-integratie",
    "migratie-veiligheid",
    "migratie-economie",
    "migratie-cultuur",
    "migratie-rechten",
    "migratie-gezondheid",
    "vluchtelingenopvang",
    "asielzoekerscentra",
    "asielprocedure",
    "asielbeleid",
    "asielwetgeving",
    "asielzoekersrechten",
    "asielzoekersstatus",
    "asielzoekersopvangcapaciteit",
    "azc",
    "ter apel",
    "vluchtelingenstatus",
    "vluchtelingenopvangbeleid",
    "vluchtelingenintegratie",
    "vluchtelingenrechten",
    "vluchtelingengezondheid",
    "vluchtelingentoegang",
    "vluchtelingentoewijzing",
    "opvang",
    "opvanglocatie",
    "asielopvang",
    "statushouder",
    "statushouders",
    "ongedocumenteerd",
    "ongedocumenteerden",
    "uitgeprocedeerd",
    "vreemdeling",
    "vreemdelingen",
    "vreemdelingenbewaring",
    "terugkeerbeleid",
    "uitzetting",
    "inreisverbod",
    "grensbewaking",
    "grenscontroles",
    "integratie",
    "naturalisa",
  ],

  "Economie & Werk": [
    "economie",
    "arbeid",
    "gefinanci",
    "toeslag",
    "hypotheek",
    "huurcontract",
    "rekenkamer",
    "fonds",
    "leefbaar",
    "boxhop",
    "investering",
    "financi",
    "investeerders",
    "financieringsconstructie",
    "handel",
    "bezuinig",
    "belastingen",
    "krediet",
    "koop nu",
    "belastingplan",
    "ondernemer",
    "bedrijf",
    "werkloosheid",
    "krediet",
    "consumentenkrediet",
    "inflatie",
    "bbp",
    "economisch beleid",
    "economische groei",
    "economische crisis",
    "economische ontwikkeling",
    "economische stabiliteit",
    "economische ongelijkheid",
    "economische kansen",
    "economische innovatie",
    "economische samenwerking",
    "economische handel",
    "economische investeringen",
    "economische sectoren",
    "economische markten",
    "economische trends",
    "economische prognoses",
    "economische indicatoren",
    "economische analyses",
    "begroting",
    "nettoafdracht",
    "belastingbeleid",
    "belastingtarieven",
    "belastingdienst",
    "budget",
    "VWS-begroting",

    "belastingontwijking",
    "belastingontduiking",
    "startrekening",
    "btw",
    "inkomen",
    "inkomens",
    "inkomensongelijkheid",
    "koopkracht",
    "armoede",
    "bestaanszekerheid",
    "sociale zekerheid",
    "bijstand",
    "uitkering",
    "uitkeringen",
    "minimumloon",
    "loon",
    "lonen",
    "arbeidsmarkt",
    "arbeidsvoorwaarden",
    "arbeidsmigratie",
    "arbeidsongeschikt",
    "arbeidsongeschiktheid",
    "werkgelegenheid",
    "werknemer",
    "werknemers",
    "werkgever",
    "werkgevers",
    "zzp",
    "zelfstandige",
    "mkb",
    "midden- en kleinbedrijf",
    "pensioen",
    "pensioenen",
    "aow",
    "ondernemerschap",
    "ondernemingen",
    "faillissement",
    "schuld",
    "schulden",
    "schuldhulpverlening",
    "bank",
    "banken",
    "financiële sector",
    "investering",
    "investeringen",
    "regeldruk",
    "rendement",
    "digitale infrastructuur",
    "datacenter",
    "datacenters",
  ],

  Defensie: [
    "defensie",
    "militair",
    "leger",
    "oorlog",
    "terrorisme",
    "veiligheidsbeleid",
    "defensiebeleid",
    "militaire operaties",
    "militaire uitgaven",
    "militaire technologie",
    "militaire training",
    "militaire samenwerking",
    "internationale veiligheid",
    "nationale veiligheid",
    "veiligheidsincidenten",
    "veiligheidsdiensten",
    "veiligheidsinfrastructuur",
    "rusland",
    "icc",
    "nucleaire samenwerking",
    "oekraïne",
    "oekraïense",
    "navo",
    "nato",
    "wapen",
    "wapens",
    "wapenexport",
    "wapenleveranties",
    "shahed",
    "militaire steun",
    "krijgsmacht",
    "marine",
    "luchtmacht",
    "landmacht",
    "veteranen",
    "missie",
    "missies",
    "sanctie",
    "sancties",
    "spionage",
    "cyberaanval",
    "cyberveiligheid",
    "politie",
    "criminaliteit",
    "terroristische",
    "extremisme",
    "ondermijning",
    "georganiseerde misdaad",
    "demonstratie",
    "demonstraties",
    "gezichtsbedekkende kleding",
  ],

  "Cultuur & Media": [
    "cultuur",
    "kunst",
    "theater",
    "muziek",
    "film",
    "literatuur",
    "cultureel erfgoed",
    "culturele diversiteit",
    "culturele participatie",
    "culturele instellingen",
    "culturele evenementen",
    "culturele subsidies",
    "culturele beleidsvorming",
    "culturele educatie",
    "culturele innovatie",
    "culturele samenwerking",
    "culturele diplomatie",
    "culturele identiteit",
    "culturele expressie",
    "erfgoed",
    "monument",
    "monumenten",
    "museum",
    "musea",
    "bibliotheek",
    "bibliotheken",
    "podiumkunst",
    "dans",
    "artiest",
    "artiesten",
    "omroep",
    "publieke omroep",
    "media",
    "journalistiek",
    "journalist",
    "persvrijheid",
    "auteursrecht",
    "letteren",
  ],

  "Abortus & Reproductieve Zorg": [
    "abortus",
    "zwangerschap",
    "reproductieve rechten",
    "abortuswetgeving",
    "abortuskliniek",
    "abortusbeleid",
    "abortuszorg",
    "abortusprocedure",
    "abortusklinieken",
    "abortuskliniekbeleid",
    "abortuskliniektoegang",
    "abortuskliniekfinanciering",
    "abortuskliniekveiligheid",
    "abortuskliniekprivacy",
    "abortuskliniekondersteuning",
    "abortuskliniekvoorlichting",
    "abortuskliniekonderzoek",
    "abortuskliniekinnovatie",
    "abortuspil",
    "zwangerschapsafbreking",
    "embryo",
    "embryo's",
    "ivf",
    "ivg",
    "vruchtbaarheid",
  ],

  Europa: [
    "europa",
    "europese unie",
    "europese commissie",
    "europese raad",
    "eu-verband",
    "europese",
    "europese parlement",
    "europese wetgeving",
    "europese samenwerking",
    "europese integratie",
    "europese economie",
    "europese handel",
    "europese migratie",
    "europese veiligheid",
    "europese defensie",
    "europese energie",
    "europese klimaatbeleid",
    "europese milieu",
    "europese cultuurbeleid",
    "nexit",
    "euroscepticisme",
    "europese identiteit",
    "europese waarden",
    "europese mensenrechten",
    "europese democratie",
    "europese rechtsstaat",
    "vetorecht",
    "europese samenwerking",
    "europese solidariteit",
    "europese cohesie",
    "europese innovatie",
    "europese digitalisering",
    "eu-brede",
    "europese infrastructuur",
    "europese transport",
    "europese landbouw",
    "europese visserij",
    "europese energiebeleid",
    "europese klimaatverandering",
    "europese milieuvervuiling",
    "europese biodiversiteit",
    "europese natuurbehoud",
    "europese waterbeheer",
    "europese luchtkwaliteit",
    "europese afvalbeheer",
    "europese circulaire economie",
    "europees",
    "EU-begroting",
    "veto",
    "EU-budget",
    "eu moet verlaten",
    "eu-groeiplan",
    "eu-uitbreid",
    "eu-landen",
    "brussel",
    "europese begroting",
    "meerjarig financieel kader",
    "mfk",
    "euro",
    "eurozone",
    "eu-verordening",
    "eu-richtlijn",
    "europese richtlijn",
    "europese verordening",
    "europese regelgeving",
    "europese unie",
    "europese verkiezingen",
    "europees hof",
    "hof van justitie",
    "schengen",
    "buitenlandse zaken",
  ],

  "Justitie & Rechtsstaat": [
    "justitie",
    "rechtspraak",
    "rechter",
    "rechtbank",
    "rechtsstaat",
    "strafrecht",
    "strafbaar",
    "strafrechtelijk",
    "vervolging",
    "verdachte",
    "bewijs",
    "gevangenis",
    "detentie",
    "reclassering",
    "rechtsbijstand",
    "advocaat",
    "slachtoffer",
    "strafmaat",
    "taakstraf",
    "witwassen",
    "fraude",
    "corruptie",
  ],

  "Openbare Orde & Veiligheid": [
    "openbare orde",
    "politie",
    "sloop",
    "crisis",
    "boa",
    "ondermijning",
    "georganiseerde misdaad",
    "criminaliteit",
    "geweld",
    "huiselijk geweld",
    "seksueel geweld",
    "terrorisme",
    "extremisme",
    "radicalisering",
    "demonstratie",
    "demonstraties",
    "moskee",
    "antisemitisme",
    "racisme",
    "discriminatie",
    "veiligheidsregio",
    "crisisbeheersing",
  ],

  "Infrastructuur & Mobiliteit": [
    "infrastructuur",
    "mobiliteit",
    "elektri",
    "infra",
    "openbaar vervoer",
    "spoor",
    "spoorweg",
    "trein",
    "treinverbinding",
    "station",
    "busverbinding",
    "tram",
    "metro",
    "verkeer",
    "verkeersveiligheid",
    "snelweg",
    "wegennet",
    "brug",
    "tunnel",
    "vliegveld",
    "luchtvaart",
    "vliegtuig",
    "zeehaven",
    "haven",
    "scheepvaart",
    "binnenvaart",
    "fietspad",
  ],

  "Bestuur & Democratie": [
    "democratie",
    "verkiezing",
    "burgemeester",
    "overheid",
    "reglement",
    "stembiljet",
    "stemrecht",
    "kiesrecht",
    "gemeenteraad",
    "provinciale staten",
    "gemeente",
    "gemeenten",
    "provincie",
    "provincies",
    "decentralisatie",
    "decentrale overheid",
    "ministerie",
    "bestuur",
    "bestuurlijke",
    "overheidsdienst",
    "ombudsman",
    "integriteit",
    "transparantie",
    "lobby",
    "donaties",
    "referendum",
  ],

  "Digitale Overheid & Technologie": [
    "digitalisering",
    "gluurbril",
    "cyber",
    "cookie",
    "AI-voorziening",
    "ict",
    "digitale overheid",
    "kunstmatige intelligentie",
    "digita",
    "algoritme",
    "algoritmen",
    "artificiële intelligentie",
    "ai-model",
    "gegevensdeling",
    "ai-killswitch",
    "gegevensbescherming",
    "privacy",
    "cyberveiligheid",
    "cyberaanval",
    "cybercrime",
    "datacenter",
    "datacenters",
    "digitale infrastructuur",
    "software",
    "digitale dienstverlening",
    "internet",
    "sociale media",
    "platform",
  ],

  "Gezin, Jeugd & Emancipatie": [
    "gezin",
    "gezinnen",
    "begrijpelijke taal",
    "vereniging",
    "sekswerk",
    "sport",
    "beperking",
    "fitness",
    "beweeg",
    "kinderen",
    "diversity",
    "jongeren",
    "jeugdbeleid",
    "jeugdbescherming",
    "uithuisplaatsing",
    "pleegzorg",
    "pleegkind",
    "kindermishandeling",
    "huiselijk geweld",
    "emancipatie",
    "lhbti",
    "vrouwenrechten",
    "gelijkheid",
    "discriminatie",
    "seksuele uitbuiting",
  ],

  "Landbouw & Voedsel": [
    "landbouw",
    "agrarisch",
    "boeren",
    "boer",
    "veehouderij",
    "veehouders",
    "akkerbouw",
    "tuinbouw",
    "glastuinbouw",
    "mest",
    "mestbeleid",
    "visserij",
    "vissers",
    "garnalenvisserij",
    
    "voedsel",
    "voedselveiligheid",
    "voedselzekerheid",
    "landelijk gebied",
    "platteland",
    "boerenbedrijf",
  ],

  Dierenwelzijn: [
    "dierenwelzijn",
    "dierenbescherming",
    "landbouwhuisdieren",
    "huisdieren",
    "slachthuis",
    "proefdieren",
    "proefdier",
    "dierproeven",
    "jacht",
    "jagen",
    "wolf",
    "wolven",
    "roedel",
    "vee",
  ],

  "Buitenlandse Zaken & Mensenrechten": [
    "buitenlandse zaken",
    "taiwan",
    "sudan",
    "joods",
    "islam",
    "moslim",
    "diplomatie",
    "duits",
    "belg",
    "België",
    "afghanistan",
    "syrië",
    "china",
    "russische",
    "rusland",
    "russisch",
    "ambassade",
    "diplomaat",
    "internationaal recht",
    "mensenrechten",
    "netanyahu",
    "vervolgde christenen",
    "persona non grata",
    "ontwikkelingssamenwerking",
    "humanitaire hulp",
    "internationale samenwerking",
    "sancties",
    "verenigde naties",
    "verdrag",
    "internationaal gerechtshof",
    "mensenrechtenverdrag",
    "israel",
    "israël",
    "palestina",
    "palestijnse",
    "gaza",
    "westelijke jordaanoever",
    "jeruzalem",
    "hamas",
    "hezbollah",
    "unrwa",
    "strafhof",
    "genocideverdrag",
    "bezetting",
    "nederzettingen",
    "wapenstilstand",
  ],
};

const pageEllipsis = "...";
const voteFilters = ["Alle", "Al gestemd", "Nog niet gestemd"] as const;
const outcomeFilters = ["Alle", "Aangenomen", "Niet aangenomen"] as const;
type PartyOutcomeFilter = "Alle" | "Aangenomen" | "Niet aangenomen" | "Nog niet gestemd";
const partyMotionViews = ["Ingediend", "Eens", "Oneens"] as const;
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
  pvv: "/images/agents/pvv.png",
  pro: "/images/agents/PRO.jpg",
  sgp: "/images/agents/sgp.jpg",
  sp: "/images/agents/sp.svg",
  volt: "/images/agents/volt.png",
  vvd: "/images/agents/vvd.svg.webp",
  pvdd: "/images/agents/partij_voor_de_dieren.jpg",
};
const portraitLogoPaths = new Set([
  "/images/agents/markuszower.jpg",
  "/images/agents/Mona_Keijzer,_January_2025.jpg",
]);

function logoFitClass(logo: string, baseClass: string): string {
  return `${baseClass} ${portraitLogoPaths.has(logo) ? "object-cover" : "object-contain"}`;
}

function partyLogo(party: string): string | undefined {
  const normalizedParty = party.toLocaleLowerCase("nl-NL").replace(/[^a-z0-9]/g, "");
  const aliases: Record<string, string> = {
    boerburgerbeweging: "bbb",
    christendemocratischappel: "cda",
    democraten66: "d66",
    forumvoordemocratie: "fvd",
    nieuwesocialecontract: "nsc",
    partijvoordedieren: "pvdd",
    partijvoordevrijheid: "pvv",
    socialistischepartij: "sp",
    staatkundiggereformeerdepartij: "sgp",
    volkspartijvoorvrijheiden: "vvd",
    groenlinkspvda: "pro",
    markuszower: "groepmarkuszower",
    keijzer: "monakeijzer",
  };
  return partyLogos[aliases[normalizedParty] ?? normalizedParty];
}

function canonicalPartyName(party: string): string {
  const normalizedParty = party.toLocaleLowerCase("nl-NL").replace(/[^a-z0-9]/g, "");
  return normalizedParty === "groenlinkspvda" || normalizedParty === "pro" ? "PRO" : party;
}

function partyKey(party: string): string {
  return canonicalPartyName(party).toLocaleLowerCase("nl-NL").replace(/[^a-z0-9]/g, "");
}

function normalizeKeywordText(value: string): string {
  return value
    .toLocaleLowerCase("nl-NL")
    .replace(/[^\p{L}\p{N}-]+/gu, " ")
    .trim();
}

const compiledThemeKeywords = Object.entries(themeKeywords).map(([theme, keywords]) => ({
  theme,
  keywords: keywords.map(normalizeKeywordText),
}));
const motionThemeCache = new WeakMap<Motion, string[]>();
export const availableMotionThemes = Object.keys(themeKeywords);

export function themesForMotion(motion: Motion): string[] {
  const cachedThemes = motionThemeCache.get(motion);
  if (cachedThemes) return cachedThemes;

  const normalizedSubject = normalizeKeywordText(motion.subject);
  const subjectWords = normalizedSubject.split(" ");
  const paddedSubject = ` ${normalizedSubject} `;
  const themes = compiledThemeKeywords
    .filter(({ keywords }) => keywords.some((keyword) => {
      if (keyword.includes(" ")) {
        return paddedSubject.includes(` ${keyword} `);
      }

      return subjectWords.some((word) => keyword.length > 4
        ? word === keyword || word.startsWith(keyword)
        : word === keyword);
    }))
    .map(({ theme }) => theme);
  motionThemeCache.set(motion, themes);
  return themes;
}

function themeLabel(theme: string): string {
  return theme;
}

function compactThemeLabel(theme: string): string {
  const labels: Record<string, string> = {
    "Abortus & Reproductieve Zorg": "Abortus",
    "Buitenlandse Zaken & Mensenrechten": "Buitenland",
    "Digitale Overheid & Technologie": "Digitaal",
    "Gezin, Jeugd & Emancipatie": "Gezin & Jeugd",
    "Infrastructuur & Mobiliteit": "Mobiliteit",
    "Justitie & Rechtsstaat": "Rechtsstaat",
    "Klimaat & Milieu": "Klimaat",
    "Landbouw & Voedsel": "Landbouw",
    "Openbare Orde & Veiligheid": "Openbare veiligheid",
  };
  return labels[theme] ?? theme;
}

function radarLabel(theme: string): string {
  const labels: Record<string, string> = {
    "Abortus & Reproductieve Zorg": "Abortus",
    "Buitenlandse Zaken & Mensenrechten": "Buitenland",
    "Digitale Overheid & Technologie": "Digitaal",
    "Infrastructuur & Mobiliteit": "Mobiliteit",
    "Klimaat & Milieu": "Klimaat",
    "Openbare Orde & Veiligheid": "Veiligheid",
  };
  return labels[theme] ?? theme;
}

function partyMotionTitle(subject: string): string {
  const overIndex = subject.search(/\bover\b/i);
  const shortenedSubject = overIndex >= 0
    ? subject.slice(overIndex + "over".length).trim()
    : subject.trim();
  return shortenedSubject
    ? shortenedSubject.charAt(0).toLocaleUpperCase("nl-NL") + shortenedSubject.slice(1)
    : subject;
}

function formatDateInput(date: Date): string {
  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear(),
  ].join("-");
}

function parseDateInput(value: string): string {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (!match) return "";

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year)
    || date.getMonth() !== Number(month) - 1
    || date.getDate() !== Number(day)
  ) {
    return "";
  }
  return `${year}-${month}-${day}`;
}

function formatIsoDateInput(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

export default function MotionBrowser() {
  const [motions, setMotions] = useState<Motion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const defaultStartDate = "01-01-2026";
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState("");
  const [voteFilter, setVoteFilter] = useState<(typeof voteFilters)[number]>("Al gestemd");
  const [outcomeFilter, setOutcomeFilter] = useState<(typeof outcomeFilters)[number]>("Alle");
  const [submittingPartyFilter, setSubmittingPartyFilter] = useState("Alle");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedMotion, setSelectedMotion] = useState<MotionDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [partyMotionView, setPartyMotionView] =
    useState<(typeof partyMotionViews)[number]>("Ingediend");
  const [partyOutcomeFilter, setPartyOutcomeFilter] =
    useState<PartyOutcomeFilter>("Alle");
  const [partyThemeFilter, setPartyThemeFilter] = useState<string | null>(null);
  const [partyPage, setPartyPage] = useState(1);
  const [partyPageSize, setPartyPageSize] = useState(10);

  useEffect(() => {
    const dateInitialization = window.setTimeout(() => {
      const today = formatDateInput(new Date());
      setEndDate(today);
    }, 0);
    getCachedMotions()
      .then((data) => setMotions(data))
      .catch(() => setApiError(true))
      .finally(() => setIsLoading(false));
    return () => window.clearTimeout(dateInitialization);
  }, []);

  const submittingPartyOptions = useMemo(() => {
    const partyMap = new Map<string, string>();
    motions.forEach((motion) => {
      motion.submittingParties.forEach((party) => {
        partyMap.set(partyKey(party), canonicalPartyName(party));
      });
    });
    return [...partyMap.entries()]
      .sort(([, first], [, second]) => first.localeCompare(second, "nl-NL"));
  }, [motions]);

  const visibleMotions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("nl-NL");
    const startDateIso = parseDateInput(startDate);
    const endDateIso = parseDateInput(endDate);
    return motions.filter((motion) => {
      const themes = themesForMotion(motion);
      const matchesTheme = selectedThemes.length === 0 || selectedThemes.some((theme) => themes.includes(theme));
      const motionDate = motion.startedAt?.slice(0, 10) ?? "";
      const matchesStartDate = !startDateIso || motionDate >= startDateIso;
      const matchesEndDate = !endDateIso || motionDate <= endDateIso;
      const matchesVoteFilter = voteFilter === "Alle"
        || (voteFilter === "Al gestemd" && motion.hasVote)
        || (voteFilter === "Nog niet gestemd" && !motion.hasVote);
      const matchesOutcomeFilter = outcomeFilter === "Alle"
        || motion.outcome === outcomeFilter;
      const matchesSubmittingParty = submittingPartyFilter === "Alle"
        || motion.submittingParties.some((party) => partyKey(party) === submittingPartyFilter);
      const matchesSearch = !normalizedSearch
        || motion.subject.toLocaleLowerCase("nl-NL").includes(normalizedSearch)
        || motion.number.toLocaleLowerCase("nl-NL").includes(normalizedSearch);
      return matchesTheme && matchesStartDate && matchesEndDate && matchesVoteFilter && matchesOutcomeFilter && matchesSubmittingParty && matchesSearch;
    });
  }, [endDate, motions, outcomeFilter, search, selectedThemes, startDate, submittingPartyFilter, voteFilter]);

  const parties = useMemo(() => {
    const partyMap = new Map<string, { name: string; motions: Motion[] }>();
    motions.forEach((motion) => {
      const submittingParties = new Map(
        motion.submittingParties.map((party) => [partyKey(party), canonicalPartyName(party)]),
      );
      submittingParties.forEach((party, key) => {
        const current = partyMap.get(key);
        if (current) {
          current.motions.push(motion);
        } else {
          partyMap.set(key, { name: canonicalPartyName(party), motions: [motion] });
        }
      });
    });
    return [...partyMap.values()]
      .sort((a, b) => b.motions.length - a.motions.length);
  }, [motions]);

  const selectedPartyData = parties.find((party) => partyKey(party.name) === selectedParty);
  const submittedPartyMotions = selectedPartyData?.motions ?? [];
  const submittedPartyOutcomeCounts = {
    aangenomen: submittedPartyMotions.filter((motion) => motion.outcome === "Aangenomen").length,
    nietAangenomen: submittedPartyMotions.filter((motion) => motion.outcome === "Niet aangenomen").length,
    nogNietGestemd: selectedPartyData?.motions.filter((motion) => !motion.hasVote).length ?? 0,
  };
  const votedPartyMotions = selectedPartyData
    ? motions.filter((motion) => motion.votes.some((vote) => partyKey(vote.party) === partyKey(selectedPartyData.name)))
    : [];
  const partyMotionsForView = partyMotionView === "Ingediend"
    ? submittedPartyMotions
    : votedPartyMotions.filter((motion) => {
      const stance = motion.votes.find((vote) => partyKey(vote.party) === partyKey(selectedPartyData?.name ?? ""))?.stance;
      return partyMotionView === "Eens" ? stance === "Voor" : stance === "Tegen";
    });
  const partyMotions = partyMotionsForView.filter((motion) =>
    partyOutcomeFilter === "Alle"
    || (partyOutcomeFilter === "Nog niet gestemd" && !motion.hasVote)
    || motion.outcome === partyOutcomeFilter).filter((motion) =>
    !partyThemeFilter
    || (partyThemeFilter === "Anders"
      ? themesForMotion(motion).length === 0
      : themesForMotion(motion).includes(partyThemeFilter)));
  const partyProfileMotions = submittedPartyMotions.filter((motion) =>
    partyOutcomeFilter === "Alle"
    || (partyOutcomeFilter === "Nog niet gestemd" && !motion.hasVote)
    || motion.outcome === partyOutcomeFilter);
  const themeOccurrenceStats = useMemo(() => Object.keys(themeKeywords).map((theme) => ({
      theme,
      count: motions.filter((motion) => themesForMotion(motion).includes(theme)).length,
    })).sort((first, second) =>
      second.count - first.count || first.theme.localeCompare(second.theme, "nl-NL")), [motions]);
  const radarAxes = useMemo(() => {
    const europa = themeOccurrenceStats.find((item) => item.theme === "Europa");
    const selectedThemes = themeOccurrenceStats
      .filter((item) => item.theme !== "Gezin, Jeugd & Emancipatie" && item.theme !== "Europa")
      .slice(0, 8);
    if (europa) selectedThemes.push(europa);
    return selectedThemes
      .sort((first, second) =>
        second.count - first.count || first.theme.localeCompare(second.theme, "nl-NL"))
      .map(({ theme }) => ({ label: theme, themes: [theme] }));
  }, [themeOccurrenceStats]);
  const partyStats = selectedPartyData
    ? radarAxes.map((axis) => ({
      theme: axis.label,
      count: partyProfileMotions.filter((motion) => {
        const themes = themesForMotion(motion);
        return axis.themes.some((theme) => themes.includes(theme));
      }).length,
    }))
    : [];
  const partyCategoryStats = selectedPartyData
    ? Object.keys(themeKeywords).map((theme) => ({
      theme,
      count: partyProfileMotions.filter((motion) => themesForMotion(motion).includes(theme)).length,
    })).sort((first, second) =>
      second.count - first.count || first.theme.localeCompare(second.theme, "nl-NL"))
      .concat({
        theme: "Anders",
        count: partyProfileMotions.filter((motion) => themesForMotion(motion).length === 0).length,
      })
    : [];
  const maxPartyRadarCount = Math.max(1, ...partyStats.map((item) => item.count));
  const maxPartyThemeCount = Math.max(
    1,
    ...partyCategoryStats.map((item) => item.count),
  );
  const partyTotalPages = Math.max(1, Math.ceil(partyMotions.length / partyPageSize));
  const currentPartyPage = Math.min(partyPage, partyTotalPages);
  const paginatedPartyMotions = partyMotions.slice(
    (currentPartyPage - 1) * partyPageSize,
    currentPartyPage * partyPageSize,
  );

  function selectParty(party: string) {
    setSelectedParty(party);
    setPartyMotionView("Ingediend");
    setPartyOutcomeFilter("Alle");
    setPartyThemeFilter(null);
    setPartyPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(visibleMotions.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedMotions = visibleMotions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((pageNumber) => (
      pageNumber === 1
      || pageNumber === totalPages
      || Math.abs(pageNumber - currentPage) <= 1
    ))
    .reduce<(number | string)[]>((pages, pageNumber, index, filteredPages) => {
      const previousPage = filteredPages[index - 1];
      if (previousPage && pageNumber - previousPage > 1) {
        pages.push(pageEllipsis);
      }
      pages.push(pageNumber);
      return pages;
    }, []);

  function resetPage() {
    setPage(1);
  }

  function toggleTheme(theme: string) {
    resetPage();
    setSelectedThemes((current) => current.includes(theme)
      ? current.filter((item) => item !== theme)
      : [...current, theme]);
  }

  async function openMotion(motion: Motion) {
    setSelectedMotion(null);
    setDetailError(false);
    setIsDetailLoading(true);
    try {
      const response = await fetch(`/api/motions/${motion.id}`);
      if (!response.ok) throw new Error("Detail request failed");
      setSelectedMotion(await response.json() as MotionDetail);
    } catch {
      setDetailError(true);
    } finally {
      setIsDetailLoading(false);
    }
  }

  return (
    <>
      <section
        id="partijen"
        className="md3-browser border-y border-[var(--md-outline-variant)] py-10 sm:py-14"
      >
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-600">
            Partijen
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Waar zetten partijen zich voor in?
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Kies een partij om de ingediende moties, hun stemgedrag en de
            belangrijkste thema&apos;s te bekijken.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Partijen worden opgehaald...
          </div>
        ) : apiError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-700">
            De partijgegevens konden niet worden opgehaald.
          </div>
        ) : parties.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Er zijn nog geen indienende partijen beschikbaar.
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {parties.map((party) => {
                const isSelected = selectedParty === partyKey(party.name);
                const logo = partyLogo(party.name);
                return (
                  <button
                    key={partyKey(party.name)}
                    type="button"
                    onClick={() =>
                      isSelected
                        ? setSelectedParty(null)
                        : selectParty(partyKey(party.name))
                    }
                    aria-pressed={isSelected}
                    className={`flex min-h-20 min-w-0 items-center cursor-pointer gap-3 rounded-2xl border p-3 text-left transition hover:border-blue-300 hover:shadow-sm sm:p-4 ${isSelected ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white"}`}
                  >
                    {logo ? (
                      <Image
                        src={logo}
                        alt=""
                        width={42}
                        height={42}
                        className={logoFitClass(logo, "size-11 rounded-full bg-white p-1")}
                      />
                    ) : (
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                        {party.name.slice(0, 3).toUpperCase()}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-slate-900">
                        {party.name}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {party.motions.length}{" "}
                        {party.motions.length === 1 ? "motie" : "moties"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedPartyData && (
              <div className="mt-8 min-w-0 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]">
                <div className="min-w-0">
                  <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-slate-950">
                        {selectedPartyData.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Bekijk ingediende moties of het algemene stemgedrag van deze partij
                      </p>
                      {partyMotionView === "Ingediend" && (
                        <div className="mt-3 flex max-w-full flex-wrap gap-2 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => {
                            setPartyOutcomeFilter("Alle");
                            setPartyThemeFilter(null);
                            setPartyPage(1);
                          }}
                          className={`cursor-pointer rounded-full px-3 py-1.5 hover:bg-blue-100 ${partyOutcomeFilter === "Alle" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-50 text-blue-700"}`}
                        >
                          {submittedPartyMotions.length} alle moties
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPartyOutcomeFilter("Aangenomen");
                            setPartyPage(1);
                          }}
                          className="cursor-pointer rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 hover:bg-emerald-100"
                        >
                          {submittedPartyOutcomeCounts.aangenomen} aangenomen
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPartyOutcomeFilter("Niet aangenomen");
                            setPartyPage(1);
                          }}
                          className="cursor-pointer rounded-full bg-rose-50 px-3 py-1.5 text-rose-700 hover:bg-rose-100"
                        >
                          {submittedPartyOutcomeCounts.nietAangenomen} niet aangenomen
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPartyOutcomeFilter("Nog niet gestemd");
                            setPartyPage(1);
                          }}
                          className="cursor-pointer rounded-full bg-slate-100 px-3 py-1.5 text-slate-600 hover:bg-slate-200"
                        >
                          {submittedPartyOutcomeCounts.nogNietGestemd} nog niet gestemd
                        </button>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedParty(null)}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Sluiten
                    </button>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {partyMotionViews.map((view) => (
                      <button
                        key={view}
                        type="button"
                        onClick={() => {
                          setPartyMotionView(view);
                          if (view !== "Ingediend") {
                            setPartyOutcomeFilter("Alle");
                          }
                          setPartyPage(1);
                        }}
                        aria-pressed={partyMotionView === view}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition ${partyMotionView === view ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}
                      >
                        {view === "Ingediend" ? "Ingediende moties" : view}
                      </button>
                    ))}
                  </div>
                  <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white cursor-pointer">
                    {paginatedPartyMotions.map((motion) => {
                      return (
                        <button
                          key={motion.id}
                          type="button"
                          onClick={() => openMotion(motion)}
                          className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-blue-50/40 cursor-pointer"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-900">
                              {partyMotionTitle(motion.subject)}
                            </span>
                            <span className="mt-1 block text-xs text-slate-500">
                              {motion.number} ·{" "}
                              {formatMotionDate(motion.startedAt)}
                            </span>
                          </span>
                          <span className="flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-1 sm:max-w-[48%]">
                            {themesForMotion(motion).map((theme) => (
                              <span
                                key={theme}
                                className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold leading-4 text-blue-700"
                              >
                                {compactThemeLabel(theme)}
                              </span>
                            ))}
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(event) => {
                                event.stopPropagation();
                                if (motion.outcome === "Nog niet gestemd") {
                                  setPartyOutcomeFilter("Nog niet gestemd");
                                } else {
                                  setPartyOutcomeFilter(motion.outcome);
                                }
                                setPartyPage(1);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  if (motion.outcome === "Nog niet gestemd") {
                                    setPartyOutcomeFilter("Nog niet gestemd");
                                  } else {
                                    setPartyOutcomeFilter(motion.outcome);
                                  }
                                  setPartyPage(1);
                                }
                              }}
                              className={`cursor-pointer rounded-full px-2 py-0.5 text-[10px] font-bold leading-4 hover:opacity-80 ${motion.outcome === "Aangenomen" ? "bg-emerald-50 text-emerald-700" : motion.outcome === "Niet aangenomen" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-500"}`}
                            >
                              {motion.outcome}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {partyMotions.length > 0 && (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <label className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Per pagina</span>
                        <select
                          value={partyPageSize}
                          onChange={(event) => {
                            setPartyPageSize(Number(event.target.value));
                            setPartyPage(1);
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          {[10, 20, 30].map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setPartyPage((current) => Math.max(1, current - 1))
                          }
                          disabled={currentPartyPage === 1}
                          className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ← Vorige
                        </button>
                        <span className="min-w-24 text-center text-sm text-slate-500">
                          Pagina {currentPartyPage} van {partyTotalPages}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setPartyPage((current) =>
                              Math.min(partyTotalPages, current + 1),
                            )
                          }
                          disabled={currentPartyPage === partyTotalPages}
                          className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Volgende →
                        </button>
                      </div>
                    </div>
                  )}
                  {partyMotions.length === 0 && (
                    <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      Deze partij heeft nog geen geregistreerde stemmingen op
                      haar ingediende moties.
                    </p>
                  )}
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="p-5 pb-4">
                    <h3 className="font-bold text-slate-950">Themaprofiel</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Aantal ingediende moties per thema.
                    </p>
                  </div>
                  {partyStats.length > 0 ? (
                    <>
                      <div className="mx-4 overflow-hidden rounded-2xl bg-[#070a0f] px-1 py-4 shadow-inner sm:mx-5 sm:px-2 sm:py-5">
                        <svg
                          viewBox="0 0 420 400"
                          role="img"
                          aria-label={`Themaprofiel van ${selectedPartyData.name}`}
                          className="w-full"
                        >
                          <defs>
                            <linearGradient id="profileFill" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#4da3ff" stopOpacity="0.42" />
                              <stop offset="100%" stopColor="#1677d2" stopOpacity="0.12" />
                            </linearGradient>
                            <filter id="profileGlow" x="-40%" y="-40%" width="180%" height="180%">
                              <feGaussianBlur stdDeviation="3" result="blur" />
                              <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          {[31, 62, 94, 125].map((radius) => (
                            <polygon
                              key={radius}
                              points={radarAxes
                                .map((_, index) => {
                                  const angle =
                                    -Math.PI / 2 +
                                    (index * Math.PI * 2) / radarAxes.length;
                                  return `${210 + Math.cos(angle) * radius},${175 + Math.sin(angle) * radius}`;
                                })
                                .join(" ")}
                              fill="none"
                              stroke="#33404f"
                              strokeWidth={radius === 125 ? 1.5 : 1}
                              strokeDasharray={radius === 125 ? undefined : "2 5"}
                            />
                          ))}
                          {radarAxes.map((_, index) => {
                            const angle =
                              -Math.PI / 2 +
                              (index * Math.PI * 2) / radarAxes.length;
                            return (
                              <line
                                key={index}
                                x1="210"
                                y1="175"
                                x2={210 + Math.cos(angle) * 125}
                                y2={175 + Math.sin(angle) * 125}
                                stroke="#293542"
                                strokeWidth="1"
                              />
                            );
                          })}
                          <polygon
                            points={partyStats
                              .map((item, index) => {
                                const angle =
                                  -Math.PI / 2 +
                                  (index * Math.PI * 2) / partyStats.length;
                                const radius =
                                  125 * (item.count / maxPartyRadarCount);
                                return `${210 + Math.cos(angle) * radius},${175 + Math.sin(angle) * radius}`;
                              })
                              .join(" ")}
                            fill="url(#profileFill)"
                            stroke="#4da3ff"
                            strokeWidth="2.5"
                            filter="url(#profileGlow)"
                          />
                          {partyStats.map((item, index) => {
                            const angle =
                              -Math.PI / 2 +
                              (index * Math.PI * 2) / partyStats.length;
                            const radius = 125 * (item.count / maxPartyRadarCount);
                            const x = 210 + Math.cos(angle) * radius;
                            const y = 175 + Math.sin(angle) * radius;
                            const labelX = 210 + Math.cos(angle) * 154;
                            const labelY = 175 + Math.sin(angle) * 154;
                            const textAnchor = Math.cos(angle) > 0.25
                              ? "start"
                              : Math.cos(angle) < -0.25
                                ? "end"
                                : "middle";
                            return (
                              <g
                                key={item.theme}
                                role="button"
                                tabIndex={0}
                                aria-label={`Filter op ${radarLabel(item.theme)}`}
                                onClick={() => {
                                  setPartyThemeFilter((current) =>
                                    current === item.theme ? null : item.theme);
                                  setPartyPage(1);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    setPartyThemeFilter((current) =>
                                      current === item.theme ? null : item.theme);
                                    setPartyPage(1);
                                  }
                                }}
                                className="cursor-pointer"
                              >
                                <circle cx={x} cy={y} r="3.5" fill="#4da3ff" stroke="#d8efff" strokeWidth="1.5" />
                                <text
                                  x={labelX}
                                  y={labelY}
                                  textAnchor={textAnchor}
                                  dominantBaseline="middle"
                                  fill="#d9e4f1"
                                  className="text-[9px] font-semibold"
                                >
                                  {radarLabel(item.theme)}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                      <div className="grid gap-2 p-5 sm:grid-cols-2">
                        {partyCategoryStats.map((item) => (
                              <button
                                type="button"
                                key={item.theme}
                                onClick={() => {
                                  setPartyThemeFilter((current) =>
                                    current === item.theme ? null : item.theme);
                                  setPartyPage(1);
                                }}
                                aria-pressed={partyThemeFilter === item.theme}
                                className={`min-w-0 cursor-pointer rounded-xl px-3 py-2 text-left transition ${partyThemeFilter === item.theme ? "bg-blue-100 ring-2 ring-blue-300" : "bg-slate-50 hover:bg-blue-50"}`}
                              >
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="min-w-0 flex-1 break-words leading-4 text-slate-600">{themeLabel(item.theme)}</span>
                              <strong className="text-slate-900">{item.count}</strong>
                            </div>
                            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-blue-500 transition-all"
                                style={{
                                  width: `${Math.max(0, Math.min(100, (item.count / maxPartyThemeCount) * 100))}%`,
                                }}
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="mt-5 text-sm text-slate-500">
                      Nog onvoldoende thema-informatie.
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <PartySpectrum motions={motions} />

      <section id="moties" className="md3-browser py-10 sm:py-14">
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-600">
              Moties
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Alle moties
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {motions.length.toLocaleString("nl-NL")} moties rechtstreeks uit
              de Tweede Kamer API
            </p>
          </div>
          <label className="w-full lg:max-w-xs">
            <span className="sr-only">Zoek moties</span>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetPage();
              }}
              placeholder="Zoek op onderwerp of nummer"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>

        <div className="-mx-1 mb-7 flex flex-nowrap items-center gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&>button]:shrink-0">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            Thema
          </span>
          {themeOccurrenceStats.map(({ theme, count }) => (
            <button
              key={theme}
              onClick={() => toggleTheme(theme)}
              aria-pressed={selectedThemes.includes(theme)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${selectedThemes.includes(theme) ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}
            >
              <span>{themeLabel(theme)}</span>
              <span className="ml-1 opacity-70">({count})</span>
            </button>
          ))}
          {(selectedThemes.length > 0 ||
            search ||
            startDate !== defaultStartDate ||
            endDate ||
            voteFilter !== "Al gestemd" ||
            outcomeFilter !== "Alle" ||
            submittingPartyFilter !== "Alle") && (
            <button
              onClick={() => {
                setSelectedThemes([]);
                setSearch("");
                setStartDate(defaultStartDate);
                setEndDate(formatDateInput(new Date()));
                setVoteFilter("Al gestemd");
                setOutcomeFilter("Alle");
                setSubmittingPartyFilter("Alle");
                resetPage();
              }}
              className="ml-2 text-xs cursor-pointer font-semibold text-blue-600 hover:text-blue-800"
            >
              Wis filters
            </button>
          )}
        </div>

        <div className="-mx-1 mb-7 flex flex-nowrap items-center gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&>button]:shrink-0">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            Stemming
          </span>
          {voteFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setVoteFilter(filter);
                resetPage();
              }}
              aria-pressed={voteFilter === filter}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${voteFilter === filter ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="-mx-1 mb-7 flex flex-nowrap items-center gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&>button]:shrink-0">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            Uitkomst
          </span>
          {outcomeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setOutcomeFilter(filter);
                resetPage();
              }}
              aria-pressed={outcomeFilter === filter}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${outcomeFilter === filter ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="submitting-party-filter" className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Indiener
          </label>
          <select
            id="submitting-party-filter"
            value={submittingPartyFilter}
            onChange={(event) => {
              setSubmittingPartyFilter(event.target.value);
              resetPage();
            }}
            className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-sm"
          >
            <option value="Alle">Alle partijen</option>
            {submittingPartyOptions.map(([key, party]) => (
              <option key={key} value={key}>{party}</option>
            ))}
          </select>
        </div>

        <div className="mb-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="start-date"
              className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400"
            >
              Vanaf
            </label>
            <input
              id="start-date"
              type="date"
              value={parseDateInput(startDate)}
              onChange={(event) => {
                setStartDate(formatIsoDateInput(event.target.value));
                resetPage();
              }}
              className="w-full cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="end-date"
              className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400"
            >
              Tot en met
            </label>
            <input
              id="end-date"
              type="date"
              value={parseDateInput(endDate)}
              onChange={(event) => {
                setEndDate(formatIsoDateInput(event.target.value));
                resetPage();
              }}
              className="w-full cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <p className="text-xs text-slate-400 sm:max-w-xs">
            Filter moties op de datum waarop ze zijn ingediend.
          </p>
        </div>

        <p className="mb-3 text-sm text-slate-500">
          {visibleMotions.length.toLocaleString("nl-NL")} resultaten
        </p>
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Moties worden opgehaald...
          </div>
        ) : apiError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-700">
            De moties konden niet worden opgehaald uit de Tweede Kamer API.
          </div>
        ) : visibleMotions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Geen moties gevonden voor deze filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {paginatedMotions.map((motion) => (
              <button
                key={motion.id}
                type="button"
                onClick={() => openMotion(motion)}
                className="flex w-full cursor-pointer flex-col gap-3 p-4 text-left transition hover:bg-blue-50/40 sm:p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="mb-1 font-mono text-xs text-slate-400">
                    Motie {motion.number}
                  </p>
                  <h3 className="font-semibold text-slate-900">
                    {motion.subject}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatMotionDate(motion.startedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  {themesForMotion(motion).map((theme) => (
                    <span
                      key={theme}
                      className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
                    >
                      {themeLabel(theme)}
                    </span>
                  ))}
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${motion.outcome === "Aangenomen" ? "bg-emerald-50 text-emerald-700" : motion.outcome === "Niet aangenomen" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    {motion.outcome}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {motion.meetingYear ?? "Onbekend"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
        {visibleMotions.length > 0 && (
          <div className="mt-5 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-500">
              <span>Per pagina</span>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  resetPage();
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {[10, 20, 30].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex min-w-0 w-full items-center gap-2 sm:w-auto sm:gap-3">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
                className="min-h-11 flex-1 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-4"
              >
                ← Vorige
              </button>
              <span className="min-w-0 flex-1 text-center text-sm text-slate-500 sm:min-w-20 sm:flex-none">
                Pagina {currentPage} van {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={currentPage === totalPages}
                className="min-h-11 flex-1 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-4"
              >
                Volgende →
              </button>
            </div>
            <nav
              className="hidden flex-wrap items-center justify-center gap-1 sm:flex"
              aria-label="Paginanavigatie"
            >
              {pageNumbers.map((pageNumber, index) =>
                typeof pageNumber === "string" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-sm text-slate-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    aria-current={
                      currentPage === pageNumber ? "page" : undefined
                    }
                    className={`grid size-9 cursor-pointer place-items-center rounded-lg text-sm font-semibold transition ${currentPage === pageNumber ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"}`}
                  >
                    {pageNumber}
                  </button>
                ),
              )}
            </nav>
          </div>
        )}
        {(isDetailLoading || detailError || selectedMotion) && (
          <div
            className="md3-dialog-scrim fixed inset-0 z-50 grid place-items-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Motiedetails"
          >
            <div className="md3-card max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="font-mono text-xs text-slate-400">
                    Motiedetails
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    {selectedMotion?.subject ?? "Motie wordt geladen"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMotion(null);
                    setDetailError(false);
                  }}
                  className="grid min-h-11 min-w-11 size-11 shrink-0 cursor-pointer place-items-center rounded-lg text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Sluiten"
                >
                  ×
                </button>
              </div>
              {isDetailLoading ? (
                <p className="mt-8 text-sm text-slate-500">
                  Motie, stemmingen en document worden opgehaald...
                </p>
              ) : detailError ? (
                <p className="mt-8 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
                  De details konden niet worden opgehaald.
                </p>
              ) : (
                selectedMotion && (
                  <>
                    <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 font-mono">
                        {selectedMotion.number}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1.5">
                        {formatMotionDate(selectedMotion.startedAt)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1.5 font-semibold ${selectedMotion.outcome === "Aangenomen" ? "bg-emerald-50 text-emerald-700" : selectedMotion.outcome === "Niet aangenomen" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        {selectedMotion.outcome}
                      </span>
                    </div>
                    <section className="mt-8">
                      <h3 className="text-lg font-bold text-slate-950">
                        Ingediend door
                      </h3>
                      {selectedMotion.submittingParties.length === 0 ? (
                        <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                          De indienende partij is niet geregistreerd.
                        </p>
                      ) : (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {[
                            ...new Map(
                              selectedMotion.submittingParties.map((party) => [
                                partyKey(party),
                                canonicalPartyName(party),
                              ]),
                            ).values(),
                          ].map((displayParty) => {
                            const logo = partyLogo(displayParty);
                            return (
                              <span
                                key={displayParty}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-100 py-1.5 pl-1.5 pr-3 text-sm text-slate-700"
                              >
                                {logo ? (
                                  <Image
                                    src={logo}
                                    alt=""
                                    width={24}
                                    height={24}
                                    className={logoFitClass(logo, "size-6 rounded-full")}
                                  />
                                ) : (
                                  <span className="grid size-6 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-500">
                                    {displayParty.slice(0, 2).toUpperCase()}
                                  </span>
                                )}
                                {displayParty}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </section>
                    <section className="mt-8">
                      <h3 className="text-lg font-bold text-slate-950">
                        Tekst van de motie
                      </h3>
                      <p className="mt-3 whitespace-pre-line rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                        {selectedMotion.text}
                      </p>
                    </section>
                    <section className="mt-8">
                      <h3 className="text-lg font-bold text-slate-950">
                        Stemmingen per partij
                      </h3>
                      {selectedMotion.votes.length === 0 ? (
                        <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                          Er is nog geen geregistreerde stemming voor deze
                          motie.
                        </p>
                      ) : (
                        <div className="mt-4 grid gap-5 sm:grid-cols-2">
                          {(["Voor", "Tegen"] as const).map((stance) => {
                            const parties = [
                              ...new Map(
                                selectedMotion.votes
                                  .filter((vote) => vote.stance === stance)
                                  .map((vote) => [
                                    partyKey(vote.party),
                                    {
                                      ...vote,
                                      party: canonicalPartyName(vote.party),
                                    },
                                  ]),
                              ).values(),
                            ];
                            return (
                              <div
                                key={stance}
                                className="rounded-2xl border border-slate-200 p-4"
                              >
                                <div className="flex items-center justify-between">
                                  <h4
                                    className={`font-bold ${stance === "Voor" ? "text-emerald-700" : "text-rose-700"}`}
                                  >
                                    {stance}
                                  </h4>
                                  <span className="text-sm text-slate-400">
                                    {parties.length}
                                  </span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {parties.map((vote) => {
                                    const displayParty = canonicalPartyName(
                                      vote.party,
                                    );
                                    const logo = partyLogo(displayParty);
                                    return (
                                      <span
                                        key={displayParty}
                                        className="inline-flex items-center gap-2 rounded-full bg-slate-100 py-1.5 pl-1.5 pr-3 text-sm text-slate-700"
                                      >
                                        {logo ? (
                                          <Image
                                            src={logo}
                                            alt=""
                                            width={24}
                                            height={24}
                                            className={logoFitClass(logo, "size-6 rounded-full")}
                                          />
                                        ) : (
                                          <span className="grid size-6 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-500">
                                            {displayParty
                                              .slice(0, 2)
                                              .toUpperCase()}
                                          </span>
                                        )}
                                        {displayParty}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
