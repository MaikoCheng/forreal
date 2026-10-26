"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getCachedMotions } from "@/lib/motion-client";
import { formatMotionDate, type Motion, type MotionDetail } from "@/lib/motions";
import { logoFitClass, partyLogo } from "./MotionBrowser";

const profileMotionKeywords: Record<string, string[]> = {
  sexuality: ["lgbt", "homoseks", "transgender", "genderidentiteit", "gelijke rechten", "discriminatie"],
  religion: ["religie", "godsdienst", "kerk", "islam", "christelijk", "religieuze school", "zondagsrust"],
  housing: ["woon", "woning", "huur", "huisvesting", "hypotheek", "woningbouw"],
  age: ["jongeren", "jeugd", "ouderen", "pensioen", "aow", "student", "generatie"],
  employment: ["werk", "arbeid", "werknemer", "werkloos", "zzp", "ondernemer", "vakbond", "minimumloon"],
  care: ["zorg", "beperking", "chronisch", "mantelzorg", "toegankelijkheid", "ziekte", "ggz"],
  children: ["kinderen", "kindgebonden budget", "kinderopvang", "ouderschapsverlof", "jeugdzorg", "gezinnen"],
};

const profileFieldLabels: Record<string, string> = {
  sexuality: "Seksualiteit",
  religion: "Religie",
  housing: "Wonen",
  age: "Leeftijdsgroep",
  employment: "Werk en inkomen",
  care: "Zorg of beperking",
  children: "Kinderen",
};

const profileOptionLabels: Record<string, string> = {
  "chronische aandoening": "Chronische aandoening",
  beperking: "Beperking",
  mantelzorger: "Mantelzorger",
  "ggz / mentale gezondheid": "GGZ / mentale gezondheid",
  "in loondienst": "In loondienst",
  "zelfstandig / zzp": "Zelfstandig / zzp",
  "werkloos of werkzoekend": "Werkloos of werkzoekend",
  student: "Student",
  gepensioneerd: "Gepensioneerd",
  "onbetaald zorgend": "Onbetaald zorgend",
  "sociale huur": "Sociale huur",
  "particuliere huur": "Particuliere huur",
  "koopwoning met hypotheek": "Koopwoning met hypotheek",
  "koopwoning zonder hypotheek": "Koopwoning zonder hypotheek",
  "dak- of thuisloos": "Dak- of thuisloos",
  "18–24": "18–24",
  "25–44": "25–44",
  "45–66": "45–66",
  "67 of ouder": "67 of ouder",
  hetero: "Hetero",
  "lgbtq+": "LGBTQ+",
  christelijk: "Christelijk",
  islamitisch: "Islamitisch",
  joods: "Joods",
  "hindoeïstisch": "Hindoeïstisch",
  boeddhistisch: "Boeddhistisch",
  "andere religie": "Andere religie",
  "ja, kind(eren) onder 18": "Kind(eren) onder 18",
  "ja, kind(eren) van 18–24": "Kind(eren) van 18–24",
  "ja, alleen kind(eren) van 25 jaar of ouder": "Alleen kind(eren) van 25 jaar of ouder",
};

const profileIrrelevantKeywords: Record<string, string[]> = {};

