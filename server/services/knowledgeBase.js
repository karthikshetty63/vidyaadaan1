// The help assistant's knowledge: knowledge/vidyadaan_knowledge.csv, one question and answer per row.
// Rows are read again whenever the file changes, so the team can improve answers without a code change.
// A broken row is skipped with a warning in the server log; a missing file means no answers, not a crash.
import fs from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { KNOWLEDGE_PERSONAS } from "./chatbotPersonas.js";

export const DEFAULT_KNOWLEDGE_FILE = fileURLToPath(new URL("../../knowledge/vidyadaan_knowledge.csv", import.meta.url));

const REQUIRED_COLUMNS = ["id", "persona", "category", "question", "answer", "keywords", "language"];
const ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,39}$/i;
const QUESTION_MAX = 300;
const ANSWER_MAX = 2000;
const MAX_RESULTS = 4;

/**
 * Splits CSV text into rows of fields (RFC 4180: fields in double quotes may contain commas, line
 * breaks and "" for a quote). Throws if a quoted field is never closed.
 */
export const parseCsv = (text) => {
    // A byte-order mark (added by some spreadsheet programs) is not part of the first column name.
    const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;
    for (let i = 0; i < input.length; i += 1) {
        const ch = input[i];
        if (quoted) {
            if (ch === '"' && input[i + 1] === '"') {
                field += '"';
                i += 1;
            } else if (ch === '"') {
                quoted = false;
            } else {
                field += ch;
            }
        } else if (ch === '"' && field === "") {
            quoted = true;
        } else if (ch === ",") {
            row.push(field);
            field = "";
        } else if (ch === "\n" || ch === "\r") {
            if (ch === "\r" && input[i + 1] === "\n") i += 1;
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
        } else {
            field += ch;
        }
    }
    if (quoted) throw new Error("a quoted field is never closed");
    if (field !== "" || row.length) {
        row.push(field);
        rows.push(row);
    }
    return rows;
};

// ─── Words ───────────────────────────────────────────────────────────────────
const STOPWORDS = new Set(
    ("a about am an and any are as at be been being but by can could did do does doing for from get got had has have " +
        "how i if im in into is it its just me my of on or our please should so than that the their them then there these " +
        "this those to us was we were what when where which who whom why will with would you your yours i'd i'm i've").split(" ")
);

/** A light stemmer, so "donate", "donated" and "donating" match each other. */
const stem = (word) => {
    if (word.length > 4 && /ie[sd]$/.test(word)) return `${word.slice(0, -3)}y`;
    let w = word;
    for (const suffix of ["ing", "ed", "es", "s"]) {
        if (w.length - suffix.length >= 3 && w.endsWith(suffix) && !(suffix === "s" && w.endsWith("ss"))) {
            w = w.slice(0, -suffix.length);
            break;
        }
    }
    return w.length > 3 && w.endsWith("e") ? w.slice(0, -1) : w;
};

