export type ScoringEvent = {
  id: string;
  team: "red" | "blue";
  type: "takedown" | "escape" | "reversal" | "nearfall2" | "nearfall3" | "penalty" | "undo";
  points: number;
  period: number;
  timestamp: number;
  label: string;
};

export type MatchResult = {
  id: string;
  date: string;
  weightClass: string;
  redWrestler: string;
  redSchool: string;
  blueWrestler: string;
  blueSchool: string;
  redScore: number;
  blueScore: number;
  winner: string;
  winType: string;
  periods: number;
  events: ScoringEvent[];
};

export type MatchSetup = {
  weightClass: string;
  redWrestler: string;
  redSchool: string;
  blueWrestler: string;
  blueSchool: string;
};
