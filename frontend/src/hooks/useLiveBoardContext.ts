import { useContext } from "react";
import { LiveBoardContext } from "./liveBoardState";

export function useLiveBoardContext() {
  const ctx = useContext(LiveBoardContext);
  if (!ctx) throw new Error("useLiveBoardContext must be used within LiveBoardProvider");
  return ctx;
}