const profileOptionIrrelevantKeywords: Record<string, Record<string, string[]>> = {
  age: {
    "18–24": [
      "samenhang tussen religieuze achtergrond en lhbti-opvattingen onder jongeren",
      "religieuze achtergrond en lhbti-opvattingen",
      "ouderen",
      "ouderenzorg",
      "dementie",
      "ouderen met dementie",
      "gepensioneerden",
      "pensioen",
      "aow",
      "nabestaanden",
      "oudere werknemers",
    ],
    "25–44": [
      "jongeren",
      "jeugd",
      "studenten",
      "student",
      "jongerenorganisaties",
      "jongerenwelzijn",
      "studentenwelzijn",
      "mbo-studenten",
      "jongerenwoningen",
    ],
    "45–66": [
      "jongeren",
      "jeugd",
      "studenten",
      "student",
      "jongerenorganisaties",
      "jongerenwelzijn",
      "studentenwelzijn",
      "mbo-studenten",
      "jongerenwoningen",
      "asielzoekers",
      "asielzoeker",
      "arbeidsmarkt voor asielzoekers",
      "wachttermijn voor toegang van asielzoekers",
      "vreemdelingen",
      "statushouders",
      "zorgaanbieder en vertegenwoordiger",
      "gehandicaptenzorg",
      "bezuinigingen op de gehandicaptenzorg",
      "mantelzorgers",
      "kwaliteit van leven",
      "16- en 17-jarigen",
      "vanaf 14 jaar",
      "volwassenenstrafrecht",
      "zeden- en geweldsdelicten",
      "zeer ernstige gewelds- en zedenmisdrijven",
      "arbeidsmarktpakket",
      "resterende arbeidsmarktpakket",
      "energienoodfonds",
      "noodfonds energie",
      "tijdelijk noodfonds energie",
      "lage en middeninkomens",
      "middeninkomens aanspraak",
    ],
    "67 of ouder": [
      "jongeren",
      "jeugd",
      "studenten",
      "student",
      "jongerenorganisaties",
      "jongerenwelzijn",
      "studentenwelzijn",
      "mbo-studenten",
      "jongerenwoningen",
      "asielzoekers",
      "asielzoeker",
      "statushouders",
      "statushouder",
      "vreemdelingen",
      "syrische",
      "misdrijf",
      "strafbare feiten",
      "gezinsversterking",
      "ouderschapsprogramma",
      "ouderschapsverlof",
      "fmo-documenten",
      "fmo-documenten en informatie",
      "erf- en schenkbelasting",
      "ouders en kinderen",
      "mestvergisting",
      "sde++",
      "intensieve veehouderij",
      "zorgaanbieder en vertegenwoordiger",
      "budgethouder",
      "eigen regie van de budgethouder",
      "pelsdierhouders",
      "pelsdierhouder",
      "veehouderij",
      "veehouder",
      "antibioticagebruik",
      "geitenhouderijen",
      "pluimveehouderij",
      "fijnstof",
      "dierwaardige veehouderij",
      "bestrijdingsmiddelen",
      "ouderlijke verantwoordelijkheden",
      "toezichthouders kunnen handhaven",
      "ouders en de behoefte van het kind",
      "aanbod passend",
    ],
  },
  employment: {
    "in loondienst": [
      "migratiesamenwerking",
      "asiel",
      "vluchteling",
      "defensie",
      "militaire samenwerking",
      "nucleaire samenwerking",
      "eu-associatieverdrag",
      "israël",
      "inlaatwerk",
      "koelwaterregels",
      "maatschappelijke weerbaarheid",
      "crisisvoorbereiding",
      "raamcontract",
      "raamcontracten",
      "public procurement act",
      "aanbesteding",
      "inkoop van kritieke capaciteiten",
      "kritieke capaciteiten",
      "special war facility contracts",
      "draagmoeders",
      "draagmoeder",
      "moeder en kind",
      "jeugddelinquent",
      "jeugddelinquenten",
      "intensief traject",
      "fysieke vorming",
      "vaste lasten",
      "lokaal verdienvermogen",
      "technische levensduur",
      "bouw elementen",
      "bouwelementen",
      "wlc-gwp",
      "beschouwingsperiode",
      "agrarische belangenorganisaties",
      "landbouw",
      "strategisch gasbeleid",
      "langetermijnimportcontracten",
      "leveringszekerheid",
      "arbeidsmigratie",
      "arbeidsmigranten",
      "arbeidsmigrant",
      "werkvergunningen",
      "werknemers uit andere eu-lidstaten",
      "ongecontracteerde zorg",
      "ongecontracteerde zorg niet afschaffen",
      "langdurige zorg",
      "exclusiecriteria",
      "voorkomen van dakloosheid",
      "veel arbeidsmigranten",
    ],
    "zelfstandig / zzp": [
      "landbouw",
      "defensie",
      "militaire",
      "wapensystemen",
      "nationale crisis",
      "brandweerkazernes",
      "arbeidsmigratie",
      "asielzoekers",
      "landbouwbeleid",
      "zelfstandig kan opereren",
      "besluit kwaliteit leefomgeving",
      "omgevingsregeling",
      "impactanalyse",
      "woo-besluiten",
      "zienswijzeprocedures",
      "europa volledig zelfstandig",
      "pijler binnen de navo",
      "zelfstandig wetsvoorstel",
      "binnen de navo",
      "voortrekkersrol",
      "zelfstandig wegen",
      "zelfstandig uitbrengen van een stem",
      "hulpmiddelen",
      "sekswerker",
      "onzelfstandige woningen voor studenten",
      "studentensteden",
      "zelfstandig kernbegrip",
      "wetenschappelijke gedragscode",
      "publieke kennis- en onderwijsinstellingen",
      "voorbeeldfiguren in wetenschap",
    ],
    "werkloos of werkzoekend": [
      "rechtsbijstand",
      "macrofinanciële bijstand",
      "financiële bijstand aan nieuwkomers",
      "migratiepact",
      "egypte",
      "defensie",
      "landbouw",
      "gasbeleid",
      "pensioen",
      "ouderenzorg",
      "arbeidsmigratie",
    ],
    student: [
      "studentenraad",
      "studentenvereniging",
      "studentenhuisvesting",
      "studenten van",
      "studenten aan",
      "studentenvisa",
      "studenten die betrokken zijn bij strafbare feiten",
      "antidrugscampagne",
      "maritieme archeologie",
      "buitenlandse studenten",
      "ernstige ordeverstoringen",
    ],
    gepensioneerd: [
      "student",
      "jongeren",
      "arbeidsmigratie",
      "asielzoekers",
      "arbeidsmarkt voor jongeren",
      "kernenergieprojecten",
      "defensie-uitgaven",
    ],
    "onbetaald zorgend": [
      "arbeidsmigratie",
      "defensie",
      "landbouw",
      "onderwijs",
      "zorgaanbieder en vertegenwoordiger",
    ],
  },
  care: {
    "chronische aandoening": [
      "migratiebeperking",
      "handelsbeperkingen",
      "vetorecht",
      "woningbouw",
      "arbeidsmigranten",
      "zorgaanbieder en vertegenwoordiger",
      "zorgverzekering",
      "zorgpremie",
      "ziekenhuisfinanciering",
    ],
    beperking: [
      "migratiebeperking",
      "handelsbeperkingen",
      "beperking van de brandstoftransitieverplichting",
      "productiebeperkingen door koelwaterregels",
      "autonome wapensystemen",
      "landbouw en visserij",
      "vetorecht",
      "woningbouw",
      "buitenstedelijke woningbouw",
      "arbeidsmigranten",
      "toegankelijkheid van woningen",
      "asielinstroom",
      "militaire goederen",
      "doorlevering",
      "bedrijfsartsen",
      "arbozorg",
      "doorstroomtoets",
      "digitale toegankelijkheid van de overheid",
      "belastingvermindering energiebelasting",
      "zorgaanbieder en vertegenwoordiger",
      "zorgverzekering",
      "zorgpremie",
    ],
    mantelzorger: [
      "zorgverzekering",
      "zorgpremie",
    ],
    "ggz / mentale gezondheid": [
      "algemene zorg",
      "zorgaanbieder en vertegenwoordiger",
      "zorgverzekering",
      "zorgpremie",
      "lichamelijke beperking",
      "digitale toegankelijkheid",
      "asielketen",
      "terugkeerhubs",
      "leerplichtambtenaar",
      "onbegrepen gedrag tussen de politie",
      "vrijstellingen op lichamelijke of psychische gronden",
    ],
  },
  children: {
    "ja, kind(eren) onder 18": [],
    "ja, kind(eren) van 18–24": [
      "defensie-enquête",
      "justitiële aantekening",
      "sancties indien jongeren",
      "jongeren te maken krijgen met sancties",
      "opkomstplicht",
      "vrijheidsstraf",
      "religieuze achtergrond en lhbti-opvattingen",
      "lhbti-opvattingen onder jongeren",
      "sociale school- en onderwijscultuur",
      "onderwijsomgeving",
      "mentale gezondheid en een bovenmatige nadruk",
      "onderwijseigen bijdrage aan het welzijn van jongeren",
      "kinderen en jongeren die geen onderwijs volgen",
      "inclusief onderwijs",
      "buy now, pay later",
      "klanten van prostitutie",
      "elektrische fietsen onder jongeren",
      "minimumleeftijd van 14 jaar",
      "helmplicht tot 18 jaar",
      "gezinnen met een jeugdbeschermingsmaatregel",
      "kinderen in de jeugdbescherming",
      "digitale veiligheid van jongeren",
      "jongeren met een verhoogd risico op criminaliteit",
      "financiële situatie van jongeren",
      "jongeren met complexe multiproblematiek",
      "jongerenwerkers",
      "jongerenwerkorganisaties",
      "jongerenwerk in school",
    ],
    "ja, alleen kind(eren) van 25 jaar of ouder": [],
    nee: [],
  },
  housing: {
    "dak- of thuisloos": [
      "asielopvang",
      "asielzoekersopvang",
      "vluchtelingenopvang",
      "opvang van vluchtelingen",
      "kinderopvang",
      "jeugdzorg",
      "crisisopvang voor jongeren",
      "opvanglocatie voor migranten",
      "oekraïense vluchtelingen",
    ],
    "koopwoning zonder hypotheek": [
      "wetenschap",
      "innovatie",
      "concurrentievermogen",
      "deelauto",
      "laadpalen",
      "publieke laadpalen",
      "waterbelasting",
      "belastingverdrag",
      "israel",
      "gezinnen",
      "belastingplan",
      "dekkingspakket",
    ],
    "koopwoning met hypotheek": [
      "zakelijke financiering",
      "zakelijke financieringen",
      "bedrijfsfinanciering",
      "ondernemingsfinanciering",
      "zakelijke rente",
      "bedrijfskrediet",
      "corporate finance",
      "starters",
      "starter",
      "huurgeschiedenis",
      "betaalbare koopwoning",
      "betaalbare koopwoningen",
      "nationaal fonds betaalbare koopwoningen",
      "energie-intensief mkb",
      "energie-intensieve bedrijven",
      "tegemoetkoming energiekosten voor energie-intensief mkb",
      "energiearmoede",
      "maatschappelijke kosten op het gebied van gezondheid, onderwijs en welzijn",
      "aantoonbare Nederlandse achterstanden in compensatie van energiekosten",
      "werkkostenregeling",
      "kleine werkgevers",
      "werkgevers",
      "studieschuld",
      "studieschulden",
      "aflossen van de studieschuld",
    ],
  },
};

