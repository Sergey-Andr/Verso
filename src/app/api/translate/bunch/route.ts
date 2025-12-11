import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Triple = { city: string; country: string; admin: string };
type RowIn = { id: string; raw: string };
type RowOut = { id: string } & Triple;

const CHUNK = 25;
const MAX_ITEMS = 400;

type LocalePolicy = {
  langName: string;
  scriptHint?: string;
  exonymHint?: string;
  adminTerms: Record<string, string>;
};

const POLICIES: Record<string, LocalePolicy> = {
  ru: {
    langName: "Russian",
    scriptHint: "Cyrillic",
    exonymHint: "Use Russian exonyms where commonly used (Киев, Львов).",
    adminTerms: {
      Raion: "район",
      District: "район",
      Oblast: "область",
      Region: "область",
    },
  },
  uk: {
    langName: "Ukrainian",
    scriptHint: "Cyrillic",
    exonymHint: "Use Ukrainian endonyms (Київ, Львів).",
    adminTerms: {
      Raion: "район",
      District: "район",
      Oblast: "область",
      Region: "область",
    },
  },
};

function postNormalize(t: Triple, locale: string): Triple {
  const p = POLICIES[locale] ?? POLICIES.uk;
  const map = p.adminTerms;
  const norm = (s = "") =>
    Object.entries(map)
      .reduce(
        (acc, [from, to]) => acc.replace(new RegExp(`\\b${from}\\b`, "gi"), to),
        s,
      )
      .replace(/\s+/g, " ")
      .trim();

  return { city: norm(t.city), country: norm(t.country), admin: norm(t.admin) };
}

const looksEmpty = (s = "") => s.trim() === "";
const hasLatin = (s = "") => /[A-Za-z]/.test(s);

function shouldCache(t: Triple, locale: string) {
  const fields = [t.city, t.country, t.admin];
  if (fields.every(looksEmpty)) return false;
  if ((locale === "ru" || locale === "uk") && fields.some(hasLatin))
    return false;
  return true;
}

const cache = new Map<string, string>();
const CACHE_LIMIT = 1000;
const ck = (loc: string, raw: string) => `ai_tr_v2:${loc}:${raw}`;
const getC = (k: string) => cache.get(k) ?? null;
function setC(k: string, v: string) {
  if (cache.has(k)) cache.delete(k);
  cache.set(k, v);
  if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value);
}

const logErr = (trace: string, payload: Record<string, any>) =>
  console.error(
    JSON.stringify({
      where: "translate/single",
      reason: "NO_OPENAI_API_KEY",
      severity: "ERROR",
      trace,
      route: "/api/translate/bunch",
      ...payload,
    }),
  );

export async function POST(req: Request) {
  const trace = (req.headers.get("x-cloud-trace-context") || "").split("/")[0];
  const openai_key = process.env.OPENAI_API_KEY;
  if (!openai_key) {
    logErr(trace, { type: "ConfigError", message: "OPENAI_API_KEY missing" });
    return NextResponse.json({ error: "server_misconfig" }, { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (e: any) {
    logErr(trace, { type: "BadJSON", message: String(e) });
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const { locale, items } = body as { locale: string; items: RowIn[] };
  const policy = POLICIES[locale] ?? POLICIES.en;
  if (!Array.isArray(items) || items.length === 0)
    return NextResponse.json({}, { status: 200 });
  if (items.length > MAX_ITEMS)
    return NextResponse.json(
      { error: `Too many items (>${MAX_ITEMS})` },
      { status: 413 },
    );

  const uniq: RowIn[] = [];
  const seen = new Set<string>();
  for (const it of items) {
    const raw = (it.raw ?? "").trim();
    if (!raw || raw.length > 200) continue;
    if (!seen.has(raw)) {
      uniq.push({ id: it.id, raw });
      seen.add(raw);
    }
  }

  const result: Record<string, Triple> = {};
  const toTranslate: RowIn[] = [];
  for (const it of uniq) {
    const c = getC(ck(locale, it.raw));
    if (c) result[it.raw] = JSON.parse(c);
    else toTranslate.push(it);
  }

  const openai = new OpenAI({ apiKey: openai_key! });

  for (let i = 0; i < toTranslate.length; i += CHUNK) {
    const chunk = toTranslate.slice(i, i + CHUNK);
    const idToRaw = new Map(chunk.map((x) => [x.id, x.raw]));

    const prompt = [
      `Translate each item into ${policy.langName}.`,
      policy.scriptHint ? `Use ${policy.scriptHint} script only.` : "",
      policy.exonymHint ?? "",
      `Input format: "city|country|admin". Keep order; if part is missing, return empty string.`,
      `Translate administrative terms exactly as: ${Object.entries(
        policy.adminTerms,
      )
        .map(([a, b]) => `"${a}" -> "${b}"`)
        .join(", ")}.`,
      `Return STRICT JSON: {"items":[{"id":"<id>","city":"","country":"","admin":""}, ...]}. No extra text.`,
      ``,
      `Items:`,
      ...chunk.map(({ id, raw }, n) => `${n + 1}. id=${id} raw="${raw}"`),
    ]
      .filter(Boolean)
      .join("\n");

    let completion;
    try {
      completion = await openai.chat.completions.create(
        {
          model: "gpt-4o-mini",
          temperature: 0,
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "batch_translation",
              schema: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        city: { type: "string" },
                        country: { type: "string" },
                        admin: { type: "string" },
                      },
                      required: ["id", "city", "country", "admin"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["items"],
                additionalProperties: false,
              },
              strict: true,
            },
          },
        },
        { signal: req.signal as AbortSignal },
      );
    } catch (e: any) {
      logErr(trace, {
        where: "translate/bunch",
        kind: e?.status ? "api" : "net",
        status: e?.status,
        code: e?.code ?? e?.cause?.code,
        name: e?.name,
        message: e?.message,
        errno: e?.errno,
        syscall: e?.syscall,
        address: e?.address,
        port: e?.port,
        stack: e?.stack,
        type: "OpenAI.APIError",
        detail: e?.error?.message,
      });
      return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
    }

    const text = completion.choices[0]?.message?.content ?? `{"items":[]}`;
    let parsed: { items?: RowOut[] };
    try {
      parsed = JSON.parse(text);
    } catch (e: any) {
      logErr(trace, {
        type: "BadOpenAIJSON",
        message: String(e),
        preview: text.slice(0, 300),
      });
      return NextResponse.json({ error: "bad_openai_json" }, { status: 502 });
    }

    for (const row of parsed.items ?? []) {
      const raw = idToRaw.get(row.id);
      if (!raw) continue;
      const triple = postNormalize(
        {
          city: row.city ?? "",
          country: row.country ?? "",
          admin: row.admin ?? "",
        },
        locale,
      );
      result[raw] = triple;
      if (shouldCache(triple, locale))
        setC(ck(locale, raw), JSON.stringify(triple));
    }
  }

  return NextResponse.json(result);
}
