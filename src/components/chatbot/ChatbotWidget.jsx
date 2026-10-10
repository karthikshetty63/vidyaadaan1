import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { LuBookOpen, LuBotMessageSquare, LuChevronRight, LuCircleAlert, LuRotateCcw, LuSendHorizontal, LuShieldCheck, LuSparkles, LuX } from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import { CHAT_HISTORY_ENTRY_MAX, CHAT_HISTORY_MAX, CHAT_MESSAGE_MAX, getChatbotPersona, sendChatMessage } from "../../api/chatbot";

const DEFAULT_NAME = "VIDYADAAN Assistant";
// The portals that use the brand-blue theme (the admin console keeps indigo).
const BLUE_PORTALS = ["/dashboard/school", "/dashboard/ngo", "/dashboard/donor"];

// What each assistant can help with, for its welcome message (the server says which assistant this is).
const INTRO = {
  school: "Ask me about your projects, NGO payments, alumni, reports and more.",
  ngo: "Ask me about school needs, funding commitments, payments and volunteers.",
  donor: "Ask me about donating, your donations and how projects are funded.",
  admin: "Ask me about account approvals, project reviews and payment QRs.",
  visitor: "Ask me about project emails, supporting your school or how VIDYADAAN works.",
};
const DEFAULT_INTRO = "Ask me anything about using VIDYADAAN.";

/**
 * An answer's plain text as paragraphs and simple lists ("- item", "1. step"). Always rendered as React
 * text, never as HTML, so nothing in an answer can run in the page.
 */
const AnswerText = ({ text }) => {
  const blocks = [];
  let breakBefore = false;
  for (const raw of text.replace(/\*\*(.+?)\*\*/g, "$1").split("\n")) {
    const bullet = raw.match(/^\s*[-•*]\s+(.*)$/);
    const step = raw.match(/^\s*\d+[.)]\s+(.*)$/);
    const kind = bullet ? "ul" : step ? "ol" : raw.trim() ? "p" : null;
    if (!kind) {
      breakBefore = true;
      continue;
    }
    const content = bullet?.[1] ?? step?.[1] ?? raw.trim();
    const last = blocks.at(-1);
    if (last?.kind === kind && !(kind === "p" && breakBefore)) last.items.push(content);
    else blocks.push({ kind, items: [content] });
    breakBefore = false;
  }
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        if (block.kind === "p") return <p key={i} className="whitespace-pre-line">{block.items.join("\n")}</p>;
        const List = block.kind;
        return (
          <List key={i} className={`space-y-1 pl-5 ${List === "ul" ? "list-disc" : "list-decimal"}`}>
            {block.items.map((item, j) => <li key={j}>{item}</li>)}
          </List>
        );
      })}
    </div>
  );
};

const BotAvatar = ({ className = "h-7 w-7 rounded-full", iconClassName = "h-3.5 w-3.5" }) => (
  <span
    className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-sm shadow-primary-900/20 ${className}`}
    aria-hidden="true"
  >
    <LuBotMessageSquare className={iconClassName} />
  </span>
);

/** The first screen: who this assistant is, and questions to start with. */
const Welcome = ({ name, info, onAsk, disabled }) => (
  <div className="motion-safe:animate-view-enter">
    <div className="flex flex-col items-center px-2 pt-3 text-center">
      <BotAvatar className="h-14 w-14 rounded-2xl" iconClassName="h-7 w-7" />
      <h3 className="mt-3 text-base font-bold text-slate-900">Hi! I&rsquo;m the {name}</h3>
      <p className="mt-1 max-w-[18rem] text-sm leading-relaxed text-slate-600">{(info && INTRO[info.persona.key]) || DEFAULT_INTRO}</p>
    </div>
    {info?.suggestions?.length > 0 && (
      <div className="mt-5">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Try asking</p>
        <ul className="space-y-2">
          {info.suggestions.map((q) => (
            <li key={q}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onAsk(q)}
                className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-60"
              >
                <span className="flex-1">{q}</span>
                <LuChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary-600" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const RelatedQuestions = ({ questions, onAsk, disabled }) =>
  questions?.length ? (
    <div>
      <p className="mb-1.5 text-[11px] font-medium text-slate-500">Related questions</p>
      <div className="flex flex-wrap gap-1.5">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            disabled={disabled}
            onClick={() => onAsk(q)}
            className="rounded-full border border-primary-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-primary-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 disabled:opacity-60"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  ) : null;

/** An answer, with where it came from and follow-up questions. */
const AssistantMessage = ({ message, onAsk, disabled }) => {
  const ai = message.mode === "ai";
  return (
    <div className="flex items-start gap-2 motion-safe:animate-view-enter">
      <BotAvatar className="mt-0.5 h-7 w-7 rounded-full" />
      <div className="min-w-0 max-w-[85%] space-y-2.5">
        <div className="rounded-2xl rounded-tl-md border border-slate-200/80 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-sm">
          <AnswerText text={message.content} />
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${ai ? "bg-primary-50 text-primary-700" : "bg-slate-100 text-slate-600"}`}>
              {ai ? <LuSparkles className="h-3 w-3" aria-hidden="true" /> : <LuBookOpen className="h-3 w-3" aria-hidden="true" />}
              {ai ? "AI answer" : "From VIDYADAAN's help topics"}
            </span>
            {ai && "Check important details"}
          </p>
          {ai && message.sources.length > 0 && (
            <p className="mt-1.5 text-[11px] leading-snug text-slate-500">Based on: {message.sources.slice(0, 2).map((s) => s.question).join(" · ")}</p>
          )}
        </div>
        <RelatedQuestions questions={message.related} onAsk={onAsk} disabled={disabled} />
      </div>
    </div>
  );
};

