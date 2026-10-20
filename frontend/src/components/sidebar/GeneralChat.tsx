import { useEffect, useRef, useState } from "react";

type Message = { id: string; role: "user" | "assistant"; content: string; status: "ok" | "error" };
const storageKey = "livefoot.assistant.history.v1";
const suggestions = ["Explique Kubernetes simplement", "Aide-moi à rédiger un message", "Quels sont les prochains matchs ?"];
function savedMessages(): Message[] {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(value) ? value.filter((m): m is Message => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && typeof m.id === "string" && (m.status === "ok" || m.status === "error")).slice(-40) : [];
  } catch { return []; }
}

export default function GeneralChat() {
  const [messages, setMessages] = useState<Message[]>(savedMessages);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const thread = useRef<HTMLDivElement>(null);
  useEffect(() => { try { sessionStorage.setItem(storageKey, JSON.stringify(messages.slice(-40))); } catch { /* Storage may be disabled. */ } }, [messages]);
  useEffect(() => { thread.current?.scrollTo({ top: thread.current.scrollHeight }); }, [messages, loading]);
  useEffect(() => () => controller.current?.abort(), []);

  const send = async (text: string, retry = false) => {
    const question = text.trim().slice(0, 1000);
    if (!question || loading) return;
    const abort = new AbortController();
    controller.current = abort;
    const previous = retry ? messages.slice(0, -2) : messages;
    const user: Message = { id: crypto.randomUUID(), role: "user", content: question, status: "ok" };
    setMessages([...previous, user]);
    setDraft("");
    setLoading(true);
    const history = previous.filter(m => m.status === "ok").slice(-6).map(m => ({ role: m.role, content: m.content.slice(0, 1200) }));
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: question, history, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }), signal: abort.signal });
      if (!response.ok) throw new Error("Assistant indisponible");
      const result = await response.json() as { answer?: string; status?: string };
      if (!result.answer?.trim()) throw new Error("Réponse vide");
      if (!abort.signal.aborted) setMessages(current => [...current, { id: crypto.randomUUID(), role: "assistant", content: result.answer!.trim(), status: result.status === "ok" ? "ok" : "error" }]);
    } catch {
      if (!abort.signal.aborted) setMessages(current => [...current, { id: crypto.randomUUID(), role: "assistant", content: "L’assistant est momentanément indisponible. Vous pouvez réessayer.", status: "error" }]);
    } finally { if (!abort.signal.aborted) setLoading(false); }
  };
  const reset = () => { controller.current?.abort(); setLoading(false); setMessages([]); setDraft(""); };
  const last = messages[messages.length - 1];
  return <section className="assistant-view" aria-labelledby="chat-title">
    <header className="assistant-view-header"><span className="assistant-kicker">VOTRE ASSISTANT IA</span><h2 id="chat-title">On en parle ?</h2><p>Pour comprendre, écrire, coder ou discuter d’un match.</p></header>
    <div className="chat-toolbar"><span>Historique de cet onglet</span><button type="button" onClick={reset} disabled={!messages.length && !loading} aria-label="Effacer la conversation et commencer une nouvelle discussion">Nouvelle discussion <span aria-hidden="true">↗</span></button></div>
    <div className="chat-thread" ref={thread} role="log" aria-label="Historique de la conversation" aria-live="polite" aria-relevant="additions">
      {!messages.length && <div className="chat-welcome"><span className="chat-welcome-mark" aria-hidden="true">LF<span>✦</span></span><h3>Qu’est-ce qu’on explore ?</h3><p>Une idée à clarifier ou une question précise ? Commencez ici.</p><div className="chat-suggestions">{suggestions.map(question => <button type="button" key={question} onClick={() => void send(question)}>{question}<span aria-hidden="true">↗</span></button>)}</div></div>}
      {messages.map(message => <div className={`chat-message chat-message--${message.role}${message.status === "error" ? " chat-message--error" : ""}`} key={message.id}><span className="chat-message-label">{message.role === "user" ? "Vous" : "Assistant"}</span><div>{message.content}</div></div>)}
      {loading && <div className="chat-typing" role="status"><span /><span /><span /><span className="sr-only">L’assistant prépare sa réponse.</span></div>}
      {last?.status === "error" && messages[messages.length - 2]?.role === "user" && !loading && <button type="button" className="chat-retry" onClick={() => void send(messages[messages.length - 2].content, true)}>Réessayer cette question ↻</button>}
    </div>
    <form className="chat-composer" onSubmit={event => { event.preventDefault(); void send(draft); }}>
      <label className="sr-only" htmlFor="chat-message">Votre message à l’assistant</label>
      <textarea id="chat-message" value={draft} onChange={event => setDraft(event.target.value)} maxLength={1000} placeholder="Posez votre question…" rows={2} disabled={loading} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(draft); } }} />
      <button type="submit" disabled={!draft.trim() || loading} aria-label="Envoyer le message"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m5 12 7-7 7 7M12 5v15" /></svg></button>
      <span>{draft.length}/1000</span>
    </form>
    <p className="assistant-disclaimer chat-disclaimer">Historique conservé pendant la session. Les réponses IA peuvent être inexactes.</p>
  </section>;
}
