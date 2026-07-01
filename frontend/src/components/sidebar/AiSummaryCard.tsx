import { useEffect, useState } from "react";

type AiInsightResponse = {
  answer?: string;
  status?: string;
};

export default function AiSummaryCard() {
  const [summary, setSummary] = useState("Chargement du resume IA...");
  const [status, setStatus] = useState<"loading" | "idle" | "error">("loading");

  useEffect(() => {
    const prompt = "Fais un resume ultra court (3 points max) des matchs en direct et des principales affiches a venir.";
    const params = new URLSearchParams({ prompt, maxMatches: "12" });

    const stream = new EventSource(`/api/ai/insights/stream?${params.toString()}`);

    const handleInsight = (evt: MessageEvent) => {
      try {
        const data = JSON.parse(evt.data) as AiInsightResponse;
        const text = data.answer?.trim();
        if (!text) {
          setSummary("Resume IA indisponible pour le moment.");
          setStatus("error");
          return;
        }
        setSummary(text);
        setStatus(data.status === "ok" ? "idle" : "error");
      } catch {
        setSummary("Le resume IA est momentanement indisponible.");
        setStatus("error");
      } finally {
        stream.close();
      }
    };

    const handleError = () => {
      setSummary("Le resume IA est momentanement indisponible.");
      setStatus("error");
      stream.close();
    };

    stream.addEventListener("insight", handleInsight as EventListener);
    stream.onerror = handleError;

    return () => {
      stream.removeEventListener("insight", handleInsight as EventListener);
      stream.close();
    };
  }, []);

  return (
    <div className="sidebar-card">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <h3 className="sidebar-card-title" style={{ margin: 0 }}>Resume IA</h3>
        <span className="sidebar-badge">BETA</span>
      </div>
      <div className="sidebar-highlight">
        <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.5, color: "var(--color-text-secondary)" }}>
          {summary}
        </p>
        {status === "loading" && (
          <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: 4, display: "block" }}>
            Analyse en cours...
          </span>
        )}
      </div>
    </div>
  );
}