/** Lowercase words (letters and digits in any script), stemmed. Stop words stay unless `dropStopwords`. */
const words = (text, { dropStopwords = false } = {}) =>
    String(text)
        .toLowerCase()
        .replace(/['’]/g, "")
        .split(/[^\p{L}\p{N}]+/u)
        .filter((w) => w && !(dropStopwords && STOPWORDS.has(w)))
        .map(stem);

const tokenSet = (text) => new Set(words(text, { dropStopwords: true }));
/** " word word … " for finding whole phrases. */
const phraseText = (text) => ` ${words(text).join(" ")} `;

// ─── Loading ─────────────────────────────────────────────────────────────────
const toEntry = (record) => {
    const phrases = record.keywords.split(",").map((k) => words(k).join(" ")).filter(Boolean);
    return {
        id: record.id,
        persona: record.persona,
        category: record.category,
        question: record.question,
        answer: record.answer,
        language: record.language || "en",
        suggested: /^(yes|y|true|1)$/i.test(record.suggested || ""),
        index: {
            // A phrase made only of common words ("what is") would match almost any question.
            multiWordKeywords: phrases.filter((p) => p.includes(" ") && p.split(" ").some((w) => !STOPWORDS.has(w))),
            keywords: new Set(phrases.flatMap((p) => p.split(" ")).filter((w) => !STOPWORDS.has(w))),
            question: tokenSet(record.question),
            category: tokenSet(record.category),
            answer: tokenSet(record.answer),
        },
    };
};

/**
 * Reads one knowledge file. Never throws: problems become `warnings` and the rows that are fine are kept.
 * @returns {{ entries: object[], warnings: string[] }}
 */
export const loadKnowledgeFile = (file) => {
    let text;
    try {
        text = fs.readFileSync(file, "utf8");
    } catch (error) {
        return { entries: [], warnings: [`Knowledge file could not be read (${error.code || error.message}); the assistant has no answers.`] };
    }
    let rows;
    try {
        rows = parseCsv(text);
    } catch (error) {
        return { entries: [], warnings: [`Knowledge file is not valid CSV (${error.message}); the assistant has no answers.`] };
    }
    const header = (rows.shift() || []).map((h) => h.trim().toLowerCase());
    const missing = REQUIRED_COLUMNS.filter((c) => !header.includes(c));
    if (missing.length) return { entries: [], warnings: [`Knowledge file is missing the column(s) ${missing.join(", ")}; the assistant has no answers.`] };

    const entries = [];
    const warnings = [];
    const seen = new Set();
    rows.forEach((cells, i) => {
        const line = i + 2;
        if (cells.every((c) => !c.trim())) return;
        const record = Object.fromEntries(header.map((h, col) => [h, (cells[col] ?? "").trim()]));
        record.persona = record.persona.toLowerCase();
        const problem =
            !ID_PATTERN.test(record.id) ? "its id is missing or not a short code"
                : seen.has(record.id) ? `the id ${record.id} is used twice`
                    : !KNOWLEDGE_PERSONAS.includes(record.persona) ? `the persona "${record.persona.slice(0, 20)}" is unknown`
                        : !record.question || !record.answer ? "its question or answer is empty"
                            : record.question.length > QUESTION_MAX || record.answer.length > ANSWER_MAX ? "its question or answer is too long"
                                : null;
        if (problem) {
            warnings.push(`Knowledge file line ${line} skipped: ${problem}.`);
            return;
        }
        seen.add(record.id);
        entries.push(toEntry(record));
    });
    return { entries, warnings };
};

let knowledgeFile = process.env.CHATBOT_KNOWLEDGE_FILE?.trim() || DEFAULT_KNOWLEDGE_FILE;
let cache = null;

/** Use another knowledge file (tests). */
export const setKnowledgeFile = (file) => {
    knowledgeFile = file;
    cache = null;
};

/** Every usable row, read again only when the file has changed. */
export const getKnowledge = () => {
    let stamp = "missing";
    try {
        const stat = fs.statSync(knowledgeFile);
        stamp = `${stat.mtimeMs}:${stat.size}`;
    } catch {
        // reported by loadKnowledgeFile
    }
    if (cache?.file === knowledgeFile && cache.stamp === stamp) return cache.entries;
    const { entries, warnings } = loadKnowledgeFile(knowledgeFile);
    for (const warning of warnings) console.warn(warning);
    cache = { file: knowledgeFile, stamp, entries };
    return entries;
};

// ─── Searching ───────────────────────────────────────────────────────────────
/** How well one row matches: `score`, and `coverage`, the share of the question's words it explains. */
const scoreEntry = (entry, query) => {
    let score = 0;
    let covered = 0;
    for (const phrase of entry.index.multiWordKeywords) if (query.phrases.includes(` ${phrase} `)) score += 4;
    for (const token of query.tokens) {
        if (entry.index.keywords.has(token)) score += 3;
        else if (entry.index.question.has(token)) score += 2;
        else if (entry.index.category.has(token)) score += 1;
        else if (entry.index.answer.has(token)) score += 0.5;
        if (entry.index.keywords.has(token) || entry.index.question.has(token) || entry.index.category.has(token)) covered += 1;
    }
    // Between equally good answers, the one written for this persona comes first.
    if (score > 0 && entry.persona !== "general") score += 0.5;
    return { score, coverage: covered / query.tokens.size };
};

/**
 * The rows that best answer `text`, for one persona (only rows for its `knowledge` personas are searched).
 * @returns {{ entry: object, score: number, coverage: number }[]} best first, at most `limit`
 */
export const searchKnowledge = (text, persona, { limit = MAX_RESULTS } = {}) => {
    const query = { tokens: tokenSet(text), phrases: phraseText(text) };
    if (!query.tokens.size) return [];
    const scored = getKnowledge()
        .filter((entry) => persona.knowledge.includes(entry.persona))
        .map((entry) => ({ entry, ...scoreEntry(entry, query) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score);
    if (!scored.length) return [];
    // Only answers close to the best one: a single shared word ("project") isn't a match.
    const floor = Math.max(2.5, scored[0].score * 0.35);
    return scored.filter((r) => r.score >= floor).slice(0, limit);
};

/**
 * Whether a search result answers the question well enough to show it on its own (FAQ mode): it explains
 * most of the question's words, or half of them with strong keyword matches.
 */
export const isConfidentMatch = (result) => Boolean(result) && (result.coverage > 0.5 || (result.coverage >= 0.5 && result.score >= 6));

/**
 * The rows the AI gets for a question: the best matches for it and, for a follow-up like "how long does
 * that take?", for the question before it too.
 */
export const knowledgeForConversation = (message, previousQuestion, persona) => {
    const found = searchKnowledge(message, persona).map((r) => r.entry);
    if (previousQuestion && found.length < MAX_RESULTS) {
        for (const { entry } of searchKnowledge(previousQuestion, persona, { limit: 2 })) {
            if (found.length < MAX_RESULTS && !found.includes(entry)) found.push(entry);
        }
    }
    return found;
};

/** Up to four questions to offer as buttons: this persona's own first, then general ones. */
export const suggestionsFor = (persona, limit = 4) => {
    const suggested = getKnowledge().filter((e) => e.suggested && persona.knowledge.includes(e.persona));
    const own = suggested.filter((e) => e.persona !== "general");
    const general = suggested.filter((e) => e.persona === "general");
    return [...own, ...general].slice(0, limit).map((e) => e.question);
};
