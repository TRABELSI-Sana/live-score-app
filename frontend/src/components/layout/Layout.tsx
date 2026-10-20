import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AdSlot from "../ads/AdSlot";
import CookieConsent from "../CookieConsent";
import { LiveBoardProvider } from "../../hooks/LiveBoardContext";

export default function Layout() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <LiveBoardProvider>
      <div className="site-wrapper">
        <Navbar searchTerm={searchTerm} onSearch={setSearchTerm} />
        <AdSlot variant="leaderboard" slot="8567185183" />
        <main>
          <Outlet context={{ searchTerm }} />
        </main>
        <AdSlot variant="leaderboard" slot="8567185183" />
        <Footer />
        <CookieConsent />
      </div>
    </LiveBoardProvider>
  );
}
