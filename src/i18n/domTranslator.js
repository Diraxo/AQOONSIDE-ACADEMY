// Applies the active language to everything React renders, without touching React's own tree:
// text nodes and a few attributes are rewritten in place (nodes are never added or removed), and
// the original English is remembered so we can switch back and so React's next write wins.
//
// Why a DOM layer instead of wrapping each string: the app has thousands of sentences built from
// fragments and variables ("Welcome, {name}", toasts, server errors). Looking at the *whole* text of
// an element lets the Somali dictionary translate a full sentence (with correct Somali word order)
// instead of word-by-word pieces.
import { getLang, subscribeLang, translateToSomali } from "./core.js";

const ATTRS = ["placeholder", "title", "aria-label", "alt", "label"];
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE", "SVG", "CANVAS"]);

// textNode -> { orig, shown }   (shown = the value we last wrote, to tell React's writes from ours)
const textState = new WeakMap();
// element -> { [attr]: { orig, shown } }
const attrState = new WeakMap();

let observer = null;
let queue = new Set();
let scheduled = false;

function skipped(el) {
  for (let n = el; n && n.nodeType === 1; n = n.parentNode) {
    if (SKIP_TAGS.has(n.tagName.toUpperCase())) return true;
    if (n.getAttribute && (n.getAttribute("translate") === "no" || n.hasAttribute("data-no-translate"))) return true;
    if (n.isContentEditable) return true;
  }
  return false;
}

function syncOrig(node) {
  let st = textState.get(node);
  if (!st) { st = { orig: node.nodeValue, shown: node.nodeValue }; textState.set(node, st); return st; }
  // React (or anyone else) wrote a fresh value: that new value is the new English original.
  if (node.nodeValue !== st.shown) { st.orig = node.nodeValue; st.shown = node.nodeValue; }
  return st;
}

function setText(node, st, value) {
  if (node.nodeValue !== value) node.nodeValue = value;
  st.shown = value;
}

// Translate the direct text children of `el`. When the element holds only text nodes (React splits
// "Hello {name}!" into several), they are translated as one sentence.
function processElement(el, lang) {
  if (skipped(el)) return;
  const kids = el.childNodes;
  let onlyText = true;
  const texts = [];
  for (let i = 0; i < kids.length; i++) {
    const k = kids[i];
    if (k.nodeType === 3) texts.push(k);
    else if (k.nodeType === 1) onlyText = false;
  }
  if (!texts.length) return;
  const states = texts.map(syncOrig);

  if (lang === "en") { texts.forEach((n, i) => setText(n, states[i], states[i].orig)); return; }

  if (onlyText && texts.length > 1) {
    const joined = states.map((s) => s.orig).join("");
    const tr = translateToSomali(joined);
    if (tr != null) {
      texts.forEach((n, i) => setText(n, states[i], i === 0 ? tr : ""));
      return;
    }
  }
  texts.forEach((n, i) => {
    const tr = translateToSomali(states[i].orig);
    setText(n, states[i], tr != null ? tr : states[i].orig);
  });
}

function processAttrs(el, lang) {
  if (el.nodeType !== 1 || skipped(el)) return;
  let map = attrState.get(el);
  for (const a of ATTRS) {
    if (!el.hasAttribute(a)) continue;
    if (!map) { map = {}; attrState.set(el, map); }
    const cur = el.getAttribute(a);
    let st = map[a];
    if (!st) st = map[a] = { orig: cur, shown: cur };
    else if (cur !== st.shown) { st.orig = cur; st.shown = cur; }
    const tr = lang === "en" ? null : translateToSomali(st.orig);
    const next = tr != null ? tr : st.orig;
    if (cur !== next) el.setAttribute(a, next);
    st.shown = next;
  }
  if (el.tagName === "INPUT" && /^(button|submit|reset)$/i.test(el.type) && el.value) {
    let map2 = attrState.get(el); if (!map2) { map2 = {}; attrState.set(el, map2); }
    let st = map2.value;
    if (!st) st = map2.value = { orig: el.value, shown: el.value };
    else if (el.value !== st.shown) { st.orig = el.value; st.shown = el.value; }
    const tr = lang === "en" ? null : translateToSomali(st.orig);
    const next = tr != null ? tr : st.orig;
    if (el.value !== next) el.value = next;
    st.shown = next;
  }
}

function processTree(root, lang) {
  if (!root) return;
  if (root.nodeType === 3) { if (root.parentNode) processElement(root.parentNode, lang); return; }
  if (root.nodeType !== 1) return;
  if (skipped(root)) return;
  processAttrs(root, lang);
  processElement(root, lang);
  const walker = document.createTreeWalker(root, 1 /* SHOW_ELEMENT */, {
    acceptNode: (n) => (SKIP_TAGS.has(n.tagName.toUpperCase()) ? 2 /* REJECT */ : 1),
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    processAttrs(n, lang);
    processElement(n, lang);
  }
}

function flush() {
  scheduled = false;
  const lang = getLang();
  const items = [...queue]; queue = new Set();
  for (const it of items) {
    if (it.__full) { processTree(it.root, lang); continue; }
    if (it.isConnected === false) continue;
    if (it.nodeType === 3) { if (it.parentNode) processElement(it.parentNode, lang); }
    else { processAttrs(it, lang); processElement(it, lang); }
  }
  if (observer) observer.takeRecords(); // drop the mutations we just made ourselves
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  (typeof queueMicrotask === "function" ? queueMicrotask : (fn) => Promise.resolve().then(fn))(flush);
}

function onMutations(records) {
  for (const r of records) {
    if (r.type === "characterData") queue.add(r.target);
    else if (r.type === "attributes") queue.add(r.target);
    else if (r.type === "childList") {
      if (r.target.nodeType === 1) queue.add(r.target);
      r.addedNodes.forEach((n) => { if (n.nodeType === 1) queue.add(Object.assign(Object.create(null), { __full: true, root: n })); else if (n.nodeType === 3) queue.add(n); });
    }
  }
  schedule();
}

function fullPass() {
  queue.add({ __full: true, root: document.body });
  schedule();
}

let started = false;
export function startDomTranslator() {
  if (started || typeof document === "undefined" || typeof MutationObserver === "undefined") return;
  started = true;
  document.documentElement.lang = getLang();
  observer = new MutationObserver(onMutations);
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  subscribeLang(() => fullPass());
  if (getLang() !== "en") fullPass();

  // Native dialogs (confirm / alert) are not in the DOM, so translate their message directly.
  for (const name of ["alert", "confirm"]) {
    const orig = window[name];
    if (typeof orig !== "function" || orig.__i18n) continue;
    const wrapped = function (msg, ...rest) { return orig.call(window, getLang() === "so" ? (translateToSomali(String(msg)) ?? msg) : msg, ...rest); };
    wrapped.__i18n = true;
    window[name] = wrapped;
  }
}
