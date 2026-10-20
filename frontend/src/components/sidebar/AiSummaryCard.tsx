import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatLocalTime } from "../../utils/matchSort";
import LineupModal from "../live/LineupModal";
import AiInsightsPanel from "./AiInsightsPanel";
import GeneralChat from "./GeneralChat";
import "./briefing.css";

type View = "briefing" | "insights" | "chat";
type Focus = "overview" | "live" | "upcoming";
type Highlight = {
  id: number | null; home: string; away: string; homeLogo: string | null; awayLogo: string | null;
  competition: string; country: string | null; phase: "live" | "upcoming" | "finished";
  score: string | null; minute: string | null; kickoff: string | null; label: string; reason: string;
};
type Briefing = {
  headline: string; description: string; liveCount: number; upcomingCount: number;
  finishedCount: number; competitionCount: number; highlights: Highlight[]; generatedAt: string;
};

function Sparkles() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3Z" /><path d="m20 2 .6 1.4L22 4l-1.4.6L20 6l-.6-1.4L18 4l1.4-.6L20 2Z" /></svg>;
}
function Crest({ name, logo }: { name: string; logo: string | null }) {
  const [failed, setFailed] = useState(false);
  return logo && !failed ? <img className="briefing-crest" src={logo} alt="" loading="lazy" onError={() => setFailed(true)} /> : <span className="briefing-crest briefing-crest--fallback" aria-hidden="true">{name.slice(0, 2).toUpperCase()}</span>;
}
function HighlightCard({ match, index, asOf, onOpen }: { match: Highlight; index: number; asOf: string; onOpen: () => void }) {
  const time = match.kickoff ? formatLocalTime(match.kickoff) : undefined;
  const center = match.phase === "upcoming" ? time ?? "À venir" : match.score ?? "–";
  const minutesUntil = match.kickoff ? Math.ceil((Date.parse(match.kickoff) - Date.parse(asOf)) / 60_000) : null;
  const label = match.phase === "upcoming" && minutesUntil !== null && minutesUntil > 0 && minutesUntil <= 60 ? `Coup d’envoi dans ${minutesUntil} min` : match.label;
  const status = match.phase === "live" ? (match.minute ? `${match.minute}′` : "En cours") : match.phase === "finished" ? "Terminé" : "Heure locale";
  return <article className={`briefing-match briefing-match--${match.phase}`}>
    <div className="briefing-match-top"><span className="briefing-match-label">{match.phase === "live" && <i className="briefing-live-dot" />}{label}</span><span className="briefing-match-number">0{index + 1}</span></div>
    <p className="briefing-competition">{match.competition}{match.country && match.country !== "World" ? ` · ${match.country}` : ""}</p>
    <div className="briefing-fixture">
      <div className="briefing-team"><Crest key={match.homeLogo ?? match.home} name={match.home} logo={match.homeLogo} /><span>{match.home}</span></div>
      <div className="briefing-score"><strong>{center}</strong><span>{status}</span></div>
      <div className="briefing-team"><Crest key={match.awayLogo ?? match.away} name={match.away} logo={match.awayLogo} /><span>{match.away}</span></div>
    </div>
    {match.phase !== "upcoming" && <p className="briefing-reason">{match.reason}</p>}
    {match.id && <button type="button" className="briefing-details" onClick={onOpen} aria-label={`Voir les compositions de ${match.home} contre ${match.away}`}>Les compositions <span aria-hidden="true">↗</span></button>}
  </article>;
}

