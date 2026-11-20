// Language engine: current language, dictionary lookup (exact + template patterns) and a tiny
// subscription mechanism. No React in here so services/utilities can use `L()` / `translate()`.
//
// English is the source language: every screen is written in English, and Somali is applied on top
// by (1) `translate()` against the reviewed Somali dictionary and (2) hand-written `L(en, so)` pairs
// for messages that need real guidance (e.g. why something cannot be deleted and what to do).
import SO_ENTRIES from "./so.js";
import { SO_EXTRA } from "./soExtra.js";

export const LANGS = [
  { code: "en", short: "EN", label: "English" },
  { code: "so", short: "SO", label: "Soomaali" },
];
const STORAGE_KEY = "aqoonside.lang";

function readStored() {
  try { const v = localStorage.getItem(STORAGE_KEY); return v === "so" ? "so" : "en"; } catch { return "en"; }
}

let current = readStored();
const listeners = new Set();

export function getLang() { return current; }
export function setLang(code) {
  const next = code === "so" ? "so" : "en";
  if (next === current) return;
  current = next;
  try { localStorage.setItem(STORAGE_KEY, next); } catch { /* storage unavailable: keep in memory only */ }
  try { document.documentElement.lang = next; } catch { /* non-DOM env */ }
  listeners.forEach((fn) => fn(next));
}
export function subscribeLang(fn) { listeners.add(fn); return () => listeners.delete(fn); }

const norm = (s) => s.replace(/\s+/g, " ").trim();

// ---- dictionary ---------------------------------------------------------------------------
const exact = new Map();
const patterns = []; // { re, parts, weight } for templates containing {} placeholders
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function register(en, so) {
  if (!en || !so) return;
  const key = norm(en);
  if (!key.includes("{}")) { exact.set(key, so); return; }
  const pieces = key.split("{}");
  if ((key.replace(/{}/g, "").match(/[A-Za-z]/g) || []).length < 3) return; // too generic to match safely
  const re = new RegExp("^" + pieces.map(esc).join("(.*?)") + "$", "s");
  patterns.push({ re, so, weight: pieces.join("").length });
}
for (const [en, so] of SO_ENTRIES) register(en, so);
for (const [en, so] of Object.entries(SO_EXTRA)) register(en, so);
patterns.sort((a, b) => b.weight - a.weight);

// ---- Gregorian month / weekday names inside formatted dates ---------------------------------
const MONTHS = {
  January: "Janaayo", February: "Febraayo", March: "Maarso", April: "Abriil", May: "Maajo", June: "Juun",
  July: "Luulyo", August: "Agoosto", September: "Sebtembar", October: "Oktoobar", November: "Nofembar", December: "Desembar",
  Jan: "Jan", Feb: "Feb", Mar: "Mar", Apr: "Abr", Jun: "Jun", Jul: "Luu", Aug: "Ago", Sep: "Seb", Sept: "Seb", Oct: "Okt", Nov: "Nof", Dec: "Des",
};
const DAYS = {
  Monday: "Isniin", Tuesday: "Talaado", Wednesday: "Arbaco", Thursday: "Khamiis", Friday: "Jimce", Saturday: "Sabti", Sunday: "Axad",
  Mon: "Isn", Tue: "Tal", Wed: "Arb", Thu: "Kha", Fri: "Jim", Sat: "Sab", Sun: "Axd",
};
const MONTH_RE = new RegExp("(\\b\\d{1,2}\\s+|^)(" + Object.keys(MONTHS).join("|") + ")(?=\\.?\\s+\\d|\\.?,|\\.?$)|\\b(" + Object.keys(MONTHS).join("|") + ")(?=\\.?\\s+\\d{1,2}\\b)", "g");
const DAY_RE = new RegExp("\\b(" + Object.keys(DAYS).join("|") + ")\\b(?=,|\\s+\\d|\\s+\\w{3,9}\\s+\\d|$)", "g");
function translateDates(s) {
  if (!/\d/.test(s) && !/^(Mon|Tues?|Wed|Thu|Fri|Sat|Sun)/.test(s)) return null;
  let changed = false;
  let out = s.replace(MONTH_RE, (m, pre, mon, mon2) => { changed = true; return (pre || "") + (MONTHS[mon || mon2] || mon || mon2); });
  out = out.replace(DAY_RE, (m, d) => { changed = true; return DAYS[d]; });
  return changed ? out : null;
}

// Composite strings ("2019-2020 E.C. — current", "Grade 5 · 32 students") are translated piece by
// piece around their separators when no whole-sentence entry exists.
function translateSegments(key, depth) {
  if (depth > 1) return null;
  const parts = key.split(/( — | – | · | • | \| |: |, |; )/);
  if (parts.length < 3) return null;
  let any = false;
  const out = parts.map((p, i) => {
    if (i % 2 === 1) return p;
    const piece = p.trim();
    if (!piece) return p;
    let tr = lookup(piece, depth + 1);
    if (tr == null && /^[a-z]/.test(piece)) {
      // "current", "closed" ... exist in the dictionary capitalised ("Current", "Closed").
      const up = lookup(piece[0].toUpperCase() + piece.slice(1), depth + 1);
      if (up != null) tr = up[0].toLowerCase() + up.slice(1);
    }
    if (tr != null) { any = true; return tr; }
    return p;
  });
  return any ? out.join("") : null;
}

// ---- translate ----------------------------------------------------------------------------
const cache = new Map();
function lookup(key, depth) {
  const hit = exact.get(key);
  if (hit !== undefined) return hit;
  if (cache.has(key)) return cache.get(key);
  let result = null;
  if (key.length > 1 && /[A-Za-z]/.test(key)) {
    for (const p of patterns) {
      const m = p.re.exec(key);
      if (!m) continue;
      const caps = m.slice(1).map((c) => (depth < 3 ? (translatePart(c, depth + 1) ?? c) : c));
      result = p.so.replace(/\{(\d+)\}/g, (_, n) => (caps[+n - 1] !== undefined ? caps[+n - 1] : ""));
      break;
    }
    if (result === null) result = translateSegments(key, depth);
    if (result === null) result = translateDates(key);
  }
  if (cache.size > 5000) cache.clear();
  cache.set(key, result);
  return result;
}
function translatePart(text, depth) {
  const lead = text.match(/^\s*/)[0];
  const trail = text.match(/\s*$/)[0];
  const key = norm(text);
  if (!key) return null;
  const hit = lookup(key, depth);
  return hit == null ? null : lead + hit + trail;
}

// Translate `text` to the current language. Returns the input unchanged when no translation exists.
export function translate(text) {
  if (current === "en" || typeof text !== "string" || !text) return text;
  return translatePart(text, 0) ?? text;
}
// Same, but ignores the current language — used by the DOM layer, which handles "en" itself.
export function translateToSomali(text) {
  if (typeof text !== "string" || !text) return null;
  return translatePart(text, 0);
}

// Pick the message for the active language (for hand-written guidance in both languages).
export function L(en, so) { return current === "so" && so ? so : en; }

// t("Hello {1}", name) — explicit translation with placeholders for code that builds sentences.
export function t(en, ...vars) {
  const base = translate(en);
  return base.replace(/\{(\d+)\}/g, (_, n) => (vars[+n - 1] !== undefined ? vars[+n - 1] : ""));
}
