import { useOutletContext } from "react-router-dom";
import HeroSection from "../components/home/HeroSection";
import LiveBoard from "../components/live/LiveBoard";
import EditorialPreview from "../components/home/EditorialPreview";
import GuidesPreview from "../components/home/GuidesPreview";
import Sidebar from "../components/sidebar/Sidebar";
import AdSlot from "../components/ads/AdSlot";

export default function HomePage() {
  const { searchTerm } = useOutletContext<{ searchTerm: string }>();

  return (
    <div className="site-container">
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
