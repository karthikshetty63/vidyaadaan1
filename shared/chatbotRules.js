// The VIDYADAAN help assistant: the limits on what the browser may send, used by both the chat window
// (to stop typing at the limit) and the server (which checks everything again).

/** Longest question someone can type, in characters. */
export const CHAT_MESSAGE_MAX = 1000;
/** Most earlier messages the browser may send back with a question (the server uses only the last few). */
export const CHAT_HISTORY_MAX = 20;
/** Longest earlier message, in characters (assistant answers can be longer than questions). */
export const CHAT_HISTORY_ENTRY_MAX = 2000;
export const CHAT_ROLES = ["user", "assistant"];

// Line breaks and tabs stay; other invisible control characters are removed.
// eslint-disable-next-line no-control-regex -- removing control characters is the point.
const CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;
const clean = (text) => text.replace(CONTROL_CHARS, "").trim();

/**
 * Checks a chat request: `{ message, history? }` and nothing else. The browser never says who is asking
 * or which assistant to use — the server decides that from the sign-in session — so any other field
 * (such as `persona` or `role`) is refused.
 * @returns {{ error: string } | { value: { message: string, history: { role: string, content: string }[] } }}
 */
export const validateChatRequest = (body) => {
    if (!body || typeof body !== "object" || Array.isArray(body)) return { error: "Send your question as JSON." };
    const extra = Object.keys(body).find((key) => !["message", "history"].includes(key));
    if (extra) return { error: `Unexpected field: ${extra.slice(0, 40)}.` };

    if (typeof body.message !== "string") return { error: "Type a question." };
    const message = clean(body.message);
    if (!message) return { error: "Type a question." };
    if (message.length > CHAT_MESSAGE_MAX) return { error: `Keep your question under ${CHAT_MESSAGE_MAX} characters.` };

    const rawHistory = body.history ?? [];
    if (!Array.isArray(rawHistory)) return { error: "The conversation history is not valid." };
    if (rawHistory.length > CHAT_HISTORY_MAX) return { error: `Send at most ${CHAT_HISTORY_MAX} earlier messages.` };
    const history = [];
    for (const entry of rawHistory) {
        const valid =
            entry && typeof entry === "object" && !Array.isArray(entry) &&
            Object.keys(entry).every((key) => key === "role" || key === "content") &&
            CHAT_ROLES.includes(entry.role) && typeof entry.content === "string";
        if (!valid) return { error: "The conversation history is not valid." };
        const content = clean(entry.content);
        if (content.length > CHAT_HISTORY_ENTRY_MAX) return { error: "An earlier message in the conversation is too long." };
        if (content) history.push({ role: entry.role, content });
    }
    return { value: { message, history } };
};
