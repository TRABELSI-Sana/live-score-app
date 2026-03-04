import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LiveBoardApp from "./App";
import GuidesIndexPage from "./pages/GuidesIndexPage";
import GuidePage from "./pages/GuidePage";
import ArticlesIndexPage from "./pages/ArticlesIndexPage";
import ArticlePage from "./pages/ArticlePage";
import TeamsIndexPage from "./pages/TeamsIndexPage";
import TeamPage from "./pages/TeamPage";
import CompetitionsIndexPage from "./pages/CompetitionsIndexPage";
import CompetitionPage from "./pages/CompetitionPage";

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LiveBoardApp />} />
        <Route path="/guides" element={<GuidesIndexPage />} />
        <Route path="/guides/:slug" element={<GuidePage />} />
        <Route path="/news" element={<ArticlesIndexPage />} />
        <Route path="/news/:slug" element={<ArticlePage />} />
        <Route path="/teams" element={<TeamsIndexPage />} />
        <Route path="/teams/:slug" element={<TeamPage />} />
        <Route path="/competitions" element={<CompetitionsIndexPage />} />
        <Route path="/competitions/:slug" element={<CompetitionPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
