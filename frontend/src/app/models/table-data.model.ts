export interface TableRow {
  rank?: number | string;
  position?: number | string;
  rg?: number | string;
  place?: number | string;
  group?: string;
  team?: { id?: number | string; name?: string };
  club?: { id?: number | string; name?: string };
  teamName?: string;
  name?: string;
  points?: number | string;
  pts?: number | string;
  all?: { played?: number | string; goals?: { for?: number | string; against?: number | string } };
  played?: number | string;
  matches?: number | string;
  playedGames?: number | string;
  goal_diff?: number | string;
  goalDiff?: number | string;
  goalsDiff?: number | string;
  goals?: { for?: number | string; against?: number | string };
}

export interface TableDisplayRow {
  rank: string;
  team: string;
  points: string;
  played: string;
  diff: string;
}