const profileOptionRequiredKeywords: Record<string, Record<string, string[]>> = {
  employment: {
    "in loondienst": [
      "arbeid",
      "arbeidsmarkt",
      "arbeidsrecht",
      "arbeidsvoorwaarden",
      "arbeidsongeschiktheid",
      "beroepsziekte",
      "cao",
      "contract",
      "ontslag",
      "salaris",
      "loon",
      "minimumloon",
      "vakbond",
      "werkgelegenheid",
      "werkgevers en werknemers",
      "werknemers",
      "werkenden",
      "werkloosheid",
      "ziekteverzuim",
    ],
    "zelfstandig / zzp": [
      "zzp",
      "zelfstandig",
      "zelfstandigen",
      "ondernemer",
      "ondernemers",
      "eigen bedrijf",
      "freelancer",
      "freelancers",
    ],
    "werkloos of werkzoekend": [
      "werkloos",
      "werkloosheid",
      "werkzoekend",
      "werkzoekenden",
      "bijstand",
      "re-integratie",
    ],
    student: [
      "student",
      "studenten",
      "studiefinanciering",
      "studentenreisproduct",
      "basisbeurs",
      "mbo-student",
      "hbo-student",
      "wo-student",
    ],
    gepensioneerd: [
      "gepensioneerd",
      "gepensioneerden",
      "pensioen",
      "pensioenen",
      "aow",
      "aow-leeftijd",
    ],
    "onbetaald zorgend": [
      "mantelzorg",
      "mantelzorger",
      "mantelzorgers",
      "onbetaalde zorg",
      "informele zorg",
      "zorgtaken",
      "zorgverlof",
    ],
  },
  care: {
    "chronische aandoening": ["chronische aandoening", "chronisch ziek", "chronisch zieken", "langdurige ziekte", "chronische ziekte"],
    beperking: ["beperking", "beperkingen", "gehandicap", "arbeidsbeperking", "invaliditeit", "toegankelijkheid"],
    mantelzorger: ["mantelzorg", "mantelzorger", "mantelzorgers"],
    "ggz / mentale gezondheid": ["ggz", "mentale gezondheid", "psychische", "psychiatr", "geestelijke gezondheidszorg"],
    "geen van deze": [],
  },
  children: {
    "ja, kind(eren) onder 18": [
      "kinderen",
      "kindgebonden budget",
      "kinderopvang",
      "ouderschapsverlof",
      "jeugdzorg",
      "jeugdbescherming",
      "gezinnen",
      "gezinsbeleid",
      "schoolgaande kinderen",
      "basisschoolkinderen",
      "bescherming van kinderen",
      "kraamzorg",
      "wet kinderopvang",
      "kinderopvangwet",
    ],
    "ja, kind(eren) van 18–24": [
      "jongeren",
      "jongvolwassenen",
      "jongerenzorg",
      "jeugdzorg",
      "jeugdbescherming",
      "kinderen en jongeren",
      "jongeren met",
      "jongvolwassenen met",
      "18-jarigen",
      "18 jaar",
      "tot 23 jaar",
      "tot 24 jaar",
    ],
    "ja, alleen kind(eren) van 25 jaar of ouder": [],
    nee: [],
  },
  housing: {
    "dak- of thuisloos": [
      "dakloos",
      "daklozen",
      "dakloosheid",
      "thuisloos",
      "thuislozen",
      "thuisloosheid",
      "nachtopvang",
      "maatschappelijke opvang",
      "buitenslaper",
      "briefadres",
      "woningnood",
    ],
    "koopwoning zonder hypotheek": [
      "eigenwoningforfait",
      "koopwoning",
      "eigen woning",
      "woningbezit",
      "hypotheekvrij",
      "vermogensbelasting",
      "heffingsvrij vermogen",
      "heffingsvrije vermogen",
      "box 3",
      "vermogen",
      "vermogende",
      "vermogenden",
      "sparen",
      "spaargeld",
      "funderingsproblematiek",
      "funderingsproblemen",
      "funderingsonderzoek",
      "fundering",
    ],
    "koopwoning met hypotheek": [
      "hypotheek",
      "hypotheekrenteaftrek",
      "hypotheekberekening",
      "koopwoning",
      "koopwoningen",
      "eigenwoningforfait",
      "betaalbare koopwoning",
      "betaalbare koopwoningen",
      "woningmarkt",
      "renteplafond",
      "renteberekening",
      "hypotheeklasten",
      "hypotheeklast",
      "betaalbaarheid van hypotheken",
      "betaalbare hypotheek",
      "rentevaste periode",
      "rentevaste looptijd",
      "hypotheekrente",
      "hypotheekschuld",
      "restschuld",
      "aflossing van de hypotheek",
      "hypotheek aflossen",
      "hypotheek oversluiten",
      "oversluiten van de hypotheek",
      "nationale hypotheek garantie",
      "nhg",
      "financieringslast",
      "loan-to-value",
      "woningwaarde",
      "verduurzaming van koopwoningen",
      "isolatie van koopwoningen",
      "energiezuinige woning",
      "energielasten van koopwoningen",
      "woningverbetering",
      "woningrenovatie",
      "funderingsproblematiek",
      "funderingsproblemen",
      "funderingsonderzoek",
      "fundering",
      "slecht geïsoleerde",
      "doorstroomhypotheek",
      "starters",
    ],
    "starter op de koopwoningmarkt": [
      "starter",
      "starters",
      "net ingestroomde starters",
      "eerste woning",
      "eerste koopwoning",
      "betaalbare koopwoning",
      "betaalbare koopwoningen",
      "starterslening",
      "koopwoning",
      "Nationaal Fonds Betaalbare Koopwoningen",
      "betaalbare koopwoningen",
      "25% aan betaalbare koopwoningen",
      "definitie van starters",
      "aandachtsgroep starters",
      "uitstromende huurders",
      "jongerenwoningen",
      "starterswoningen",
      "Woningbouwimpuls",
    ],

  },
  age: {
    "25–44": [
      "volwassenen",
      "werkenden",
      "jonge ouders",
      "ouders",
      "gezinnen",
      "middeninkomens",
      "arbeidsmarkt",
      "woonlasten",
    ],
    "45–66": [
      "volwassenen",
      "werkenden",
      "arbeidsmarkt",
      "oudere werknemers",
      "werkloosheid bij oudere werknemers",
      "werkloosheid oudere werknemers",
      "middeninkomens",
      "woonlasten",
      "mantelzorg",
      "pensioen",
      "pensioenvoorbereiding",
      "aow",
    ],
    "67 of ouder": [
      "ouderen",
      "ouder",
      "senioren",
      "gepensioneerden",
      "pensioen",
      "aow",
      "ouderenzorg",
      "verpleeghuis",
      "thuiszorg",
      "mantelzorg",
      "werkloosheid bij oudere werknemers",
      "werkloosheid oudere werknemers",
      "pensioeninstellingen",
      "nabestaanden",
      "aow-leeftijd",
      "digitale toegankelijkheid van de overheid",
      "toezichthouder voor de digitale toegankelijkheid",
      "ouderenhuisvesting",
      "coöperatieve woonmodel",
      "aow",
      "aow-uitgavengroei",
      "emu-schuld",
      "oudere fietsers",
      "arbeidsongeschiktheidspensioendeelnemers",
      "bijna gepensioneerden",
      "pensioenfondsen",
      "pensioenen indexeren",
      "pensioenverdeling bij scheiding",
      "governance van pensioenfondsen",
    ],
  },
};

