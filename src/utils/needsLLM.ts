const RU_ONLY = /[ЁёЪъЫыЭэ]/u;
const UK_ONLY = /[ҐґЄєІіЇї]/u;

const HAS_LATIN = /\p{Script=Latin}/u;
const HAS_CYRIL = /\p{Script=Cyrillic}/u;
const ONLY_NUM_PUNCT = /^[\s\d\-\.,'’ʼ()/\\:;!?]+$/u;

export function needsLLM(raw: string, lang: "ru" | "uk" | string): boolean {
  const s = (raw ?? "").trim();
  if (!s || ONLY_NUM_PUNCT.test(s)) return false;

  if (HAS_LATIN.test(s)) return true;

  if (!HAS_CYRIL.test(s)) return true;

  if (lang === "ru") {
    return UK_ONLY.test(s);
  } else {
    return RU_ONLY.test(s);
  }
}
