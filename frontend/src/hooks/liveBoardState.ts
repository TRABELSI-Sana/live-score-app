import { createContext } from "react";
import type { MatchState } from "./useLiveBoard";

export type LiveBoardState = {
  matches: MatchState[];
  connected: boolean;
  grouped: Array<{ comp: { id?: string; name: string; country?: string }; list: MatchState[] }>;
};

export const LiveBoardContext = createContext<LiveBoardState | null>(null);