const profileOptionMotionKeywords: Record<string, Record<string, string[]>> = {
  sexuality: {
    "lgbtq+": ["lgbt", "homoseks", "transgender", "genderidentiteit", "gelijke rechten", "discriminatie"],
    hetero: [],
  },
  religion: {
    christelijk: ["christelijk", "christendom", "christen", "protestant", "katholiek", "gereformeerd"],
    islamitisch: ["islam", "islamitisch", "moslim", "moslims", "moskee", "hoofddoek", "halal"],
    joods: ["joods", "joodse", "joden", "jodendom", "synagoge", "antisemitisme", "anti-semitisme"],
    "hindoeïstisch": ["hindoe", "hindoeïstisch", "hindoes", "hindoest"],
    boeddhistisch: ["boeddhist", "boeddhisme", "boeddhisten"],
    "andere religie": ["sikh", "sikhisme", "bahai", "animisme", "religieuze minderheid"],
    "niet religieus": ["seculier", "secularisme", "atheïst", "atheïsme", "agnost"],
  },
  age: {
    "18–24": [
      "jongeren",
      "jeugd",
      "studenten",
      "student",
      "jongvolwassenen",
      "jongerenorganisaties",
      "jongerenwelzijn",
      "studentenwelzijn",
      "welzijn van jongeren",
      "mentale gezondheid van jongeren",
      "mbo-studenten",
      "onderwijsomgeving",
      "sociale school- en onderwijscultuur",
      "defensie-enquête",
      "justitiële aantekening",
      "sancties indien jongeren",
      "jongeren te maken krijgen met sancties",
      "jongerenwoningen",
    ],
    "25–44": [
      "volwassenen",
      "werkenden",
      "jonge ouders",
      "ouders",
      "gezinnen",
      "middeninkomens",
      "arbeidsmarkt",
      "woonlasten",
    ],
    "45–66": [
      "volwassenen",
      "werkenden",
      "arbeidsmarkt",
      "oudere werknemers",
      "werkloosheid bij oudere werknemers",
      "werkloosheid oudere werknemers",
      "middeninkomens",
      "woonlasten",
      "mantelzorg",
      "pensioen",
      "pensioenvoorbereiding",
      "aow",
    ],
    "67 of ouder": [
      "ouderen",
      "ouder",
      "senioren",
      "gepensioneerden",
      "pensioen",
      "aow",
      "ouderenzorg",
      "dementie",
      "ouderen met dementie",
      "seksuele gezondheid onder ouderen",
      "oudere werknemers",
      "nabestaanden",
      "pensioeninstellingen",
      "digitale toegankelijkheid van de overheid",
    ],
  },
  children: {
    "ja, kind(eren) onder 18": [
      "kinderen",
      "kindgebonden budget",
      "kinderopvang",
      "ouderschapsverlof",
      "jeugdzorg",
      "gezinnen",
      "gezinsversterking",
      "ouderschapsprogramma's",
      "schoolgaande kinderen",
      "basisschoolkinderen",
      "bescherming van kinderen",
      "armste gezinnen",
      "kraamzorg",
      "thuisonderwijs",
      "daeb",
      "wet kinderopvang",
      "kinderopvangwet",
    ],
    "ja, kind(eren) van 18–24": [
      "jongeren",
      "jongvolwassenen",
      "jeugdzorg",
      "jeugdbescherming",
      "kinderen en jongeren",
      "jongeren met",
      "jongvolwassenen met",
      "18-jarigen",
      "18 jaar",
      "tot 23 jaar",
      "tot 24 jaar",
    ],
    "ja, alleen kind(eren) van 25 jaar of ouder": [],
    nee: [],
  },
  housing: {
    "sociale huur": [
      "sociale huur",
      "sociale huurwoning",
      "sociale huurwoningen",
      "sociale huursector",
      "sociale woningbouw",
      "huurtoeslag",
      "woningcorporatie",
      "huurprijs",
      "betaalbare huur",
    ],
    "particuliere huur": [
      "particuliere huur",
      "particuliere verhuur",
      "private huur",
      "huurprijs",
      "huurtoeslag",
      "huurcontract",
      "tijdelijke huurcontracten",
      "tijdelijk huurcontract",
      "middenhuur",
      "huurregister",
      "inkomensafhankelijke huurverhoging",
      "uitponde huurwoningen",
    ],
    "koopwoning met hypotheek": [
      "hypotheek",
      "hypotheekrenteaftrek",
      "eigenwoningforfait",
      "koopwoning",
      "woningmarkt",
      "rente",
      "hypotheeklasten",
      "hypotheekrente",
      "restschuld",
      "hypotheek oversluiten",
      "nationale hypotheek garantie",
      "nhg",
      "woonlasten",
      "energiezuinige woning",
      "slecht geïsoleerde koopwoningen",
      "doorstroomhypotheek",
    ],
    "starter op de koopwoningmarkt": ["starter", "starters", "eerste woning", "eerste koopwoning", "betaalbare koopwoning", "koopwoning", "starterslening"],
    "hypotheek met studieschuld": ["studieschuld", "studiefinanciering", "hypotheekberekening", "hypotheek", "koopwoning"],
    "koopwoning zonder hypotheek": [
      "eigenwoningforfait",
      "koopwoning",
      "eigen woning",
      "woningbezit",
      "hypotheekvrij",
      "vermogensbelasting",
      "heffingsvrij vermogen",
      "heffingsvrije vermogen",
      "box 3",
      "vermogen",
      "vermogende",
      "vermogenden",
      "sparen",
      "spaargeld",
      "funderingsproblematiek",
      "funderingsproblemen",
      "funderingsonderzoek",
      "fundering",
    ],
    "dak- of thuisloos": [
      "dakloos",
      "daklozen",
      "dakloosheid",
      "thuisloos",
      "thuislozen",
      "thuisloosheid",
      "nachtopvang",
      "maatschappelijke opvang",
      "opvangvoorziening voor daklozen",
      "buitenslaper",
      "briefadres",
      "woningnood",
    ],
  },
};

const profileOppositionKeywords: Record<string, string[]> = {
  sexuality: ["opheffen", "afschaffen", "geen transgender", "niet plaatsen", "verbieden", "verbod", "beperken", "uitsluiten", "terugdraaien"],
  religion: ["verbieden", "verbod", "sluiten", "onteigenen", "hoofddoekverbod", "moskeeverbod", "religieuze school afschaffen", "afzijdig houden", "geen erkenning", "niet erkennen", "afzien van erkenning", "niet vermelden"],
  housing: ["huur verhogen", "huurtoeslag afschaffen", "uitzetten", "sloop", "daklozen op straat", "sociale huur afschaffen"],
  age: ["pensioenleeftijd verhogen", "aow verlagen", "pensioen verlagen", "studiefinanciering afschaffen", "basisbeurs afschaffen", "bezuinigen op ouderen"],
  employment: ["minimumloon verlagen", "arbeidsrechten beperken", "ontslagrecht versoepelen", "vakbonden beperken", "bezuinigen op werkgelegenheid"],
  care: ["eigen risico verhogen", "zorgtoeslag afschaffen", "zorg bezuinigen", "zorg afschaffen", "mantelzorgondersteuning schrappen"],
  children: ["kinderopvang bezuinigen", "kinderopvang afschaffen", "kindgebonden budget afschaffen", "jeugdzorg bezuinigen", "ouderschapsverlof beperken"],
};

const profileOptionOppositionKeywords: Record<string, Record<string, string[]>> = {
  employment: {
    "in loondienst": [
      "arbeidseis",
      "aantal gewerkte uren",
      "verplichten dat een sekswerker in loondienst",
    ],
    "werkloos of werkzoekend": [
      "bezuinigingen op de bijstand",
      "bezuinigingen op bijstand",
      "bezuiniging op de bijstand",
      "bijstand verlagen",
      "uitkering verlagen",
      "re-integratie verplichten",
    ],
    "onbetaald zorgend": [
      "mantelzorgondersteuning schrappen",
      "mantelzorgondersteuning verminderen",
      "mantelzorgondersteuning afschaffen",
      "mantelzorgverlof beperken",
      "zorgverlof beperken",
      "respijtzorg schrappen",
      "respijtzorg verminderen",
      "bezuinigen op mantelzorg",
    ],
    gepensioneerd: [
      "aanscherping van de aow-systematiek",
      "aow verlagen",
      "bezuinigen op de aow",
      "pensioen verlagen",
      "pensioenen verlagen",
      "pensioen korten",
      "bezuinigen op pensioenen",
    ],
    student: [
      "studiefinanciering afschaffen",
      "basisbeurs afschaffen",
      "studentenreisproduct afschaffen",
      "collegegeld verhogen",
      "tijdelijke huurcontracten voor alle studenten toestaan",
      "tijdelijk huurcontract voor studenten toestaan",
      "intrekking van studentenvisa",
      "intrekking van studentenvisa van buitenlandse studenten",
      "gegevens delen van studenten die betrokken zijn bij strafbare feiten",
    ],
  },
  care: {
    "chronische aandoening": [
      "eigen risico verhogen",
      "zorgtoeslag afschaffen",
      "zorg bezuinigen",
    ],
    beperking: [
      "eigen risico verhogen",
      "gehandicaptenzorg bezuinigen",
      "zorgtoeslag afschaffen",
      "toegankelijkheidseisen terugdraaien",
      "beperkingen voor mensen met een beperking",
      "beperking van de belastingvermindering",
    ],
    mantelzorger: [
      "mantelzorgondersteuning schrappen",
      "mantelzorgondersteuning verminderen",
      "bezuinigingen op de gehandicaptenzorg",
    ],
    "ggz / mentale gezondheid": [
      "ggz bezuinigen",
      "geestelijke gezondheidszorg bezuinigen",
      "wachtlijsten ggz verminderen",
      "ggz afschaffen",
    ],
  },
  children: {
    "ja, kind(eren) onder 18": [
      "kinderopvang bezuinigen",
      "kinderopvang afschaffen",
      "kindgebonden budget afschaffen",
      "jeugdzorg bezuinigen",
      "ouderschapsverlof beperken",
      "eigen bijdrage in de jeugdzorg",
      "kraamzorg verminderen",
      "jeugdbescherming bezuinigen",
      "bescherming van kinderen verminderen",
      "kinderopvang beperken",
    ],
    "ja, kind(eren) van 18–24": [
      "jeugdzorg bezuinigen",
      "jeugdbescherming bezuinigen",
      "jongerenzorg bezuinigen",
    ],
    "ja, alleen kind(eren) van 25 jaar of ouder": [],
    nee: [],
  },
  housing: {
    "sociale huur": [
      "voorrang van statushouders bij sociale huurwoningen beëindigen",
      "voorrang voor statushouders bij sociale huurwoningen beëindigen",
      "mogelijkheid van voorrang van statushouders bij sociale huurwoningen beëindigen",
      "voorrang van statushouders bij sociale huurwoningen beëindigt",
      "voorrang statushouders beëindigen",
      "sociale huurwoningen afschaffen",
      "sociale huurwoningen verminderen",
      "aantal sociale huurwoningen afnemen",
      "sociale huurwoningen slopen zonder terugbouw",
      "sociale huur afbouwen",
      "sociale huur beperken",
      "huurverhoging boven de inflatie",
      "huurverhogingen boven de inflatie",
      "huurprijs verhogen",
    ],
    "particuliere huur": [
      "uitponde huurwoningen kunnen worden opgekocht",
      "uitponde huurwoningen opkopen",
      "uitponde huurwoningen ondergebracht",
      "tijdelijke huurcontracten voor alle studenten toestaan",
      "inkomensafhankelijke huurverhoging invoeren",
      "inkomensafhankelijke huurverhogingen invoeren",
      "maximumtermijn onderzoeken voor de instandhouding van middenhuurwoningen",
      "instandhouding van middenhuurwoningen",
      "invloed van lokale eisen op de beschikbaarheid en toegankelijkheid van woningen in de middenhuursector",
      "beschikbaarheid en toegankelijkheid van woningen in de middenhuursector",
    ],
    "koopwoning met hypotheek": [
      "geen verruiming van de hypotheekrenteaftrek",
      "geen verruiming hypotheekrenteaftrek",
      "hypotheekrenteaftrek ongedaan maken",
      "verruiming van de hypotheekrenteaftrek ongedaan maken",
      "hypotheekrenteaftrek beperken",
      "hypotheekrenteaftrek afschaffen",
      "hypotheekrenteaftrek verlagen",
    ],
    "koopwoning zonder hypotheek": [
      "eigenwoningforfait verhogen",
      "vermogensbelasting verhogen",
      "heffingsvrij vermogen verlagen",
      "heffingsvrije vermogen verlagen",
      "box 3 verhogen",
      "spaargeld zwaarder belasten",
      "funderingsproblematiek",
      "funderingsproblemen",
      "funderingsonderzoek",
      "fundering",
    ],
    "starter op de koopwoningmarkt": [
      "hypotheekrenteaftrek beperken",
      "betaalbare koopwoningen afschaffen",
      "starterslening afschaffen",
      "hypotheekmogelijkheden beperken",
    ],
    "verhuizen of hypotheek aanpassen": [
      "doorstroomhypotheek afschaffen",
      "hypotheek oversluiten beperken",
      "renteberekening verslechteren",
    ],

  },
};

