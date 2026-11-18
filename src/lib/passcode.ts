// SHA-256 of the team passcode; the plain code never appears in the site files.
export const PASSCODE_HASH = "979e27905d92c8e0d2e04c121a7cc31560cb3d96e360566a2c24554591cfb018";
const UNLOCK_KEY = "mat-scorekeeper-unlocked-until";
export const UNLOCK_HOURS = 12;

export async function hashCode(code: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code.trim()));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function checkPasscode(code: string): Promise<boolean> {
  return (await hashCode(code)) === PASSCODE_HASH;
}

export function isUnlocked(now = Date.now()): boolean {
  const until = Number(localStorage.getItem(UNLOCK_KEY) || 0);
  return until > now;
}

export function rememberUnlock(now = Date.now()) {
  localStorage.setItem(UNLOCK_KEY, String(now + UNLOCK_HOURS * 3600_000));
}

export function lock() {
  localStorage.removeItem(UNLOCK_KEY);
}
