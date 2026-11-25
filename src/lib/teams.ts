export const DEFAULT_TEAMS = [
  "KAI", "RAM", "STU", "WIE", "NAP", "ROT", "BAU", "SHA", "VIL", "ALC",
  "VIC", "HOH", "SPA", "SIG", "AFN", "LAK", "ANK", "BFA", "ANS", "AVI", "BRU",
];

export const TEAMS_KEY = "mat-scorekeeper-teams";

export const parseTeams = (text: string) =>
  Array.from(new Set(text.split(/[,\n]/).map((team) => team.trim()).filter(Boolean)));

export function loadTeams(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(TEAMS_KEY) || "null");
    if (Array.isArray(saved) && saved.length && saved.every((team) => typeof team === "string")) {
      return saved;
    }
  } catch {
    // Fall back to the team's default list.
  }
  return DEFAULT_TEAMS;
}

export function saveTeams(teams: string[]): boolean {
  try {
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
    return true;
  } catch {
    return false;
  }
}
