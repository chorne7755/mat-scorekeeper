import { useState } from "react";
import MatchSetupForm from "@/components/MatchSetupForm";
import MatchScorer from "@/components/MatchScorer";
import MatchResults from "@/components/MatchResults";
import { MatchSetup, MatchResult } from "@/types/wrestling";
import { syncMatch, loadAutoSync } from "@/lib/sheetsSync";
import { toast } from "sonner";

type Screen = "setup" | "scoring" | "results";

export default function Index() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [currentSetup, setCurrentSetup] = useState<MatchSetup | null>(null);
  const [results, setResults] = useState<MatchResult[]>([]);

  const handleStart = (setup: MatchSetup) => {
    setCurrentSetup(setup);
    setScreen("scoring");
  };

  const update = (id: string, patch: Partial<MatchResult>) =>
    setResults((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const handleSync = async (r: MatchResult) => {
    update(r.id, { syncStatus: "syncing" });
    const res = await syncMatch(r);
    update(r.id, { syncStatus: res.ok ? "synced" : "pending", syncMessage: res.message });
    if (res.ok) toast.success(`Sent to Google Sheet: ${res.message}`);
    else toast.error(`Not sent yet: ${res.message}`);
  };

  const handleComplete = (result: MatchResult) => {
    const r = { ...result, syncStatus: "pending" as const };
    setResults((prev) => [...prev, r]);
    setScreen("results");
    if (loadAutoSync()) handleSync(r);
  };

  const handleNewMatch = () => {
    setCurrentSetup(null);
    setScreen("setup");
  };

  return (
    <div className="min-h-screen bg-background">
      {screen === "setup" && (
        <MatchSetupForm onStart={handleStart} matchCount={results.length} />
      )}
      {screen === "scoring" && currentSetup && (
        <MatchScorer
          setup={currentSetup}
          onComplete={handleComplete}
          onCancel={() => setScreen(results.length > 0 ? "results" : "setup")}
        />
      )}
      {screen === "results" && (
        <MatchResults results={results} onNewMatch={handleNewMatch} onSync={handleSync} />
      )}
    </div>
  );
}
