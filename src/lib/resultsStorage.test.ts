import { beforeEach, describe, expect, it } from "vitest";
import { MatchResult } from "@/types/wrestling";
import { loadResults, RESULTS_KEY, saveResults } from "./resultsStorage";

const bout: MatchResult = {
  id: "bout-42", date: "11/16/2026", boutNumber: "42", weightClass: "105G",
  redWrestler: "Red Wrestler", redSchool: "Home", blueWrestler: "Green Wrestler", blueSchool: "Away",
  redScore: 3, blueScore: 0, winner: "Red Wrestler", winType: "Decision", periods: 3,
  events: [{ id: "td-1", team: "red", type: "takedown", points: 3, period: 1, timestamp: 0, label: "Takedown" }],
  syncStatus: "synced",
};

describe("per-device bout history", () => {
  beforeEach(() => localStorage.clear());
  it("restores complete results after saving", () => {
    expect(saveResults([bout])).toBe(true);
    expect(loadResults()).toEqual([bout]);
  });
  it("makes an interrupted send available for manual retry", () => {
    saveResults([{ ...bout, syncStatus: "syncing" }]);
    expect(loadResults()[0].syncStatus).toBe("pending");
  });
  it("returns an empty list for corrupt storage", () => {
    localStorage.setItem(RESULTS_KEY, "invalid json");
    expect(loadResults()).toEqual([]);
  });
});