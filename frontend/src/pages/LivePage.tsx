import { useOutletContext } from "react-router-dom";
import LiveBoard from "../components/live/LiveBoard";
import Sidebar from "../components/sidebar/Sidebar";
import Seo from "../components/Seo";
import SeoFaqSection from "../components/SeoFaqSection";
import { liveFaqs } from "../content/seoFaqs";
import { faqSchema } from "../utils/seoSchemas";
import { getSiteBase } from "../utils/siteBase";

export default function LivePage() {
  const { searchTerm } = useOutletContext<{ searchTerm: string }>();
  const siteBase = getSiteBase();

  return (
    <div className="site-container">
      <Seo
        title="Matchs en direct"
        description="Tous les matchs de football en direct aujourd'hui. Scores, buts, cartons et evenements mis a jour toutes les 60 secondes."
        path="/en-direct"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Matchs de football en direct",
            url: `${siteBase}/en-direct`,
            inLanguage: "fr",
            description: "Scores, statuts et evenements des matchs de football en direct.",
          },
          faqSchema(liveFaqs),
        ]}
      />
      <div className="content-page-header">
        <h1 className="content-page-title">Matchs en direct</h1>
        <p className="content-page-desc">
          Tous les scores de football en temps reel. Mis a jour toutes les 60 secondes.
        </p>
      </div>

      <div className="page-grid">
        <div className="page-main">
          <LiveBoard searchTerm={searchTerm} />
          <SeoFaqSection faqs={liveFaqs} />
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
