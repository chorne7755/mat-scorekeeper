import { describe, it, expect, beforeEach } from "vitest";
import { checkPasscode, isUnlocked, rememberUnlock, lock } from "./passcode";

describe("team passcode", () => {
  beforeEach(() => localStorage.clear());
  it("accepts Ram1980", async () => expect(await checkPasscode("Ram1980")).toBe(true));
  it("rejects wrong codes", async () => expect(await checkPasscode("ram1980")).toBe(false));
  it("stays unlocked then expires after 12 hours", () => {
    rememberUnlock(0);
    expect(isUnlocked(11 * 3600_000)).toBe(true);
    expect(isUnlocked(13 * 3600_000)).toBe(false);
  });
  it("lock clears access", () => { rememberUnlock(); lock(); expect(isUnlocked()).toBe(false); });
});
