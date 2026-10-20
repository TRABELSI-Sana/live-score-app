import { useEffect, useRef, useState } from "react";

type Focus = "overview" | "live" | "upcoming" | "finished";
type Reply = { answer: string; status: string; generatedAt?: string };
const defaults = ["Quels matchs restent ouverts ?", "Quels sont les prochains coups d’envoi ?", "Que retenir des résultats ?"];

export default function AiInsightsPanel({ initialFocus, onChat }: { initialFocus: Focus; onChat: () => void }) {
  const [focus, setFocus] = useState<Focus>(initialFocus);
  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState(defaults);
  const [reply, setReply] = useState<(Reply & { question: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    fetch("/api/ai/suggestions", { signal: abort.signal }).then(r => r.ok ? r.json() : null).then(data => {
      if (Array.isArray(data?.suggestions)) setSuggestions(data.suggestions.filter((s: unknown): s is string => typeof s === "string").slice(0, 3));
    }).catch(() => {});
    return () => { abort.abort(); controller.current?.abort(); };
  }, []);
  const analyze = async (question: string) => {
    if (!question.trim() || loading) return;
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setLoading(true);
    setPrompt(question);
    setReply(null);
    try {
      const response = await fetch("/api/ai/insights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: question, focus, maxMatches: 4 }), signal: abort.signal });
      if (!response.ok) throw new Error("Analyse indisponible");
      const result = await response.json() as Reply;
      if (!result.answer?.trim()) throw new Error("Réponse vide");
      setReply({ ...result, question });
    } catch {
      if (!abort.signal.aborted) setReply({ answer: "L’analyse est momentanément indisponible. Vous pouvez réessayer.", status: "error", question });
    } finally { if (!abort.signal.aborted) setLoading(false); }
  };
  return <section className="assistant-view" aria-labelledby="insights-title">
    <header className="assistant-view-header"><span className="assistant-kicker">L’ANALYSE DES MATCHS</span><h2 id="insights-title">Un autre regard sur le jeu.</h2><p>Posez votre question sur les rencontres du jour.</p></header>
    <div className="insights-body">
      <div className="insights-suggestions">{suggestions.map(question => <button type="button" key={question} disabled={loading} onClick={() => void analyze(question)}>{question}<span aria-hidden="true">↗</span></button>)}</div>
      <form onSubmit={event => { event.preventDefault(); void analyze(prompt); }}>
        <label htmlFor="insights-focus">Les rencontres à analyser</label>
        <select id="insights-focus" value={focus} disabled={loading} onChange={event => { setFocus(event.target.value as Focus); setReply(null); }}><option value="overview">La sélection du jour</option><option value="live">En direct</option><option value="upcoming">À venir</option><option value="finished">Terminées</option></select>
        <label htmlFor="insights-question">Votre question</label>
        <textarea id="insights-question" value={prompt} onChange={event => setPrompt(event.target.value)} maxLength={600} placeholder="Un match à suivre ? Un score à comprendre ?" rows={3} disabled={loading} />
        <button className="assistant-primary" type="submit" disabled={loading || !prompt.trim()}>{loading ? "Analyse en cours…" : "Analyser les rencontres"}<span aria-hidden="true">↗</span></button>
      </form>
      {loading && <div className="insights-pending" role="status"><span className="briefing-spinner" />Lecture des données des matchs…</div>}
      {reply && <div className={`insights-answer${reply.status === "ok" ? "" : " insights-answer--notice"}`} aria-live="polite"><span className="assistant-kicker">{reply.status === "ok" ? "L’ÉCLAIRAGE IA" : "À SAVOIR"}</span><p className="insights-answer-question">{reply.question}</p><p>{reply.answer}</p>{reply.status !== "ok" && reply.status !== "empty" && <button type="button" onClick={() => void analyze(reply.question)}>Réessayer</button>}</div>}
      <button className="assistant-chat-link" type="button" onClick={onChat}>Envie de poursuivre la discussion ? <span>Ouvrir le chat →</span></button>
      <p className="assistant-disclaimer">Une lecture des données disponibles, sans pronostic de résultat.</p>
    </div>
  </section>;
}
