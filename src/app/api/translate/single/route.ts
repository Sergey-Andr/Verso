import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import dns from "node:dns";
import { Agent, request } from "undici";

const dispatcher = new Agent({
  connect: {
    lookup: (hostname, _opts, cb) => dns.lookup(hostname, { family: 4 }, cb),
  },
});

export const runtime = "nodejs";

const LANG_MAP: Record<string, string> = {
  ru: "Russian",
  uk: "Ukrainian",
};

const PROJECT = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;

function logError(entry: Record<string, unknown>) {
  const base = {
    severity: "ERROR",
    ...entry,
  } as any;
  if (typeof base.trace === "string" && base.trace) {
    base["logging.googleapis.com/trace"] =
      `projects/${PROJECT}/traces/${base.trace}`;
  }
  delete base.trace;
  process.stderr.write(JSON.stringify(base) + "\n");
}

function logInfo(entry: Record<string, unknown>) {
  process.stdout.write(JSON.stringify({ severity: "INFO", ...entry }) + "\n");
}

export async function POST(req: NextRequest) {
  const trace = (req.headers.get("x-cloud-trace-context") || "").split("/")[0];
  const openai_key = process.env.OPENAI_API_KEY;
  if (!openai_key) {
    logError({
      where: "translate/single",
      reason: "NO_OPENAI_API_KEY",
      msg: "OPENAI_API_KEY missing",
      trace,
    });
    return NextResponse.json({ error: "server_misconfig" }, { status: 500 });
  }

  const openai = new OpenAI({
    apiKey: openai_key,
    timeout: 15000,
    maxRetries: 0,
  });

  let body: any = {};
  try {
    body = await req.json();
  } catch (err: any) {
    logError({
      where: "translate/single",
      kind: "bad_json",
      message: err?.message || String(err),
      trace,
    });
    return NextResponse.json({ translation: "bad_json" }, { status: 400 });
  }

  const { single, lang } = body as { single?: string; lang?: string };
  const text = (single ?? "").trim();
  const langCode = (lang ?? "ru").toLowerCase();
  const language = LANG_MAP[langCode] ?? langCode;

  try {
    if (!text) {
      logInfo({
        where: "translate/single",
        kind: "bad_request",
        reason: "empty_text",
        trace,
      });
      return NextResponse.json({ translation: `no_text` }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: `Return only the translation into ${language}. No quotes, no extra words.`,
        },
        { role: "user", content: text },
      ],
    });

    return NextResponse.json({
      translation: completion.choices[0]?.message?.content?.trim(),
    });
  } catch (e: any) {
    const out: any = {
      where: "translate/single",
      name: e?.name,
      message: e?.message,
      status: e?.status,
      code: e?.code,
      type: e?.type,
      request_id: e?.request_id,
    };
    if (e?.response?.text) {
      try {
        out.body = (await e.response.text()).slice(0, 400);
      } catch {}
    }
    console.error(JSON.stringify(out));

    try {
      const r = await request("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${openai_key}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0,
          max_tokens: 100,
          messages: [
            {
              role: "system",
              content: `Return only the translation into ${language}. No quotes, no extra words.`,
            },
            { role: "user", content: text },
          ],
        }),
        dispatcher,
      });
      const data = (await r.body.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const translation = data?.choices?.[0]?.message?.content?.trim() ?? "";
      return NextResponse.json({ translation });
    } catch (ee: any) {
      logError({
        where: "translate/single",
        kind: "raw_fetch_fail",
        name: ee?.name,
        code: ee?.code,
        message: ee?.message,
      });
      return NextResponse.json(
        { ok: false, error: "openai_error" },
        { status: 502 },
      );
    }
  }
}