export default function AiSummaryCard() {
  const [view, setView] = useState<View>("briefing");
  const [visited, setVisited] = useState({ insights: false, chat: false });
  const openView = (next: View) => { setView(next); if (next !== "briefing") setVisited(current => ({ ...current, [next]: true })); };
  const [focus, setFocus] = useState<Focus>("overview");
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [data, setData] = useState<{ focus: Focus; briefing: Briefing } | null>(null);
  const [failed, setFailed] = useState(false);
  const [revision, setRevision] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState<Highlight | null>(null);
  const briefing = data?.focus === focus ? data.briefing : null;

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const response = await fetch(`/api/ai/briefing?focus=${focus}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json() as Briefing;
        if (!Array.isArray(result.highlights)) throw new Error("Briefing indisponible");
        if (!controller.signal.aborted) { setData({ focus, briefing: result }); setFailed(false); }
      } catch { if (!controller.signal.aborted) setFailed(true); }
      if (!controller.signal.aborted) timer = setTimeout(load, 60_000);
    };
    void load();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [focus, revision]);

  const tabs: { key: Focus; label: string; count?: number }[] = [
    { key: "overview", label: "À la une" }, { key: "live", label: "En direct", count: data?.briefing.liveCount }, { key: "upcoming", label: "À venir", count: data?.briefing.upcomingCount },
  ];
  const updated = briefing?.highlights.length ? new Date(briefing.generatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : null;
  return <>
    <div className="football-assistant">
      <div className="assistant-switcher" role="group" aria-label="Votre espace assistant">{([{ key: "briefing", label: "Briefing" }, { key: "insights", label: "Analyse IA" }, { key: "chat", label: "Chat" }] as const).map(tab => <button key={tab.key} type="button" aria-pressed={view === tab.key} onClick={() => openView(tab.key)}>{tab.label}{tab.key === "chat" && <span aria-hidden="true">✦</span>}</button>)}</div>
      <div hidden={view !== "briefing"}>
    <section className={`briefing${expanded ? " is-expanded" : ""}`} aria-labelledby="briefing-title">
      <header className="briefing-header">
        <div className="briefing-eyebrow"><span className="briefing-mark"><Sparkles /></span><span>LE BRIEFING</span><span className="briefing-edition">LIVEFOOT</span></div>
        <h2 id="briefing-title">{briefing?.headline ?? "Le foot, en un coup d’œil."}</h2>
        <p>{briefing?.description ?? "Les rencontres à suivre et les temps forts du jour."}</p>
        {data && <div className="briefing-metrics"><span><b>{data.briefing.liveCount}</b> en direct</span><span><b>{data.briefing.upcomingCount}</b> à venir</span><span><b>{data.briefing.competitionCount}</b> compétitions</span></div>}
      </header>
      <button className="briefing-mobile-toggle" type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? "Réduire le briefing" : "Ouvrir le briefing"}<span aria-hidden="true">{expanded ? "−" : "+"}</span></button>
      <div className="briefing-tabs" role="group" aria-label="Sélection des matchs du briefing">{tabs.map(tab => <button key={tab.key} type="button" aria-pressed={focus === tab.key} onClick={() => { setFocus(tab.key); setShowAll(false); setFailed(false); }} className={focus === tab.key ? "is-active" : ""}>{tab.label}{tab.count !== undefined && <span>{tab.count}</span>}</button>)}</div>
      <div className="briefing-content" aria-busy={!briefing && !failed}>
        {!briefing && !failed && <div className="briefing-skeleton" role="status" aria-label="Chargement du briefing"><span /><span /><span /></div>}
        {failed && <div className="briefing-notice" role="status"><strong>Le briefing est momentanément indisponible.</strong><p>Vous pouvez toujours consulter les scores en direct.</p><button type="button" onClick={() => { setFailed(false); setRevision(value => value + 1); }}>Réessayer</button></div>}
        {briefing && !failed && (briefing.highlights.length ? briefing.highlights.slice(0, showAll ? 3 : 2).map((match, index) => <HighlightCard key={`${match.id}-${match.home}-${match.away}`} match={match} index={index} asOf={briefing.generatedAt} onOpen={() => setSelectedMatch(match)} />) : <div className="briefing-empty"><span aria-hidden="true">◷</span><strong>{focus === "live" ? "On attend le coup d’envoi." : "Rendez-vous au prochain match."}</strong><p>{focus === "live" ? "Le briefing suivra les rencontres dès leur début." : "Les prochaines affiches apparaîtront ici."}</p>{focus === "live" && <button type="button" onClick={() => { setFocus("upcoming"); }}>Voir les matchs à venir <span aria-hidden="true">→</span></button>}</div>)}
      </div>
      {briefing && !failed && briefing.highlights.length > 2 && <button className="briefing-more" type="button" onClick={() => setShowAll(value => !value)}>{showAll ? "Réduire la sélection" : "Une autre rencontre à suivre"}<span aria-hidden="true">{showAll ? "−" : "+"}</span></button>}
      <div className="briefing-analysis">
        <div className="briefing-analysis-heading"><Sparkles /><strong>Aller plus loin</strong></div>
        <button type="button" className="briefing-analysis-button" onClick={() => openView("insights")}>Analyser les rencontres <span aria-hidden="true">↗</span></button>
        <button type="button" className="assistant-chat-link" onClick={() => openView("chat")}>Une autre question ? <span>Discuter avec l’assistant →</span></button>
      </div>
      <footer className="briefing-footer"><span><i />{updated ? `Actualisé à ${updated}` : "Actualisation automatique"}</span><Link to="/en-direct">Tous les matchs <span aria-hidden="true">→</span></Link></footer>
    </section>
      </div>
      <div hidden={view !== "insights"}>{visited.insights && <AiInsightsPanel key={focus} initialFocus={focus} onChat={() => openView("chat")} />}</div>
      <div hidden={view !== "chat"}>{visited.chat && <GeneralChat />}</div>
    </div>
    {selectedMatch?.id && <LineupModal match={{ id: selectedMatch.id, homeName: selectedMatch.home, awayName: selectedMatch.away }} onClose={() => setSelectedMatch(null)} />}
  </>;
}
