import { useOutletContext } from "react-router-dom";
import LiveBoard from "../components/live/LiveBoard";
import Sidebar from "../components/sidebar/Sidebar";
import Seo from "../components/Seo";

export default function LivePage() {
  const { searchTerm } = useOutletContext<{ searchTerm: string }>();

  return (
    <div className="site-container">
      <Seo
        title="Matchs en direct"
        description="Tous les matchs de football en direct aujourd'hui. Scores, buts, cartons et evenements mis a jour toutes les 60 secondes."
        path="/en-direct"
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
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
