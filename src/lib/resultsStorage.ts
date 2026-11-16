import { MatchResult } from "@/types/wrestling";

export const RESULTS_KEY = "mat-scorekeeper-results";

function isMatchResult(value: unknown): value is MatchResult {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return ["id", "date", "weightClass", "redWrestler", "redSchool", "blueWrestler", "blueSchool", "winner", "winType"]
    .every((key) => typeof r[key] === "string") &&
    ["redScore", "blueScore", "periods"].every((key) => typeof r[key] === "number") &&
    Array.isArray(r.events) && r.events.every((event) => event && typeof event === "object" &&
      typeof event.id === "string" && typeof event.label === "string" &&
      typeof event.points === "number" && typeof event.period === "number" &&
      typeof event.timestamp === "number" && (event.team === "red" || event.team === "blue"));
}

export function loadResults(): MatchResult[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter(isMatchResult).map((r) => ({
      ...r,
      // An interrupted send is not a confirmed success; allow a manual retry.
      syncStatus: r.syncStatus === "synced" ? "synced" : "pending",
    }));
  } catch {
    return [];
  }
}

export function saveResults(results: MatchResult[]): boolean {
  try {
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
    return true;
  } catch {
    return false;
  }
}