const partyLabels: Record<string, string> = {
  bbb: "BBB", cda: "CDA", christenunie: "ChristenUnie", d66: "D66", denk: "Denk",
  fvd: "FVD", ja21: "JA21", nsc: "NSC", pro: "PRO", pvdd: "PvdD", pvv: "PVV",
  sgp: "SGP", sp: "SP", "50plus": "50PLUS", volt: "Volt", vvd: "VVD",
  keijzer: "Keijzer", groepmarkuszower: "Groep Markuszower",
};

const initialForm = {
  care: "", employment: "", housing: "", children: "", age: "",
  sexuality: "", religion: "",
};

type ProfileContext = {
  field: string;
  value: string;
  keywords: string[];
  oppositionKeywords: string[];
  irrelevantKeywords: string[];
};

function normalized(value: string) {
  return value.toLocaleLowerCase("nl-NL").replace(/[^a-z0-9]/g, "");
}

function motionPartyKey(party: string) {
  const key = normalized(party);
  if (key === "groenlinkspvda") return "pro";
  if (key === "christenunie") return "christenunie";
  if (key === "monakeijzer") return "keijzer";
  if (key === "markuszower") return "groepmarkuszower";
  return key;
}

function agreementScoreClass(score: number) {
  if (score < 20) return "bg-rose-100 text-rose-800";
  if (score < 40) return "bg-orange-100 text-orange-800";
  if (score < 60) return "bg-amber-100 text-amber-800";
  if (score < 80) return "bg-lime-100 text-lime-800";
  return "bg-emerald-100 text-emerald-800";
}

function keywordsForProfileValue(field: string, value: string): string[] {
  return profileOptionMotionKeywords[field]?.[value] ?? profileMotionKeywords[field] ?? [];
}

function oppositionKeywordsForProfileValue(field: string, value: string): string[] {
  return profileOptionOppositionKeywords[field]?.[value] ?? profileOppositionKeywords[field] ?? [];
}

function irrelevantKeywordsForProfileValue(field: string, value: string): string[] {
  return [
    ...(profileIrrelevantKeywords[field] ?? []),
    ...(profileOptionIrrelevantKeywords[field]?.[value] ?? []),
  ];
}

function requiredKeywordsForProfileValue(field: string, value: string): string[] {
  return profileOptionRequiredKeywords[field]?.[value] ?? [];
}

function profileContextsForForm(form: typeof initialForm): ProfileContext[] {
  return Object.entries(form)
    .filter(([field, value]) =>
      value
      && value !== "zeg ik liever niet"
      && value !== "geen van deze"
      && !(field === "children" && (
        value === "nee"
        || value === "ja, alleen kind(eren) van 25 jaar of ouder"
      ))
      && !(field === "religion" && value === "niet religieus"))
    .map(([field, value]) => ({
      field,
      value,
      keywords: requiredKeywordsForProfileValue(field, value).length > 0
        ? requiredKeywordsForProfileValue(field, value)
        : keywordsForProfileValue(field, value),
      oppositionKeywords: oppositionKeywordsForProfileValue(field, value),
      irrelevantKeywords: irrelevantKeywordsForProfileValue(field, value),
    }));
}

function selectedReligionKeywords(form: typeof initialForm): string[] {
  if (!form.religion || form.religion === "zeg ik liever niet" || form.religion === "niet religieus") return [];
  return keywordsForProfileValue("religion", form.religion);
}

function isRelevantMotion(
  motion: Motion,
  keywords: readonly string[],
  contexts: readonly ProfileContext[] = [],
  matchingContexts: readonly ProfileContext[] = contexts,
) {
  const text = motion.subject.toLocaleLowerCase("nl-NL");
  const applicableContext = matchingContexts.find((context) =>
    context.keywords.some((keyword) => text.includes(keyword)));
  if (contexts.some((context) =>
    context.irrelevantKeywords.some((keyword) => text.includes(keyword)))) return false;
  return Boolean(applicableContext) || keywords.some((keyword) => text.includes(keyword));
}

function votedInInterest(motion: Motion, stance: Motion["votes"][number]["stance"], oppositionKeywords: readonly string[]) {
  const subject = motion.subject.toLocaleLowerCase("nl-NL");
  const protectiveNegationKeywords = [
    "geen bezuinigingen op de aow",
    "niet bezuinigen op de aow",
    "geen bezuinigingen op pensioenen",
    "niet bezuinigen op pensioenen",
    "aanscherping van de aow-systematiek verzachten",
    "aow-systematiek dient te worden verzacht",
    "gevolgen van bezuinigingen op de gehandicaptenzorg",
    "niet bezuinigen op de langdurige ggz",
    "niet bezuinigen op de gehandicaptenzorg en de langdurige ggz",
    "geen eigen bijdrage in de jeugdzorg",
    "kraamzorg voor gezinnen niet verminderen",
  ];
  if (protectiveNegationKeywords.some((keyword) => subject.includes(keyword))) {
    return stance === "Voor";
  }
  const isRestrictiveMotion = oppositionKeywords.some((keyword) => subject.includes(keyword));
  return isRestrictiveMotion ? stance === "Tegen" : stance === "Voor";
}

function motionAlignment(
  motions: Motion[],
  party: string,
  keywords: readonly string[],
  contexts: readonly ProfileContext[] = [],
  oppositionKeywords: readonly string[] = contexts.flatMap((context) => context.oppositionKeywords),
) {
  if (keywords.length === 0) return null;
  const relevant = motions.filter((motion) => isRelevantMotion(motion, keywords, contexts));
  let total = 0;
  let count = 0;
  relevant.forEach((motion) => {
    motion.votes.filter((vote) => motionPartyKey(vote.party) === party).forEach((vote) => {
      if (votedInInterest(motion, vote.stance, oppositionKeywords)) total += 1;
      if (vote.stance === "Voor" || vote.stance === "Tegen") count += 1;
    });
  });
  return count === 0 ? null : total / count;
}

type ScoringMethod = "motions" | "topics";

type ScoringTopic = {
  id: string;
  keywords: readonly string[];
  oppositionKeywords: readonly string[];
  matchingContexts: ProfileContext[];
};

