import AdSlot from "../ads/AdSlot";
import AiSummaryCard from "./AiSummaryCard";
import QuickLinksCard from "./QuickLinksCard";

export default function Sidebar() {
  return <aside className="page-sidebar">
    <AiSummaryCard />
    <AdSlot variant="sidebar" slot="8567185183" />
    <QuickLinksCard />
    <AdSlot variant="sidebar" slot="8567185183" />
  </aside>;
}
