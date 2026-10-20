import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import LivePage from "./pages/LivePage";

const GuidesIndexPage = lazy(() => import("./pages/GuidesIndexPage"));
const GuidePage = lazy(() => import("./pages/GuidePage"));
const ArticlesIndexPage = lazy(() => import("./pages/ArticlesIndexPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const TeamsIndexPage = lazy(() => import("./pages/TeamsIndexPage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));
const CompetitionsIndexPage = lazy(() => import("./pages/CompetitionsIndexPage"));
const CompetitionPage = lazy(() => import("./pages/CompetitionPage"));

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="liveboard-empty"><p>Chargement...</p></div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/en-direct" element={<LivePage />} />
            <Route path="/guides" element={<GuidesIndexPage />} />
            <Route path="/guides/:slug" element={<GuidePage />} />
            <Route path="/news" element={<ArticlesIndexPage />} />
            <Route path="/news/:slug" element={<ArticlePage />} />
            <Route path="/teams" element={<TeamsIndexPage />} />
            <Route path="/teams/:slug" element={<TeamPage />} />
            <Route path="/competitions" element={<CompetitionsIndexPage />} />
            <Route path="/competitions/:slug" element={<CompetitionPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