function topicAlignmentScores(
  motions: Motion[],
  topics: readonly ScoringTopic[],
  contexts: readonly ProfileContext[],
) {
  const scores = new Map<string, Map<string, number>>();
  topics.forEach((topic) => {
    const scopedContexts = [
      ...contexts.filter((context) => context !== topic.matchingContexts[0]),
      ...topic.matchingContexts,
    ];
    const totals = new Map<string, { aligned: number; counted: number }>();
    motions
      .filter((motion) => isRelevantMotion(motion, topic.keywords, scopedContexts))
      .forEach((motion) => motion.votes.forEach((vote) => {
        if (vote.stance !== "Voor" && vote.stance !== "Tegen") return;
        const party = motionPartyKey(vote.party);
        const current = totals.get(party) ?? { aligned: 0, counted: 0 };
        current.counted += 1;
        if (votedInInterest(motion, vote.stance, topic.oppositionKeywords)) current.aligned += 1;
        totals.set(party, current);
      }));
    scores.set(topic.id, new Map(
      [...totals.entries()].map(([party, total]) => [party, total.aligned / total.counted]),
    ));
  });
  return scores;
}

export default function ProfileMatcher() {
  const [form, setForm] = useState(initialForm);
  const [motions, setMotions] = useState<Motion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [motionFilter, setMotionFilter] = useState("all");
  const [motionPage, setMotionPage] = useState(1);
  const [selectedMotion, setSelectedMotion] = useState<MotionDetail | null>(null);
  const [isMotionLoading, setIsMotionLoading] = useState(false);
  const [motionError, setMotionError] = useState(false);
  const [scoringMethod, setScoringMethod] = useState<ScoringMethod>("motions");

  async function handleSubmit() {
    setHasSubmitted(true);
    setIsLoading(true);
    setHasError(false);
    try {
      const loadedMotions = await getCachedMotions();
      setMotions(loadedMotions);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  const hasAdditionalProfileContext = Object.entries(form).some(([, value]) =>
    value && value !== "zeg ik liever niet");
  const profileContexts = useMemo(() => profileContextsForForm(form), [form]);
  const relevantKeywords = useMemo(() => [
    ...profileContexts.flatMap((context) => context.keywords),
  ], [profileContexts]);
  const rankingKeywords = relevantKeywords;
  const scoringTopics = useMemo<ScoringTopic[]>(() => [
    ...profileContexts.map((context) => ({
      id: context.field,
      keywords: context.keywords,
      oppositionKeywords: context.oppositionKeywords,
      matchingContexts: [context],
    })),
  ], [profileContexts]);
  const religionKeywords = useMemo(() => selectedReligionKeywords(form), [form]);
  const heterosexualityHasNoRelevantMotions = form.sexuality === "hetero";
  const hasReligionRelevantMotions = useMemo(
    () => religionKeywords.length === 0
      || motions.some((motion) => isRelevantMotion(motion, relevantKeywords, profileContexts)),
    [motions, relevantKeywords, profileContexts, religionKeywords],
  );
  const topicScores = useMemo(
    () => scoringMethod === "topics"
      ? topicAlignmentScores(motions, scoringTopics, profileContexts)
      : new Map<string, Map<string, number>>(),
    [motions, profileContexts, scoringMethod, scoringTopics],
  );

  const ranking = useMemo(() => !hasAdditionalProfileContext ? [] : [...new Set(motions.flatMap((motion) =>
    motion.votes.map((vote) => motionPartyKey(vote.party)),
  ))].map((party) => {
    const motionScore = scoringMethod === "motions"
      ? motionAlignment(motions, party, rankingKeywords, profileContexts)
      : (() => {
        const scores = scoringTopics
          .map((topic) => topicScores.get(topic.id)?.get(party))
          .filter((score): score is number => score !== undefined);
        return scores.length === 0 ? null : scores.reduce((total, score) => total + score, 0) / scores.length;
      })();
    return { party, score: motionScore === null ? null : Math.round(motionScore * 100), motionScore };
  }).filter((item): item is { party: string; score: number; motionScore: number } => item.score !== null)
    .sort((a, b) => b.score - a.score), [
    hasAdditionalProfileContext,
    motions,
    profileContexts,
    rankingKeywords,
    scoringMethod,
    scoringTopics,
    topicScores,
  ]);
  const selectedPartyMotions = useMemo(() => motions
    .filter((motion) => {
      if (!selectedParty) return false;
      return isRelevantMotion(motion, rankingKeywords, profileContexts)
        && motion.votes.some((vote) => motionPartyKey(vote.party) === selectedParty);
    })
    .sort((first, second) =>
      (second.startedAt ?? "").localeCompare(first.startedAt ?? "")), [motions, profileContexts, rankingKeywords, selectedParty]);
  const motionFilterOptions = useMemo(() => [
    { id: "all", label: "Alle relevante moties", keywords: rankingKeywords },
    ...Object.entries(form)
      .filter(([id, value]) => {
        if (!value || (id === "sexuality" && value === "hetero")) return false;
        if (id === "care" && value === "geen van deze") return false;
        if (id === "children" && (
          value === "nee"
          || value === "ja, alleen kind(eren) van 25 jaar of ouder"
        )) return false;
        if (id === "religion" && value === "niet religieus") return false;
        return requiredKeywordsForProfileValue(id, value).length > 0
          || keywordsForProfileValue(id, value).length > 0;
      })
      .map(([id, value]) => ({
        id,
        label: profileFieldLabels[id],
        keywords: requiredKeywordsForProfileValue(id, value).length > 0
            ? requiredKeywordsForProfileValue(id, value)
            : keywordsForProfileValue(id, value),
      })),
  ], [form, rankingKeywords]);
  const selectedPartyFilterScores = useMemo(() => {
    if (!selectedParty) return [];
    return motionFilterOptions
      .filter((filter) => filter.id !== "all")
      .map((filter) => {
        const matchingContexts = profileContexts.filter((context) => context.field === filter.id);
        const score = motionAlignment(motions, selectedParty, filter.keywords, matchingContexts);
        return score === null ? null : {
          id: filter.id,
          label: `${filter.label} — ${profileOptionLabels[form[filter.id as keyof typeof form]] ?? form[filter.id as keyof typeof form]}`,
          score: Math.round(score * 100),
        };
      })
      .filter((filter): filter is { id: string; label: string; score: number } => filter !== null);
  }, [form, motions, motionFilterOptions, profileContexts, selectedParty]);
  const filteredSelectedPartyMotions = useMemo(() => {
    const filter = motionFilterOptions.find((item) => item.id === motionFilter) ?? motionFilterOptions[0];
    if (!filter) return [];
    if (filter.id === "all") return selectedPartyMotions;
    const matchingContexts = profileContexts.filter((context) => context.field === filter.id);
    return motions
      .filter((motion) =>
        motion.votes.some((vote) => motionPartyKey(vote.party) === selectedParty))
      .filter((motion) =>
        isRelevantMotion(motion, filter.keywords, matchingContexts, matchingContexts))
      .sort((first, second) =>
        (second.startedAt ?? "").localeCompare(first.startedAt ?? ""));
  }, [motionFilter, motionFilterOptions, motions, profileContexts, selectedParty, selectedPartyMotions]);
  const totalMotionPages = Math.max(1, Math.ceil(filteredSelectedPartyMotions.length / 10));
  const paginatedSelectedPartyMotions = filteredSelectedPartyMotions.slice(
    (motionPage - 1) * 10,
    motionPage * 10,
  );
  const selectedMotionVoteGroups = useMemo(() => {
    if (!selectedMotion) return null;
    const votes = selectedMotion.votes.filter((vote) =>
      vote.stance === "Voor" || vote.stance === "Tegen");
    const uniqueVotes = votes.filter((vote, index) =>
      votes.findIndex((otherVote) =>
        motionPartyKey(otherVote.party) === motionPartyKey(vote.party)
        && otherVote.stance === vote.stance) === index);
    const selectedPartyVote = selectedParty
      ? selectedMotion.votes.find((vote) => motionPartyKey(vote.party) === selectedParty)
      : undefined;
    const selectedStance = selectedPartyVote?.stance;
    return {
      agree: uniqueVotes.filter((vote) => vote.stance === selectedStance),
      disagree: uniqueVotes.filter((vote) =>
        selectedStance !== undefined
        && (vote.stance === "Voor" || vote.stance === "Tegen")
        && vote.stance !== selectedStance),
      didNotParticipate: selectedMotion.votes.filter((vote, index, allVotes) =>
        vote.stance === "Niet deelgenomen"
        && allVotes.findIndex((otherVote) =>
          motionPartyKey(otherVote.party) === motionPartyKey(vote.party)) === index),
      selectedStance,
    };
  }, [selectedMotion, selectedParty]);

  async function openMotion(motion: Motion) {
    setSelectedMotion(null);
    setMotionError(false);
    setIsMotionLoading(true);
    try {
      const response = await fetch(`/api/motions/${motion.id}`);
      if (!response.ok) throw new Error("Motion request failed");
      setSelectedMotion(await response.json() as MotionDetail);
    } catch {
      setMotionError(true);
    } finally {
      setIsMotionLoading(false);
    }
  }

  const profileFields: Array<[keyof typeof initialForm, string, string[]]> = [
    ["care", "Zorg of beperking", ["", "Chronische aandoening", "Beperking", "Mantelzorger", "GGZ / mentale gezondheid", "Geen van deze", "Zeg ik liever niet"]],
    ["employment", "Werk en inkomen", ["", "In loondienst", "Zelfstandig / zzp", "Werkloos of werkzoekend", "Student", "Gepensioneerd", "Onbetaald zorgend", "Zeg ik liever niet"]],
    ["housing", "Wonen / bezit", ["", "Sociale huur", "Particuliere huur", "Koopwoning met hypotheek", "Koopwoning zonder hypotheek", "Dak- of thuisloos", "Zeg ik liever niet"]],
    ["children", "Kinderen", ["", "Ja, kind(eren) onder 18", "Ja, kind(eren) van 18–24", "Ja, alleen kind(eren) van 25 jaar of ouder", "Nee", "Zeg ik liever niet"]],
    ["sexuality", "Seksualiteit", ["", "Hetero", "LGBTQ+", "Zeg ik liever niet"]],
    ["religion", "Religie / levensbeschouwing", ["", "Christelijk", "Islamitisch", "Joods", "Hindoeïstisch", "Boeddhistisch", "Andere religie", "Niet religieus", "Zeg ik liever niet"]],
  ];

  return (
    <section className="py-10 sm:py-14">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--md-primary)]">Jouw profiel</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-[var(--md-on-surface)]">Welke partij past bij jouw profiel?</h1>
        <p className="mt-3 text-base leading-7 text-[var(--md-on-surface-variant)]">
          Geef alleen de informatie die je wilt delen. Je antwoorden blijven in je browser en worden niet opgeslagen.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)]">
        <div className="md3-card p-5 sm:p-7">
          <h2 className="text-xl font-bold text-[var(--md-on-surface)]">1. Jouw situatie</h2>
          <p className="mt-1 text-sm text-[var(--md-on-surface-variant)]">Deze gegevens bepalen welke moties waarschijnlijk relevant zijn. Geen veld is verplicht.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {profileFields.map(([key, label, options]) => (
              <label key={key} className="text-sm font-semibold text-[var(--md-on-surface)]">
                {label}
                <select
                  value={form[key as keyof typeof form]}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  className="md3-field mt-2 min-h-11 w-full px-3 py-2 font-normal"
                >
                  {options.map((option) => <option key={option} value={option === "" ? "" : option.toLocaleLowerCase("nl-NL")}>{option || "Niet ingevuld"}</option>)}
                </select>
              </label>
            ))}
          </div>
          <label className="mt-6 block text-sm font-semibold text-[var(--md-on-surface)]">
            Hoe moet de overeenstemming worden berekend?
            <select
              value={scoringMethod}
              onChange={(event) => setScoringMethod(event.target.value as ScoringMethod)}
              className="md3-field mt-2 min-h-11 w-full px-3 py-2 font-normal"
            >
              <option value="motions">Elke motie telt even zwaar</option>
              <option value="topics">Elk onderwerp telt even zwaar</option>
            </select>
            <span className="mt-1 block text-xs font-normal text-[var(--md-on-surface-variant)]">
              Bij onderwerpen krijgt elk gekozen profielveld of thema evenveel invloed, ook als het ene onderwerp meer moties heeft.
            </span>
          </label>
          <button type="button" onClick={handleSubmit} className="md3-button md3-button-filled mt-8 w-full sm:w-auto">
            Toon mijn ranking
          </button>
        </div>

        <aside className="md3-tonal-card p-5 sm:p-7">
          <h2 className="text-xl font-bold">Hoe werkt dit?</h2>
          <ol className="mt-4 space-y-4 text-sm leading-6">
            <li><strong>1.</strong> Je profiel en gekozen onderwerpen selecteren moties over thema&apos;s die op jouw situatie kunnen raken.</li>
            <li><strong>2.</strong> We bekijken hoe partijen op die moties hebben gestemd.</li>
            <li><strong>3.</strong> Je kiest hoe onderwerpen worden gewogen:
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li><strong>Elke motie telt even zwaar:</strong> alle relevante stemmingen worden opgeteld. Een onderwerp met meer moties heeft daardoor meer invloed.</li>
                <li><strong>Elk onderwerp telt even zwaar:</strong> eerst wordt per gekozen profielveld of thema een percentage berekend; daarna worden die percentages gemiddeld. Zo heeft ieder onderwerp evenveel invloed.</li>
              </ul>
            </li>
            <li><strong>4.</strong> Bij beperkende moties telt tegenstemmen als steun voor jouw belang. Niet-deelname telt niet mee.</li>
          </ol>
          <p className="mt-6 text-xs leading-5 opacity-80">Dit is geen stemadvies. Een motie kan jouw situatie raken zonder dat je automatisch vóór de inhoud bent. De uitkomst is daarom een indicatie van stemgedrag, geen persoonlijke voorkeur.</p>
        </aside>
      </div>

      {hasSubmitted && (
        <div className="mt-8 md3-card p-5 sm:p-7">
          <h2 className="text-2xl font-bold text-[var(--md-on-surface)]">Partijen bij relevante moties</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--md-on-surface-variant)]">
            Een score van 80% betekent dat de partij in 80% van de relevante stemmingen in het belang van jouw gekozen profielrichting stemde.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--md-on-surface-variant)]" aria-label="Legenda voor overeenstemmingspercentages">
            {[
              ["0–19%", "bg-rose-100", "Zeer laag"],
              ["20–39%", "bg-orange-100", "Laag"],
              ["40–59%", "bg-amber-100", "Gemiddeld"],
              ["60–79%", "bg-lime-100", "Hoog"],
              ["80–100%", "bg-emerald-100", "Zeer hoog"],
            ].map(([range, color, label]) => (
              <span key={range} className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className={`size-2.5 rounded-full ${color}`} />
                {range} {label}
              </span>
            ))}
          </div>
          {heterosexualityHasNoRelevantMotions && (
            <p className="mt-3 text-sm text-[var(--md-on-surface-variant)]">
              Er zijn niet genoeg relevante moties die specifiek over heteroseksualiteit gaan. Deze keuze wordt daarom niet als afzonderlijk motiefilter gebruikt.
            </p>
          )}
          {isLoading ? <p className="mt-4 text-sm text-[var(--md-on-surface-variant)]">Programma&apos;s en moties worden opgehaald...</p>
            : hasError ? <p className="mt-4 text-sm text-rose-700">De partijgegevens konden niet worden opgehaald.</p>
              : ranking.length === 0 ? <p className="mt-4 text-sm text-[var(--md-on-surface-variant)]">
                {!hasReligionRelevantMotions && form.religion
                  ? `Er zijn geen relevante moties gevonden die specifiek over ${form.religion} gaan.`
                  : "Kies minstens één profielveld of onderwerp om relevante moties te vinden."}
              </p>
                : <div className="mt-5 space-y-3">{ranking.map((item, index) => {
                  const logo = partyLogo(partyLabels[item.party] ?? item.party);
                  const isSelected = selectedParty === item.party;
                  return <div key={item.party}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedParty(isSelected ? null : item.party);
                        setMotionFilter("all");
                        setMotionPage(1);
                      }}
                      aria-expanded={isSelected}
                      className="flex w-full items-center gap-3 rounded-xl bg-[var(--md-surface-container)] p-3 text-left transition hover:bg-[var(--md-primary-container)]"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--md-primary)] text-sm font-bold text-white">{index + 1}</span>
                      {logo && <Image src={logo} alt="" width={36} height={36} className={logoFitClass(logo, "size-9 rounded-full bg-white p-1")} />}
                      <span className="min-w-0 flex-1 font-bold text-[var(--md-on-surface)]">{partyLabels[item.party] ?? item.party}</span>
                      <span className={`rounded-full px-2.5 py-1 text-sm font-bold ${agreementScoreClass(item.score)}`}>
                        {Math.round(item.score)}%
                      </span>
                      <span aria-hidden="true" className="text-sm text-[var(--md-on-surface-variant)]">{isSelected ? "−" : "+"}</span>
                    </button>
                    {isSelected && (
                      <div className="mt-2 rounded-xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] p-4">
                        <h3 className="font-bold text-[var(--md-on-surface)]">
                          Relevante moties voor {partyLabels[item.party] ?? item.party}
                        </h3>
                        {selectedPartyFilterScores.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--md-on-surface-variant)]">
                              Overeenstemming per categorie
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {selectedPartyFilterScores.map((filter) => (
                                <span key={filter.id} className={`rounded-full px-2.5 py-1 text-xs font-bold ${agreementScoreClass(filter.score)}`}>
                                  {filter.label}: {filter.score}%
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedPartyMotions.length === 0 ? (
                          <p className="mt-2 text-sm text-[var(--md-on-surface-variant)]">
                            Geen relevante moties gevonden waarop deze partij heeft gestemd.
                          </p>
                        ) : (
                          <>
                            {motionFilterOptions.length > 1 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {motionFilterOptions.map((filter) => (
                                  <button
                                    key={filter.id}
                                    type="button"
                                    onClick={() => {
                                      setMotionFilter(filter.id);
                                      setMotionPage(1);
                                    }}
                                    aria-pressed={motionFilter === filter.id}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${motionFilter === filter.id ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}
                                  >
                                    {filter.label}
                                  </button>
                                ))}
                              </div>
                            )}
                            {filteredSelectedPartyMotions.length === 0 ? (
                              <p className="mt-3 text-sm text-[var(--md-on-surface-variant)]">
                                Geen moties gevonden voor deze filter.
                              </p>
                            ) : (
                              <div className="mt-3 divide-y divide-[var(--md-outline-variant)]">
                            {paginatedSelectedPartyMotions.map((motion) => {
                              const vote = motion.votes.find((item) => motionPartyKey(item.party) === selectedParty);
                              return (
                                <button
                                  key={motion.id}
                                  type="button"
                                  onClick={() => openMotion(motion)}
                                  className="block w-full py-3 text-left transition hover:bg-[var(--md-primary-container)] first:pt-0 last:pb-0"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-[var(--md-on-surface-variant)]">
                                      Motie {motion.number} · {formatMotionDate(motion.startedAt)}
                                    </span>
                                    {vote && (
                                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${vote.stance === "Voor" || vote.stance === "Tegen" ? votedInInterest(motion, vote.stance, profileContexts.flatMap((context) => context.oppositionKeywords)) ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
                                        {vote.stance === "Voor" || vote.stance === "Tegen"
                                          ? `${votedInInterest(motion, vote.stance, profileContexts.flatMap((context) => context.oppositionKeywords)) ? "In jouw belang" : "Niet in jouw belang"} · ${vote.stance}`
                                          : "Niet deelgenomen"}
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 text-sm font-semibold leading-5 text-[var(--md-on-surface)]">{motion.subject}</p>
                                </button>
                              );
                            })}
                              </div>
                            )}
                            {filteredSelectedPartyMotions.length > 10 && (
                              <div className="mt-4 flex items-center justify-between gap-3">
                                <button
                                  type="button"
                                  onClick={() => setMotionPage((page) => Math.max(1, page - 1))}
                                  disabled={motionPage === 1}
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40"
                                >
                                  ← Vorige
                                </button>
                                <span className="text-xs text-slate-500">
                                  Pagina {motionPage} van {totalMotionPages}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setMotionPage((page) => Math.min(totalMotionPages, page + 1))}
                                  disabled={motionPage === totalMotionPages}
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40"
                                >
                                  Volgende →
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>;
                })}</div>}
        </div>
      )}
      {(isMotionLoading || motionError || selectedMotion) && (
        <div className="md3-dialog-scrim fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Motiedetails">
          <div className="md3-card max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="font-mono text-xs text-slate-400">Motiedetails</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {selectedMotion?.subject ?? "Motie wordt geladen"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedMotion(null);
                  setMotionError(false);
                }}
                className="grid min-h-11 min-w-11 size-11 shrink-0 cursor-pointer place-items-center rounded-lg text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Sluiten"
              >
                ×
              </button>
            </div>
            {isMotionLoading ? (
              <p className="mt-8 text-sm text-slate-500">Motie, stemmingen en document worden opgehaald...</p>
            ) : motionError ? (
              <p className="mt-8 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">De details konden niet worden opgehaald.</p>
            ) : selectedMotion ? (
              <>
                <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 font-mono">{selectedMotion.number}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5">{formatMotionDate(selectedMotion.startedAt)}</span>
                  <span className={`rounded-full px-3 py-1.5 font-semibold ${selectedMotion.outcome === "Aangenomen" ? "bg-emerald-50 text-emerald-700" : selectedMotion.outcome === "Niet aangenomen" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
                    {selectedMotion.outcome}
                  </span>
                </div>
                <section className="mt-8">
                  <h3 className="text-lg font-bold text-slate-950">Ingediend door</h3>
                  {selectedMotion.submittingParties.length === 0 ? (
                    <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">De indienende partij is niet geregistreerd.</p>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[...new Map(selectedMotion.submittingParties.map((party) => [
                        motionPartyKey(party),
                        partyLabels[motionPartyKey(party)] ?? party,
                      ])).values()].map((displayParty) => {
                        const logo = partyLogo(displayParty);
                        return (
                          <span key={displayParty} className="inline-flex items-center gap-2 rounded-full bg-slate-100 py-1.5 pl-1.5 pr-3 text-sm text-slate-700">
                            {logo ? (
                              <Image src={logo} alt="" width={24} height={24} className={logoFitClass(logo, "size-6 rounded-full")} />
                            ) : (
                              <span className="grid size-6 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-500">{displayParty.slice(0, 2).toUpperCase()}</span>
                            )}
                            {displayParty}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </section>
                <section className="mt-8">
                  <h3 className="text-lg font-bold text-slate-950">Tekst van de motie</h3>
                  <p className="mt-3 whitespace-pre-line rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">{selectedMotion.text}</p>
                </section>
                <section className="mt-8">
                  <h3 className="text-lg font-bold text-slate-950">Stemmingen per partij</h3>
                  {selectedMotion.votes.length === 0 ? (
                    <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Er is nog geen geregistreerde stemming voor deze motie.</p>
                  ) : (
                    <div className="mt-4 grid gap-5 sm:grid-cols-2">
                      {(["Voor", "Tegen"] as const).map((stance) => {
                        const parties = [...new Map(
                          selectedMotion.votes
                            .filter((vote) => vote.stance === stance)
                            .map((vote) => [motionPartyKey(vote.party), vote]),
                        ).values()];
                        return (
                          <div key={stance} className="rounded-2xl border border-slate-200 p-4">
                            <div className="flex items-center justify-between">
                              <h4 className={`font-bold ${stance === "Voor" ? "text-emerald-700" : "text-rose-700"}`}>{stance}</h4>
                              <span className="text-sm text-slate-400">{parties.length}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {parties.map((vote) => {
                                const displayParty = partyLabels[motionPartyKey(vote.party)] ?? vote.party;
                                const logo = partyLogo(displayParty);
                                const isClickedParty = motionPartyKey(vote.party) === selectedParty;
                                return (
                                  <span key={displayParty} className={`inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm ${isClickedParty ? "bg-blue-100 text-blue-900 ring-2 ring-blue-600" : "bg-slate-100 text-slate-700"}`}>
                                    {logo ? (
                                      <Image src={logo} alt="" width={24} height={24} className={logoFitClass(logo, "size-6 rounded-full")} />
                                    ) : (
                                      <span className="grid size-6 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-500">{displayParty.slice(0, 2).toUpperCase()}</span>
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
                  {selectedMotionVoteGroups && selectedMotionVoteGroups.didNotParticipate.length > 0 && (
                    <p className="mt-4 text-xs text-slate-500">
                      Niet deelgenomen: {selectedMotionVoteGroups.didNotParticipate.map((vote) => partyLabels[motionPartyKey(vote.party)] ?? vote.party).join(", ")}
                    </p>
                  )}
                </section>
              </>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