/**
 * The floating help assistant, on every page. The server decides which assistant answers (School, NGO,
 * Donor, System Admin, or Alumni & Visitor when not signed in) from the sign-in session. The conversation
 * lives only in this page's memory: it is gone after a reload, and it is cleared when someone signs in or out.
 */
const ChatbotWidget = () => {
  const { user, loading: authLoading } = useAuth();
  const { pathname } = useLocation();
  // Whose conversation this is: switching accounts (or signing out) starts a new one.
  const owner = user ? `${user.role}:${user.id}` : "visitor";

  const [open, setOpen] = useState(false);
  const [persona, setPersona] = useState({ owner: null, data: null, error: "" });
  const [chat, setChat] = useState({ owner, messages: [], failed: null });
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);

  const messages = chat.owner === owner ? chat.messages : [];
  const failed = chat.owner === owner ? chat.failed : null;
  const info = persona.owner === owner ? persona.data : null;
  const personaError = persona.owner === owner ? persona.error : "";
  const name = info?.persona.name || DEFAULT_NAME;

  const panelId = useId();
  const titleId = useId();
  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const endRef = useRef(null);
  const nextId = useRef(0);

  const loadPersona = useCallback(
    () =>
      getChatbotPersona().then(
        (data) => setPersona({ owner, data, error: "" }),
        (error) => setPersona({ owner, data: null, error: error.message || "The assistant could not be loaded." })
      ),
    [owner]
  );

  // Which assistant this is, checked each time the window opens (someone may have signed in or out).
  useEffect(() => {
    if (open && !authLoading) loadPersona();
  }, [open, authLoading, loadPersona]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, pending, failed]);

  const close = () => {
    setOpen(false);
    launcherRef.current?.focus();
  };

  /** Sends `question`, with `before` (the conversation so far) as context. */
  const ask = async (question, before = messages) => {
    const text = question.trim().slice(0, CHAT_MESSAGE_MAX);
    if (!text || pending) return;
    const history = before
      .slice(-CHAT_HISTORY_MAX)
      .map(({ role, content }) => ({ role, content: content.slice(0, CHAT_HISTORY_ENTRY_MAX) }));
    nextId.current += 1;
    const asked = { id: nextId.current, role: "user", content: text };
    setChat({ owner, messages: [...before, asked], failed: null });
    setDraft("");
    setPending(true);
    try {
      const answer = await sendChatMessage(text, history);
      nextId.current += 1;
      const reply = { id: nextId.current, role: "assistant", content: answer.reply, mode: answer.mode, sources: answer.sources || [], related: answer.related || [] };
      setChat((current) => (current.owner === owner ? { ...current, messages: [...current.messages, reply] } : current));
    } catch (error) {
      setChat((current) => (current.owner === owner ? { ...current, failed: { message: error.message, question: text } } : current));
    } finally {
      setPending(false);
    }
  };

  // The failed question is the last message: ask it again in its place.
  const retry = () => failed && ask(failed.question, messages.slice(0, -1));
  const clear = () => {
    setChat({ owner, messages: [], failed: null });
    inputRef.current?.focus();
  };

  const onSubmit = (event) => {
    event.preventDefault();
    ask(draft);
  };
  const onInputKeyDown = (event) => {
    // Enter sends; Shift+Enter starts a new line.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      ask(draft);
    }
  };

  return (
    // Inside the portals the assistant takes the dashboards' colours and font (index.css): the brand blue
    // in the school, NGO and donor portals, indigo in the admin console. This wrapper has no size: the
    // button and the window are fixed to the screen, so the page never grows.
    <div className={BLUE_PORTALS.some((portal) => pathname.startsWith(portal)) ? "dashboard-theme dashboard-blue" : pathname.startsWith("/dashboard") ? "dashboard-theme" : ""}>
      <div className={`${open ? "hidden sm:block" : ""} group fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6`}>
        {!open && (
          <span
            className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition group-focus-within:opacity-100 group-hover:opacity-100 sm:block"
            aria-hidden="true"
          >
            Need help? Ask me
          </span>
        )}
        <button
          ref={launcherRef}
          type="button"
          onClick={() => (open ? close() : setOpen(true))}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "Close the help assistant" : "Open the help assistant"}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-900/25 ring-4 ring-white/70 transition hover:scale-105 hover:shadow-xl active:scale-95 focus-visible:outline-offset-4 motion-reduce:transition-none motion-reduce:hover:scale-100"
        >
          {open ? <LuX className="h-6 w-6" aria-hidden="true" /> : <LuBotMessageSquare className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {/* z-50 like the site's top bar and dialogs: it comes later in the page, so the open window is above them. */}
      {open && (
        <section
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              close();
            }
          }}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-white motion-safe:animate-chat-open sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(38rem,calc(100dvh-8rem))] sm:w-[25rem] sm:origin-bottom-right sm:rounded-3xl sm:border sm:border-slate-200/70 sm:shadow-[0_24px_64px_-16px_rgb(15_23_42/0.35)]"
        >
          <header className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] text-white">
            {/* Soft circles for depth. */}
            <span className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-white/10" aria-hidden="true" />
            <span className="pointer-events-none absolute -bottom-20 right-20 h-32 w-32 rounded-full bg-white/5" aria-hidden="true" />
            <div className="relative flex items-center gap-3">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-md shadow-primary-900/20" aria-hidden="true">
                <LuBotMessageSquare className="h-6 w-6" />
                {/* Green once the assistant is ready, amber if it couldn't be loaded. */}
                <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-primary-700 ${personaError ? "bg-amber-400" : info ? "bg-emerald-400" : "bg-slate-300"}`} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="truncate text-[15px] font-bold leading-tight">{name}</h2>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-white/80">
                  {info?.aiEnabled ? <LuSparkles className="h-3 w-3 shrink-0" aria-hidden="true" /> : <LuBookOpen className="h-3 w-3 shrink-0" aria-hidden="true" />}
                  {info ? (info.aiEnabled ? "AI answers from VIDYADAAN help" : "Answers from help topics") : "VIDYADAAN help"}
                </p>
              </div>
              <button type="button" onClick={clear} disabled={!messages.length || pending} aria-label="Clear chat" title="Clear chat" className="rounded-xl p-2 text-white/85 transition hover:bg-white/15 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent">
                <LuRotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={close} aria-label="Close the help assistant" title="Close" className="rounded-xl p-2 text-white/85 transition hover:bg-white/15 hover:text-white">
                <LuX className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div
            className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-4 [scrollbar-color:var(--color-slate-300)_transparent] [scrollbar-width:thin]"
            role="log"
            aria-live="polite"
            aria-label="Conversation"
          >
            {personaError && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <LuCircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {personaError}{" "}
                  <button type="button" onClick={loadPersona} className="font-semibold underline underline-offset-2">Try again</button>
                </span>
              </div>
            )}

            {messages.length ? (
              <p className="text-center text-[11px] font-medium text-slate-500">You&rsquo;re chatting with the {name}</p>
            ) : (
              <Welcome name={name} info={info} onAsk={ask} disabled={pending} />
            )}

            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end motion-safe:animate-view-enter">
                  <p className="max-w-[85%] whitespace-pre-line break-words rounded-2xl rounded-tr-md bg-gradient-to-br from-primary-500 to-primary-700 px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm shadow-primary-900/15">
                    {m.content}
                  </p>
                </div>
              ) : (
                <AssistantMessage key={m.id} message={m} onAsk={ask} disabled={pending} />
              )
            )}

            {pending && (
              <div className="flex items-start gap-2">
                <BotAvatar className="mt-0.5 h-7 w-7 rounded-full" />
                <span role="status" aria-label="The assistant is answering" className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm">
                  {[0, 150, 300].map((delay) => (
                    <span key={delay} className="h-2 w-2 animate-bounce rounded-full bg-primary-400" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </span>
              </div>
            )}

            {failed && (
              <div role="alert" className="ml-9 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">
                <LuCircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <div>
                  <p>{failed.message}</p>
                  <button
                    type="button"
                    onClick={retry}
                    disabled={pending}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-700 shadow-sm ring-1 ring-red-200 transition hover:bg-red-100"
                  >
                    <LuRotateCcw className="h-3 w-3" aria-hidden="true" />
                    Try again
                  </button>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={onSubmit} className="border-t border-slate-200/70 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-1.5 pl-3.5 pr-1.5 transition focus-within:border-primary-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-500/10">
              <label htmlFor={`${panelId}-input`} className="sr-only">Your question</label>
              <textarea
                id={`${panelId}-input`}
                ref={inputRef}
                rows={1}
                value={draft}
                maxLength={CHAT_MESSAGE_MAX}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Ask about VIDYADAAN…"
                // The rounded box around it shows the focus.
                className="max-h-28 min-h-9 flex-1 resize-none bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus-visible:outline-none [field-sizing:content]"
              />
              <button
                type="submit"
                disabled={!draft.trim() || pending}
                aria-label="Send"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-sm shadow-primary-900/20 transition hover:brightness-110 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-500 disabled:shadow-none disabled:hover:brightness-100"
              >
                <LuSendHorizontal className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <LuShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Never share passwords or bank details. Chats aren&rsquo;t saved.</span>
              {draft.length > CHAT_MESSAGE_MAX - 100 && <span className="font-semibold text-slate-600" aria-live="polite">{draft.length}/{CHAT_MESSAGE_MAX}</span>}
            </p>
          </form>
        </section>
      )}
    </div>
  );
};

export default ChatbotWidget;
