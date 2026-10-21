export interface LineupPlayer {
  name: string;
  number?: string;
  grid?: string;
}

export interface TeamLineup {
  teamName: string;
  formation?: string;
  players: LineupPlayer[];
}

export interface ParsedLineups {
  home?: TeamLineup;
  away?: TeamLineup;
}
