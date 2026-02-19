import { useState } from "react";
import MatchSetupForm from "@/components/MatchSetupForm";
import MatchScorer from "@/components/MatchScorer";
import MatchResults from "@/components/MatchResults";
import { MatchSetup, MatchResult } from "@/types/wrestling";

type Screen = "setup" | "scoring" | "results";

export default function Index() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [currentSetup, setCurrentSetup] = useState<MatchSetup | null>(null);
  const [results, setResults] = useState<MatchResult[]>([]);

  const handleStart = (setup: MatchSetup) => {
    setCurrentSetup(setup);
    setScreen("scoring");
  };

  const handleComplete = (result: MatchResult) => {
    setResults((prev) => [...prev, result]);
    setScreen("results");
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
        <MatchResults results={results} onNewMatch={handleNewMatch} />
      )}
    </div>
  );
}
