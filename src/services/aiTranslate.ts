import { safeJsonParse, setStoredData } from "@/utils/store";

type Triple = { city?: string; country?: string; admin?: string };
type BatchMap = Record<string, Triple>;

type DictEntry = Triple & { ts: number };
type Dict = Record<string, DictEntry>;

type StrEntry = { v: string; ts: number };
type StrDict = Record<string, StrEntry>;

const PREFIX_BATCH = "ai_tr_v2:";
const PREFIX_SINGLE = "ai_tr_single_v1:";
const KEY_BATCH = (loc: string) => `${PREFIX_BATCH}${loc}`;
const KEY_SINGLE = (loc: string) => `${PREFIX_SINGLE}${loc}`;

const memBatch = new Map<
  string,
  { data: Dict; loaded: boolean; dirty: boolean; flushTimer: any }
>();
const memSingle = new Map<
  string,
  { data: StrDict; loaded: boolean; dirty: boolean; flushTimer: any }
>();

const MAX_ENTRIES = 2000;
const FLUSH_DELAY = 250;

const isBrowser = () =>
  typeof window !== "undefined" && typeof localStorage !== "undefined";
const now = () => Date.now();

function logStorageError(ctx: string, e: unknown) {
  try {
    console.error(
      `[storage:${ctx}]`,
      (e as any)?.name || "Error",
      (e as any)?.message || e,
    );
  } catch {}
}
function removeOldestEntries<T extends { ts?: number }>(
  dict: Record<string, T>,
  count: number,
) {
  const entries = Object.entries(dict).sort(
    (a, b) => (a[1].ts || 0) - (b[1].ts || 0),
  );
  for (let i = 0; i < count && i < entries.length; i++)
    delete dict[entries[i][0]];
}
const isQuotaExceededError = (e: unknown) =>
  e instanceof DOMException &&
  (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED");

let bootstrapped = false;
function ensureBootstrapped() {
  if (bootstrapped || !isBrowser()) return; // <-- фикс: только в браузере и один раз
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith(PREFIX_BATCH)) {
        const loc = key.slice(PREFIX_BATCH.length);
        const dict = safeJsonParse<Dict>(localStorage.getItem(key)) ?? {};
        memBatch.set(loc, {
          data: dict,
          loaded: true,
          dirty: false,
          flushTimer: null,
        });
      } else if (key.startsWith(PREFIX_SINGLE)) {
        const loc = key.slice(PREFIX_SINGLE.length);
        const dict = safeJsonParse<StrDict>(localStorage.getItem(key)) ?? {};
        memSingle.set(loc, {
          data: dict,
          loaded: true,
          dirty: false,
          flushTimer: null,
        });
      }
    }
  } catch (e) {
    logStorageError("bootstrap", e);
    try {
      memBatch.clear();
      memSingle.clear();
    } catch {}
  } finally {
    bootstrapped = true;
  }
}

function readBatchFromMem(loc: string): Dict {
  ensureBootstrapped();
  const s = memBatch.get(loc);
  if (s?.loaded) return s.data;
  const blank: Dict = {};
  memBatch.set(loc, {
    data: blank,
    loaded: true,
    dirty: false,
    flushTimer: null,
  });
  return blank;
}
function readSingleFromMem(loc: string): StrDict {
  ensureBootstrapped();
  const s = memSingle.get(loc);
  if (s?.loaded) return s.data;
  const blank: StrDict = {};
  memSingle.set(loc, {
    data: blank,
    loaded: true,
    dirty: false,
    flushTimer: null,
  });
  return blank;
}

function writeNowBatch(loc: string, dict: Dict) {
  try {
    setStoredData(KEY_BATCH(loc), dict);
  } catch (e) {
    if (isQuotaExceededError(e)) {
      try {
        removeOldestEntries(
          dict,
          Math.max(1, Math.ceil(Object.keys(dict).length * 0.1)),
        );
        setStoredData(KEY_BATCH(loc), dict);
        return;
      } catch (e2) {
        logStorageError(`batch:quota:retry:${loc}`, e2);
      }
    }
    logStorageError(`batch:${loc}`, e);
  }
}
function writeNowSingle(loc: string, dict: StrDict) {
  try {
    setStoredData(KEY_SINGLE(loc), dict);
  } catch (e) {
    if (isQuotaExceededError(e)) {
      try {
        removeOldestEntries(
          dict,
          Math.max(1, Math.ceil(Object.keys(dict).length * 0.1)),
        );
        setStoredData(KEY_SINGLE(loc), dict);
        return;
      } catch (e2) {
        logStorageError(`single:quota:retry:${loc}`, e2);
      }
    }
    logStorageError(`single:${loc}`, e);
  }
}
function scheduleFlushBatch(loc: string) {
  const s = memBatch.get(loc);
  if (!s) return;
  s.dirty = true;
  if (s.flushTimer) return;
  s.flushTimer = setTimeout(() => {
    s.flushTimer = null;
    s.dirty = false;
    writeNowBatch(loc, s.data);
  }, FLUSH_DELAY);
}
function scheduleFlushSingle(loc: string) {
  const s = memSingle.get(loc);
  if (!s) return;
  s.dirty = true;
  if (s.flushTimer) return;
  s.flushTimer = setTimeout(() => {
    s.flushTimer = null;
    s.dirty = false;
    writeNowSingle(loc, s.data);
  }, FLUSH_DELAY);
}
function pruneBatch(d: Dict) {
  const k = Object.keys(d);
  if (k.length > MAX_ENTRIES) removeOldestEntries(d, k.length - MAX_ENTRIES);
}
function pruneSingle(d: StrDict) {
  const k = Object.keys(d);
  if (k.length > MAX_ENTRIES) removeOldestEntries(d, k.length - MAX_ENTRIES);
}

