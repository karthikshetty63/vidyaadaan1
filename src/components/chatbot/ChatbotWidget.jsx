import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { LuBookOpen, LuBotMessageSquare, LuCircleAlert, LuRotateCcw, LuSendHorizontal, LuSparkles, LuX } from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import { CHAT_HISTORY_ENTRY_MAX, CHAT_HISTORY_MAX, CHAT_MESSAGE_MAX, getChatbotPersona, sendChatMessage } from "../../api/chatbot";

const DEFAULT_NAME = "VIDYADAAN Assistant";

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

const QuestionChips = ({ label, questions, onAsk, disabled }) =>
  questions?.length ? (
    <div className="mt-3">
      {label && <p className="mb-1.5 text-xs font-medium text-slate-500">{label}</p>}
      <div className="flex flex-wrap gap-1.5">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            disabled={disabled}
            onClick={() => onAsk(q)}
            className="rounded-full border border-primary-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-primary-700 hover:bg-primary-50 disabled:opacity-60"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  ) : null;

const AssistantBubble = ({ children }) => (
  <div className="flex items-start gap-2">
    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600" aria-hidden="true">
      <LuBotMessageSquare className="h-4 w-4" />
    </span>
    <div className="min-w-0 max-w-[85%] rounded-2xl rounded-tl-md bg-slate-100 px-3.5 py-2.5 text-sm leading-relaxed text-slate-800">{children}</div>
  </div>
);

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
    // Inside the portals the assistant takes the dashboards' indigo colours and font (index.css). This
    // wrapper has no size: the button and the window are fixed to the screen, so the page never grows.
    <div className={pathname.startsWith("/dashboard") ? "dashboard-theme" : ""}>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close the help assistant" : "Open the help assistant"}
        className={`${open ? "hidden sm:flex" : "flex"} fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-900/20 transition hover:bg-primary-700 focus-visible:outline-offset-4`}
      >
        {open ? <LuX className="h-6 w-6" aria-hidden="true" /> : <LuBotMessageSquare className="h-6 w-6" aria-hidden="true" />}
      </button>

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
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-white sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(36rem,calc(100dvh-8rem))] sm:w-[24rem] sm:rounded-panel sm:border sm:border-slate-200 sm:shadow-2xl"
        >
          <header className="flex items-center gap-3 border-b border-slate-200 bg-primary-600 px-4 py-3 text-white">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15" aria-hidden="true">
              <LuBotMessageSquare className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="truncate text-sm font-bold">{name}</h2>
              <p className="truncate text-xs text-white/80">
                {info ? (info.aiEnabled ? "AI answers from VIDYADAAN help" : "Answers from help topics") : "VIDYADAAN help"}
              </p>
            </div>
            <button type="button" onClick={clear} disabled={!messages.length || pending} aria-label="Clear chat" title="Clear chat" className="rounded-lg p-2 text-white/90 hover:bg-white/15 disabled:opacity-40">
              <LuRotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={close} aria-label="Close the help assistant" title="Close" className="rounded-lg p-2 text-white/90 hover:bg-white/15">
              <LuX className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" role="log" aria-live="polite" aria-label="Conversation">
            {personaError && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <LuCircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {personaError}{" "}
                  <button type="button" onClick={loadPersona} className="font-semibold underline underline-offset-2">Try again</button>
                </span>
              </div>
            )}
            {info && !info.aiEnabled && (
              <p className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <LuBookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                AI answers aren&rsquo;t switched on yet, so answers come straight from VIDYADAAN&rsquo;s help topics.
              </p>
            )}

            <AssistantBubble>
              <p>Hi! I&rsquo;m the {name}. Ask me anything about using VIDYADAAN.</p>
              {!messages.length && <QuestionChips label="Try asking" questions={info?.suggestions} onAsk={ask} disabled={pending} />}
            </AssistantBubble>

            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-line break-words rounded-2xl rounded-tr-md bg-primary-600 px-3.5 py-2.5 text-sm text-white">{m.content}</p>
                </div>
              ) : (
                <AssistantBubble key={m.id}>
                  <AnswerText text={m.content} />
                  <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    {m.mode === "ai" ? <LuSparkles className="h-3 w-3" aria-hidden="true" /> : <LuBookOpen className="h-3 w-3" aria-hidden="true" />}
                    {m.mode === "ai" ? "AI answer: check important details" : "From VIDYADAAN's help topics"}
                  </p>
                  {m.mode === "ai" && m.sources.length > 0 && (
                    <p className="mt-1 text-[11px] text-slate-500">Based on: {m.sources.slice(0, 2).map((s) => s.question).join(" · ")}</p>
                  )}
                  <QuestionChips label="Related questions" questions={m.related} onAsk={ask} disabled={pending} />
                </AssistantBubble>
              )
            )}

            {pending && (
              <AssistantBubble>
                <span className="flex items-center gap-1 py-1" aria-label="The assistant is answering">
                  {[0, 150, 300].map((delay) => (
                    <span key={delay} className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </span>
              </AssistantBubble>
            )}

            {failed && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
                <LuCircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <div>
                  <p>{failed.message}</p>
                  <button type="button" onClick={retry} disabled={pending} className="mt-1 font-semibold underline underline-offset-2">Try again</button>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={onSubmit} className="border-t border-slate-200 bg-white px-3 pb-3 pt-2">
            <div className="flex items-end gap-2">
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
                className="max-h-28 min-h-11 flex-1 resize-none rounded-control border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 [field-sizing:content]"
              />
              <button
                type="submit"
                disabled={!draft.trim() || pending}
                aria-label="Send"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
              >
                <LuSendHorizontal className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-1.5 flex justify-between gap-2 text-[11px] text-slate-500">
              <span>Never share passwords or bank details. Chats aren&rsquo;t saved.</span>
              {draft.length > CHAT_MESSAGE_MAX - 100 && <span aria-live="polite">{draft.length}/{CHAT_MESSAGE_MAX}</span>}
            </p>
          </form>
        </section>
      )}
    </div>
  );
};

export default ChatbotWidget;
