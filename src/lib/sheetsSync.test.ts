import { describe, it, expect } from "vitest";
import { divisionFor, isWrestlerTab } from "./sheetsSync";

describe("sheet routing", () => {
  it("sends G weights to the girls sheet", () => {
    expect(divisionFor("105G")).toBe("girls");
    expect(divisionFor("185+G")).toBe("girls");
  });
  it("sends plain weights to the boys sheet", () => {
    expect(divisionFor("120")).toBe("boys");
    expect(divisionFor("285")).toBe("boys");
  });
  it("hides season and record tabs from the roster", () => {
    expect(isWrestlerTab("2018-19")).toBe(false);
    expect(isWrestlerTab("Career Records")).toBe(false);
    expect(isWrestlerTab("61")).toBe(false);
    expect(isWrestlerTab("Lucy Cox")).toBe(true);
  });
});