function getFromBatchCache(loc: string, raw: string): Triple | null {
  const d = readBatchFromMem(loc);
  const e = d[raw];
  return e ? { city: e.city, country: e.country, admin: e.admin } : null;
}
function setToBatchCache(loc: string, raw: string, triple: Triple) {
  ensureBootstrapped();
  const s = memBatch.get(loc) ?? {
    data: {},
    loaded: true,
    dirty: false,
    flushTimer: null,
  };
  s.data[raw] = { ...triple, ts: now() };
  pruneBatch(s.data);
  memBatch.set(loc, s);
  scheduleFlushBatch(loc);
}
function getFromSingleCache(loc: string, raw: string): string | null {
  const d = readSingleFromMem(loc);
  const e = d[raw];
  return e ? e.v : null;
}
function setToSingleCache(loc: string, raw: string, v: string) {
  ensureBootstrapped();
  const s = memSingle.get(loc) ?? {
    data: {},
    loaded: true,
    dirty: false,
    flushTimer: null,
  };
  s.data[raw] = { v, ts: now() };
  pruneSingle(s.data);
  memSingle.set(loc, s);
  scheduleFlushSingle(loc);
}

if (isBrowser()) {
  window.addEventListener("storage", (e) => {
    if (!e.key) return;
    if (e.key.startsWith(PREFIX_BATCH)) {
      const loc = e.key.slice(PREFIX_BATCH.length);
      const s = memBatch.get(loc) ?? {
        data: {},
        loaded: true,
        dirty: false,
        flushTimer: null,
      };
      if (e.newValue === null) {
        s.data = {};
        memBatch.set(loc, s);
        return;
      }
      const incoming = safeJsonParse<Dict>(e.newValue) ?? {};
      const merged: Dict = { ...s.data };
      for (const [k, v] of Object.entries(incoming)) {
        const cur = merged[k];
        if (!cur || (v.ts || 0) > (cur.ts || 0)) merged[k] = v;
      }
      s.data = merged;
      memBatch.set(loc, s);
    } else if (e.key.startsWith(PREFIX_SINGLE)) {
      const loc = e.key.slice(PREFIX_SINGLE.length);
      const s = memSingle.get(loc) ?? {
        data: {},
        loaded: true,
        dirty: false,
        flushTimer: null,
      };
      if (e.newValue === null) {
        s.data = {};
        memSingle.set(loc, s);
        return;
      }
      const incoming = safeJsonParse<StrDict>(e.newValue) ?? {};
      const merged: StrDict = { ...s.data };
      for (const [k, v] of Object.entries(incoming)) {
        const cur = merged[k];
        if (!cur || (v.ts || 0) > (cur.ts || 0)) merged[k] = v;
      }
      s.data = merged;
      memSingle.set(loc, s);
    }
  });
}

export async function translateBatch(
  rawTriples: string[],
  locale: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<BatchMap> {
  ensureBootstrapped();

  const unique = Array.from(new Set(rawTriples));
  const result: BatchMap = {};
  const miss: string[] = [];

  for (const raw of unique) {
    const hit = getFromBatchCache(locale, raw);
    if (hit) result[raw] = hit;
    else miss.push(raw);
  }
  if (miss.length === 0) return result;

  const items = miss.map((raw, i) => ({ id: `i${now()}_${i}`, raw }));
  const res = await fetch("/api/translate/bunch", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ locale, items }),
    signal,
  });
  if (!res.ok) throw new Error(`translate ${res.status}`);

  const map = (await res.json()) as BatchMap;
  for (const raw of miss) {
    const triple = map[raw] ?? { city: "", country: "", admin: "" };
    result[raw] = triple;
    if (triple.city || triple.country || triple.admin)
      setToBatchCache(locale, raw, triple);
  }
  return result;
}

export async function translateSingle(
  single: string,
  lang: "ru" | "uk" | string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<string | null> {
  ensureBootstrapped();

  const cached = getFromSingleCache(lang, single);
  if (cached) return cached;

  try {
    const res = await fetch("/api/translate/single", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ single, lang }),
      signal,
    });

    if (!res.ok) throw new Error(`translate ${res.status}`);
    const { translation } = (await res.json()) as { translation: string };
    const v = (translation ?? "").trim();
    if (!v) return null;

    setToSingleCache(lang, single, v);
    return v;
  } catch (e) {
    return null;
  }
}
