import { beforeEach, describe, it, expect } from "vitest";
import { DEFAULT_SHEET_URLS, divisionFor, isWrestlerTab, loadUrls, saveUrls } from "./sheetsSync";

describe("sheet link updates", () => {
  beforeEach(() => localStorage.clear());
  const boys = "https://script.google.com/macros/s/AKfycbxWqGU3Tzm1lin0KVPdndOJupx8DlWRvylypGlPArAAX3T8sISS3qh1P-5Fi9NwLG5A/exec";

  it("uses the updated Boys link on a new device", () => {
    expect(loadUrls().boys).toBe(boys);
  });
  it("updates a previously saved default Boys link and keeps the Girls link", () => {
    saveUrls({ ...DEFAULT_SHEET_URLS, boys: "https://script.google.com/macros/s/AKfycbztHGl-dlqtgtaBLN3vtUHJUJJf8LF1R-Or4ne4QqSVdI0qlN-8vw61AwbxwNjvNRKNBQ/exec" });
    expect(loadUrls()).toEqual({ boys, girls: DEFAULT_SHEET_URLS.girls });
  });
  it("preserves custom links", () => {
    saveUrls({ boys: "https://example.com/boys", girls: "https://example.com/girls" });
    expect(loadUrls()).toEqual({ boys: "https://example.com/boys", girls: "https://example.com/girls" });
  });
});

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
