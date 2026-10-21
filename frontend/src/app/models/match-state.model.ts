export interface MatchEvent {
  id?: string;
  event?: string;
  time?: string;
  player?: string;
  home_away?: string;
  homeAway?: string;
  match_id?: string;
  ts?: string;
}

export interface MatchState {
  id?: number;
  scheduled?: string;
  status?: string;
  time?: string;
  competition?: { id?: number; name?: string; country?: string };
  stage?: { id?: number; name?: string; group?: string };
  group?: { id?: number; name?: string };
  round?: { id?: number; name?: string; group?: string };
  groupName?: string;
  home?: { id?: number; name?: string; logo?: string };
  away?: { id?: number; name?: string; logo?: string };
  scores?: { score?: string };
  lastEvents?: MatchEvent[];
}

export interface CompetitionGroup {
  comp: { id?: string; name: string; country?: string };
  list: MatchState[];
}
