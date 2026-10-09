import { apiRequest } from "./auth";

// Limits shared with the server (the server re-checks everything).
export { CHAT_HISTORY_ENTRY_MAX, CHAT_HISTORY_MAX, CHAT_MESSAGE_MAX } from "../../shared/chatbotRules.js";

/** { persona: { key, name }, signedIn, aiEnabled, suggestions } — the server picks the persona from the sign-in. */
export const getChatbotPersona = () => apiRequest("/api/chatbot/persona");

/**
 * One answer: { reply, mode: "ai" | "faq", persona, sources, related, notice? }.
 * `history` is the recent conversation ({ role: "user" | "assistant", content }); nothing is saved on the server.
 */
export const sendChatMessage = (message, history) => apiRequest("/api/chatbot/message", { method: "POST", body: { message, history } });
