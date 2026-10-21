import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const inputDirectory = path.join(root, "data", "manifestos");
const outputPath = path.join(root, "data", "manifesto-ai-scores.json");
const configuredApiUrl = process.env.AI_API_URL;
const apiUrl = configuredApiUrl ? normalizeApiUrl(configuredApiUrl) : "";
const apiKey = process.env.AI_API_KEY;
const model = process.env.AI_MODEL;
const skipExisting = process.env.AI_SKIP_EXISTING !== "false";
const maxInputChars = readPositiveInteger("AI_MAX_INPUT_CHARS", 20_000);
const selectionVersion = 2;

const axes = {
  classic: {
    x: ["economically left", "economically right"],
    y: ["libertarian", "authoritarian"],
  },
  "economy-migration": {
    x: ["more redistribution", "more market-oriented"],
    y: ["more open migration policy", "more restrictive migration policy"],
  },
  welfare: {
    x: ["more public welfare provision", "more individual responsibility"],
    y: ["less collective provision", "more collective provision"],
  },
  "order-nation": {
    x: ["civil liberties", "law and order"],
    y: ["cosmopolitan", "nationalist"],
  },
  "climate-economy": {
    x: ["faster climate action", "more economic freedom"],
    y: ["more regulation", "more market incentives"],
  },
  cultural: {
    x: ["culturally open", "culturally traditional"],
    y: ["personal freedom", "community norms"],
  },
};
const themeKeywords = await loadThemeKeywords();

const partyFiles = {
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

if (!apiUrl || !apiKey || !model) {
  console.error("Set AI_API_URL, AI_API_KEY, and AI_MODEL before running this script.");
  process.exit(1);
}

console.log(`AI provider: ${new URL(apiUrl).origin}${new URL(apiUrl).pathname}`);
console.log(`AI model: ${model}`);

const { PDFParse } = await import("pdf-parse");
const existing = await readJson(outputPath);
const output = existing ?? { version: 2, generatedAt: null, parties: {} };
const parties = Object.entries(partyFiles);
let completed = 0;

for (const [party, file] of parties) {
  if (skipExisting && isCompleteScore(output.parties?.[party])) {
    completed += 1;
    showProgress(completed, parties.length, party);
    continue;
  }

  const parser = new PDFParse({ data: await readFile(path.join(inputDirectory, file)) });
  let text;
  try {
    text = (await parser.getText()).text.replace(/\s+/g, " ").trim();
  } finally {
    await parser.destroy();
  }

  const selectedText = selectRelevantText(text, maxInputChars);
  console.log(
    `\nClassifying ${party} (${text.length.toLocaleString("en-US")} characters; `
    + `sending ${selectedText.length.toLocaleString("en-US")}).`,
  );
  const scores = await classifyParty(party, file, selectedText);
  output.parties[party] = { sourceFile: file, selectionVersion, scores };
  output.generatedAt = new Date().toISOString();
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  completed += 1;
  showProgress(completed, parties.length, party);
}

output.version = 2;
output.generatedAt = new Date().toISOString();
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Wrote ${outputPath}`);

async function classifyParty(party, file, text) {
  const requestBody = {
    model,
    temperature: 0,
    max_completion_tokens: 1500,
    reasoning_effort: "low",
    messages: [
      {
        role: "system",
        content: [
          "Classify this political party manifesto on the supplied political dimensions.",
          "Return JSON only, with exactly one numeric score for every axis and dimension.",
          "Scores must be numbers from 0 to 1: 0 means the first pole and 1 means the second pole.",
          "Assess every axis independently. Do not copy one score across all axes; use 0.5 only when the manifesto is genuinely balanced.",
          "Never use 0.1 (or any other repeated placeholder) for every score.",
          "Use the supplied representative manifesto passages. Do not return claims, quotes, explanations, or extra fields.",
          `Schema: ${JSON.stringify(scoreSchema())}`,
          `Axes: ${JSON.stringify(axes)}`,
        ].join("\n"),
      },
      {
        role: "user",
        content: `Party: ${party}\nSource file: ${file}\n\n${text}`,
      },
    ],
  };

  const request = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  };

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    request.body = JSON.stringify(requestBody);
    const response = await fetch(apiUrl, request);
    if (!response.ok) {
      const body = await response.text();
      const retryable = [429, 500, 502, 503, 504].includes(response.status);
      if (!retryable || attempt === 5) {
        throw new Error(`AI request failed (${response.status}) after ${attempt} attempt(s): ${body}`);
      }
      const retryAfter = Number(response.headers.get("retry-after"));
      const delaySeconds = Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter, 120)
        : Math.min(2 ** attempt * 2, 60);
      console.warn(`AI provider returned ${response.status}; retrying in ${delaySeconds}s.`);
      await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
      continue;
    }

    const payload = await response.json();
    const choice = payload.choices?.[0];
    const message = choice?.message;
    const content = extractText(
      message?.content || message?.reasoning || message?.reasoning_content || choice?.text,
    );
    try {
      if (!content.trim()) throw new Error(`AI response contained no text for ${party}.`);
      return validateScores(parseModelJson(content), party);
    } catch (error) {
      if (attempt === 5) throw error;
      requestBody.messages[0].content = [
        "Return ONLY this JSON object. Do not think aloud, explain, or use Markdown.",
        `Schema: ${JSON.stringify(scoreSchema())}`,
      ].join("\n");
      console.warn(`Invalid JSON for ${party}; requesting a compact JSON-only retry.`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error(`AI request ended without a valid result for ${party}.`);
}

function extractText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((part) => part?.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n");
}

function normalizeApiUrl(value) {
  const url = new URL(value);
  if (url.pathname.replace(/\/+$/, "").endsWith("/chat/completions")) return url.toString();
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/chat/completions`;
  return url.toString();
}

