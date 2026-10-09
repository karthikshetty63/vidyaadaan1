// The help assistant's AI: Claude, through Anthropic's official SDK, called only from this server.
// The API key (ANTHROPIC_API_KEY) stays in the server's environment and never reaches the browser.
// Without a key the assistant answers from the knowledge file alone, and says so.
import Anthropic from "@anthropic-ai/sdk";
import process from "node:process";

export const DEFAULT_CHATBOT_MODEL = "claude-opus-5-5";
// A chat answer should arrive while the person is still looking at the window.
const REQUEST_TIMEOUT_MS = 45_000;
// Includes the model's (short, low-effort) thinking as well as the answer.
const MAX_TOKENS = 16_000;

/** Thrown when Claude can't be reached or doesn't answer; `reason` is safe to log (never the question). */
export class AiUnavailableError extends Error {
    constructor(reason) {
        super(`AI provider unavailable: ${reason}`);
        this.name = "AiUnavailableError";
        this.reason = reason;
    }
}

let testClient = null;
let client = null;
let clientKey = null;

/** Use a fake Anthropic client (tests — they must never call the paid API). `null` goes back to the real one. */
export const setAiClient = (fake) => {
    testClient = fake;
};

const apiKey = () => process.env.ANTHROPIC_API_KEY?.trim() || "";

/** Whether answers come from Claude (true) or from the knowledge file only (false). */
export const isAiEnabled = () => Boolean(testClient || apiKey());

const getClient = () => {
    if (testClient) return testClient;
    if (!client || clientKey !== apiKey()) {
        clientKey = apiKey();
        client = new Anthropic({ apiKey: clientKey, timeout: REQUEST_TIMEOUT_MS, maxRetries: 1 });
    }
    return client;
};

/** A short, log-safe description of why the request failed. */
const describeFailure = (error) => {
    if (error instanceof Anthropic.APIConnectionTimeoutError) return "the request timed out";
    if (error instanceof Anthropic.APIConnectionError) return "could not connect to Anthropic";
    if (error instanceof Anthropic.AuthenticationError) return "ANTHROPIC_API_KEY was refused (HTTP 401)";
    if (error instanceof Anthropic.PermissionDeniedError) return "the API key may not use this model (HTTP 403)";
    if (error instanceof Anthropic.NotFoundError) return "the model in CHATBOT_MODEL was not found (HTTP 404)";
    if (error instanceof Anthropic.RateLimitError) return "Anthropic rate limit or spend limit reached (HTTP 429)";
    if (error instanceof Anthropic.BadRequestError) return `Anthropic rejected the request (HTTP 400${error.error?.error?.type ? `, ${error.error.error.type}` : ""})`;
    if (error instanceof Anthropic.APIError) return `Anthropic error${error.status ? ` (HTTP ${error.status})` : ""}`;
    return "unexpected error";
};

/**
 * Asks Claude for one answer.
 * @param {{ system: string, messages: { role: "user"|"assistant", content: string }[] }} request
 * @returns {Promise<{ refused: boolean, text: string, model: string }>} `refused` when Claude declined to answer
 * @throws {AiUnavailableError}
 */
export const generateReply = async ({ system, messages }) => {
    let response;
    try {
        response = await getClient().beta.messages.create({
            model: process.env.CHATBOT_MODEL?.trim() || DEFAULT_CHATBOT_MODEL,
            max_tokens: MAX_TOKENS,
            // Help-desk answers: quick and short rather than deeply reasoned.
            output_config: { effort: "low" },
            // If the model declines for policy reasons, Anthropic retries once on its default fallback model.
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            system,
            messages,
        });
    } catch (error) {
        throw new AiUnavailableError(describeFailure(error));
    }

    // Checked before reading the answer: a declined request has no usable text.
    if (response.stop_reason === "refusal") return { refused: true, text: "", model: response.model };
    const text = (response.content || [])
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("")
        .trim();
    if (!text) throw new AiUnavailableError(`empty answer (stop reason ${response.stop_reason || "unknown"})`);
    return { refused: false, text, model: response.model };
};
