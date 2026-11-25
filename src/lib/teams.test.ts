import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_TEAMS, loadTeams, parseTeams, saveTeams, TEAMS_KEY } from "./teams";

describe("editable team list", () => {
  beforeEach(() => localStorage.clear());

  it("provides the 21 requested school abbreviations", () => {
    expect(loadTeams()).toEqual(["KAI", "RAM", "STU", "WIE", "NAP", "ROT", "BAU", "SHA", "VIL", "ALC", "VIC", "HOH", "SPA", "SIG", "AFN", "LAK", "ANK", "BFA", "ANS", "AVI", "BRU"]);
    expect(DEFAULT_TEAMS).toHaveLength(21);
  });

  it("saves a custom list across reloads", () => {
    const teams = parseTeams("RAM, KAI\nGUEST, RAM");
    expect(saveTeams(teams)).toBe(true);
    expect(loadTeams()).toEqual(["RAM", "KAI", "GUEST"]);
  });

  it("uses defaults when saved teams are invalid", () => {
    localStorage.setItem(TEAMS_KEY, "not json");
    expect(loadTeams()).toEqual(DEFAULT_TEAMS);
  });
});