function scoreSchema() {
  return Object.fromEntries(
    Object.keys(axes).map((axis) => [axis, { x: 0.5, y: 0.5 }]),
  );
}

function selectRelevantText(text, limit) {
  if (text.length <= limit) return text;
  const passages = text.split(/(?<=[.!?])\s+/);
  const themes = Object.entries(themeKeywords).map(([theme, keywords]) => ({
    theme,
    keywords: keywords.map(normalizeKeyword),
  }));
  const ranked = passages.map((passage, index) => {
    const normalized = normalizeKeyword(passage);
    const matchedThemes = themes.filter(({ keywords }) =>
      keywords.some((keyword) => normalized.includes(keyword)),
    ).map(({ theme }) => theme);
    return { passage, index, matchedThemes, score: matchedThemes.length };
  });
  const selected = new Map();
  let length = 0;
  for (const { theme } of themes) {
    const candidate = ranked
      .filter((item) => item.matchedThemes.includes(theme) && !selected.has(item.index))
      .sort((a, b) => b.score - a.score || a.index - b.index)[0];
    if (!candidate || length + candidate.passage.length + 1 > limit) continue;
    selected.set(candidate.index, candidate);
    length += candidate.passage.length + 1;
  }
  ranked
    .filter((item) => !selected.has(item.index) && item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .forEach((item) => {
      if (length + item.passage.length + 1 > limit) return;
      selected.set(item.index, item);
      length += item.passage.length + 1;
    });
  return [...selected.values()]
    .sort((a, b) => a.index - b.index)
    .map(({ passage }) => passage)
    .join(" ");
}

function normalizeKeyword(value) {
  return value.toLocaleLowerCase("nl-NL").replace(/[^\p{L}\p{N}-]+/gu, " ").trim();
}

async function loadThemeKeywords() {
  const sourcePath = path.join(root, "src", "app", "MotionBrowser.tsx");
  const source = await readFile(sourcePath, "utf8");
  const match = source.match(/const themeKeywords: Record<string, string\[\]> = (\{[\s\S]*?\n\});/);
  if (!match) throw new Error("Could not load themeKeywords from MotionBrowser.tsx.");
  return new Function(`return ${match[1]}`)();
}

function readPositiveInteger(name, fallback) {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function validateScores(value, party) {
  const scores = value?.scores ?? value;
  if (!scores || typeof scores !== "object" || Array.isArray(scores)) {
    throw new Error(`Invalid score output for ${party}.`);
  }

  const validated = {};
  for (const axis of Object.keys(axes)) {
    validated[axis] = {};
    for (const dimension of ["x", "y"]) {
      const score = scores[axis]?.[dimension];
      if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 1) {
        throw new Error(`Invalid ${axis}.${dimension} score for ${party}; expected a number from 0 to 1.`);
      }
      validated[axis][dimension] = score;
    }
  }
  return validated;
}

function parseModelJson(content) {
  const cleaned = content
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/```/g, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.search(/[\[{]/);
    if (start < 0) throw new Error("AI response did not contain JSON.");
    for (let end = cleaned.length; end > start; end -= 1) {
      const candidate = cleaned.slice(start, end).trim();
      if (!/[\]}]$/.test(candidate)) continue;
      try {
        return JSON.parse(candidate);
      } catch {
        // Continue until the JSON object is isolated from trailing model text.
      }
    }
    throw new Error("AI response contained invalid JSON.");
  }
}

function isCompleteScore(value) {
  try {
    if (value?.selectionVersion !== selectionVersion) return false;
    const scores = validateScores(value?.scores ?? value, "existing party");
    const values = Object.values(scores).flatMap((score) => [score.x, score.y]);
    const uniqueValues = new Set(values);
    if (uniqueValues.size === 1 && [0.1, 0.5, 0.9].includes(values[0])) return false;
    return uniqueValues.size >= 3;
  } catch {
    return false;
  }
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function showProgress(completedCount, total, party) {
  const width = 28;
  const ratio = completedCount / total;
  const filled = Math.round(ratio * width);
  const bar = `${"=".repeat(filled)}${".".repeat(width - filled)}`;
  process.stdout.write(`\r[${bar}] ${completedCount}/${total} (${Math.round(ratio * 100)}%) ${party}`.padEnd(100));
  if (completedCount === total) process.stdout.write("\n");
}
