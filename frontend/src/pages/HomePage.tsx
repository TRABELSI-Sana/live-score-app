import { useOutletContext } from "react-router-dom";
import HeroSection from "../components/home/HeroSection";
import LiveBoard from "../components/live/LiveBoard";
import EditorialPreview from "../components/home/EditorialPreview";
import GuidesPreview from "../components/home/GuidesPreview";
import Sidebar from "../components/sidebar/Sidebar";
import AdSlot from "../components/ads/AdSlot";
import Seo from "../components/Seo";
import { getSiteBase } from "../utils/siteBase";

export default function HomePage() {
  const { searchTerm } = useOutletContext<{ searchTerm: string }>();
  const siteBase = getSiteBase();

  return (
    <div className="site-container">
      <Seo
        title="Scores en direct de football"
        description="Suivez tous les scores de football en direct : Ligue 1, Premier League, Liga, Serie A, Champions League. Resultats, buts et evenements en temps reel."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "LiveFoot",
          url: `${siteBase}/`,
          inLanguage: "fr",
          description: "Scores en direct de football, resultats et evenements cles des matchs.",
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteBase}/?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <HeroSection />

      <div className="page-grid">
        <div className="page-main">
          <LiveBoard searchTerm={searchTerm} maxGroups={6} />

          <AdSlot variant="in-feed" slot="8567185183" />

          <EditorialPreview />

          <AdSlot variant="in-feed" slot="8567185183" />

          <GuidesPreview />
        </div>

        <Sidebar />
      </div>
    </div>
  );
}
