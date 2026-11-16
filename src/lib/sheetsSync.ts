import { MatchResult } from "@/types/wrestling";

export type Division = "boys" | "girls";

export const DEFAULT_SHEET_URLS: Record<Division, string> = {
  boys: "https://script.google.com/macros/s/AKfycbxWqGU3Tzm1lin0KVPdndOJupx8DlWRvylypGlPArAAX3T8sISS3qh1P-5Fi9NwLG5A/exec",
  girls: "https://script.google.com/macros/s/AKfycbzOFPSnKkXkVMQsl7kDavadYURk1Rk1va7bbD-_iEM7Zd2svJgSRfzGCFshK-jVNLf0Yg/exec",
};

const URLS_KEY = "mat-scorekeeper-sheet-urls";
const ROSTER_KEY = "mat-scorekeeper-rosters";
const AUTOSYNC_KEY = "mat-scorekeeper-autosync";
const PREVIOUS_BOYS_URL = "https://script.google.com/macros/s/AKfycbztHGl-dlqtgtaBLN3vtUHJUJJf8LF1R-Or4ne4QqSVdI0qlN-8vw61AwbxwNjvNRKNBQ/exec";

/** Any weight class containing a "G" belongs to the girls' sheet. */
export const divisionFor = (weightClass: string): Division =>
  /g/i.test(weightClass) ? "girls" : "boys";

/** Tabs that are not wrestlers (season tabs, record boards, numbered tabs). */
export const isWrestlerTab = (name: string) =>
  /[a-z]/i.test(name) && !/^\d{4}-\d{2}$/.test(name) &&
  !["points", "master", "template", "unmatched", "summary", "career records"].includes(name.toLowerCase());

export const loadUrls = (): Record<Division, string> => {
  try {
    const urls = { ...DEFAULT_SHEET_URLS, ...JSON.parse(localStorage.getItem(URLS_KEY) || "{}") };
    if (urls.boys === PREVIOUS_BOYS_URL) urls.boys = DEFAULT_SHEET_URLS.boys;
    return urls;
  }
  catch { return DEFAULT_SHEET_URLS; }
};
export const saveUrls = (u: Record<Division, string>) => localStorage.setItem(URLS_KEY, JSON.stringify(u));

export const loadAutoSync = () => localStorage.getItem(AUTOSYNC_KEY) !== "false";
export const saveAutoSync = (v: boolean) => localStorage.setItem(AUTOSYNC_KEY, String(v));

export const loadRosters = (): Record<Division, string[]> => {
  try { return { boys: [], girls: [], ...JSON.parse(localStorage.getItem(ROSTER_KEY) || "{}") }; }
  catch { return { boys: [], girls: [] }; }
};

export async function fetchRosters(): Promise<Record<Division, string[]>> {
  const urls = loadUrls();
  const out = loadRosters();
  for (const d of ["boys", "girls"] as Division[]) {
    if (!urls[d]) continue;
    try {
      const res = await fetch(urls[d]);
      const json = await res.json();
      if (json.success) out[d] = (json.wrestlers as string[]).filter(isWrestlerTab);
    } catch { /* keep cached roster */ }
  }
  localStorage.setItem(ROSTER_KEY, JSON.stringify(out));
  return out;
}

export function buildPayload(r: MatchResult) {
  const count = (team: string) => r.events.filter((e) => e.team === team && e.type === "takedown").length;
  return {
    date: new Date().toISOString(),
    boutNumber: r.boutNumber || "",
    weightClass: r.weightClass,
    redWrestler: r.redWrestler,
    redSchool: r.redSchool,
    redScore: r.redScore,
    greenWrestler: r.blueWrestler,
    greenSchool: r.blueSchool,
    greenScore: r.blueScore,
    winner: r.winner === r.redWrestler ? "red" : r.winner === r.blueWrestler ? "green" : "draw",
    winType: r.winType,
    redTakedowns: count("red"),
    greenTakedowns: count("blue"),
  };
}

export async function syncMatch(r: MatchResult): Promise<{ ok: boolean; message: string }> {
  const division = divisionFor(r.weightClass);
  const url = loadUrls()[division];
  if (!url) return { ok: false, message: `No ${division} sheet link set` };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(buildPayload(r)),
    });
    const json = await res.json();
    return { ok: !!json.success, message: json.message || json.error || "" };
  } catch {
    return { ok: false, message: "Could not reach Google Sheets" };
  }
}
