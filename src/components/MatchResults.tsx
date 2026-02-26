import { useState } from "react";
import { MatchResult } from "@/types/wrestling";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import * as XLSX from "xlsx";

interface Props {
  results: MatchResult[];
  onNewMatch: () => void;
}

export default function MatchResults({ results, onNewMatch }: Props) {
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  const exportToExcel = () => {
    const rows = results.map((r) => {
      const redTakedowns = r.events.filter((ev) => ev.team === "red" && ev.type === "takedown").length;
      const greenTakedowns = r.events.filter((ev) => ev.team === "blue" && ev.type === "takedown").length;
      return {
        Date: r.date,
        "Weight Class": `${r.weightClass} lbs`,
        "Red Wrestler": r.redWrestler,
        "Red School": r.redSchool || "-",
        "Red Score": r.redScore,
        "Green Wrestler": r.blueWrestler,
        "Green School": r.blueSchool || "-",
        "Green Score": r.blueScore,
        "Red Takedowns": redTakedowns,
        "Green Takedowns": greenTakedowns,
        Winner: r.winner,
        "Win Type": r.winType,
        Periods: r.periods,
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);

    // Column widths
    ws["!cols"] = [
      { wch: 12 }, { wch: 14 }, { wch: 20 }, { wch: 20 },
      { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 10 },
      { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 8 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Match Results");

    // Detailed event log sheet
    const eventRows: Record<string, unknown>[] = [];
    results.forEach((r) => {
      r.events.forEach((ev) => {
        eventRows.push({
          "Match ID": r.id.slice(0, 8),
          "Weight Class": `${r.weightClass} lbs`,
          "Red Wrestler": r.redWrestler,
          "Green Wrestler": r.blueWrestler,
          Period: ev.period,
          "Time (mm:ss)": `${Math.floor(ev.timestamp / 60).toString().padStart(2, "0")}:${(ev.timestamp % 60).toString().padStart(2, "0")}`,
          Team: ev.team === "red" ? r.redWrestler : r.blueWrestler,
          "Scoring Action": ev.label,
          Points: ev.points,
        });
      });
    });

    if (eventRows.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(eventRows);
      ws2["!cols"] = [
        { wch: 10 }, { wch: 14 }, { wch: 20 }, { wch: 20 },
        { wch: 8 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 8 },
      ];
      XLSX.utils.book_append_sheet(wb, ws2, "Scoring Log");
    }

    XLSX.writeFile(wb, `wrestling-results-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-3xl text-foreground uppercase tracking-wide">
            Match <span className="text-primary">Results</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">{results.length} match{results.length !== 1 ? "es" : ""} recorded</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={exportToExcel}
            disabled={results.length === 0}
            className="font-display uppercase tracking-wider bg-score-takedown text-foreground hover:brightness-110 border-0"
          >
            📊 Export to Excel
          </Button>
          <Button
            onClick={onNewMatch}
            className="font-display uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 gold-glow"
          >
            + New Match
          </Button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="scoreboard-panel p-12 text-center">
          <div className="text-6xl mb-4">🤼</div>
          <div className="font-display text-xl text-muted-foreground uppercase tracking-wide">No matches recorded yet</div>
          <p className="text-muted-foreground text-sm mt-2">Start a new match to begin scoring</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...results].reverse().map((r) => {
            const redWon = r.redScore > r.blueScore;
            const greenWon = r.blueScore > r.redScore;
            return (
              <div
                key={r.id}
                className="scoreboard-panel p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer hover:ring-1 hover:ring-primary/50 transition-all"
                onClick={() => setSelectedMatch(r)}
              >
                {/* Date & weight */}
                <div className="md:w-32 shrink-0 text-center">
                  <div className="font-display text-primary text-lg">{r.weightClass}<span className="text-xs text-muted-foreground ml-1">lbs</span></div>
                  <div className="text-muted-foreground text-xs">{r.date}</div>
                </div>

                {/* Red side */}
                <div className={`flex-1 text-right pr-4 ${redWon ? "opacity-100" : "opacity-70"}`}>
                  <div className={`font-display text-lg uppercase ${redWon ? "text-team-red" : "text-foreground"}`}>
                    {r.redWrestler} {redWon && "🏆"}
                  </div>
                  {r.redSchool && <div className="text-muted-foreground text-xs">{r.redSchool}</div>}
                </div>

                {/* Score */}
                <div className="flex items-center gap-3 shrink-0 justify-center">
                  <span className={`font-display text-4xl font-bold ${redWon ? "text-team-red" : "text-muted-foreground"}`}>{r.redScore}</span>
                  <span className="text-muted-foreground font-display text-xl">—</span>
                  <span className={`font-display text-4xl font-bold ${greenWon ? "text-team-green" : "text-muted-foreground"}`}>{r.blueScore}</span>
                </div>

                {/* Green side */}
                <div className={`flex-1 pl-4 ${greenWon ? "opacity-100" : "opacity-70"}`}>
                  <div className={`font-display text-lg uppercase ${greenWon ? "text-team-green" : "text-foreground"}`}>
                    {greenWon && "🏆"} {r.blueWrestler}
                  </div>
                  {r.blueSchool && <div className="text-muted-foreground text-xs">{r.blueSchool}</div>}
                </div>

                {/* Win type */}
                <div className="md:w-32 shrink-0 text-center">
                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider bg-muted text-muted-foreground">
                    {r.winType}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Match Detail Dialog */}
      <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && setSelectedMatch(null)}>
        <DialogContent className="max-w-lg bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wide text-foreground">
              Match Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedMatch?.weightClass} lbs — {selectedMatch?.date}
            </DialogDescription>
          </DialogHeader>

          {selectedMatch && (
            <div className="space-y-4">
              {/* Wrestlers & Score */}
              <div className="flex items-center justify-between gap-4 p-3 rounded bg-muted/30">
                <div className="text-center flex-1">
                  <div className="font-display text-sm uppercase text-team-red">{selectedMatch.redWrestler}</div>
                  {selectedMatch.redSchool && <div className="text-muted-foreground text-xs">{selectedMatch.redSchool}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-display text-3xl font-bold text-team-red">{selectedMatch.redScore}</span>
                  <span className="text-muted-foreground">—</span>
                  <span className="font-display text-3xl font-bold text-team-green">{selectedMatch.blueScore}</span>
                </div>
                <div className="text-center flex-1">
                  <div className="font-display text-sm uppercase text-team-green">{selectedMatch.blueWrestler}</div>
                  {selectedMatch.blueSchool && <div className="text-muted-foreground text-xs">{selectedMatch.blueSchool}</div>}
                </div>
              </div>

              {/* Winner & Win Type */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Winner</span>
                <span className="font-display uppercase text-primary">{selectedMatch.winner} 🏆</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Win Type</span>
                <span className="font-semibold uppercase text-foreground">{selectedMatch.winType}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Periods</span>
                <span className="text-foreground">{selectedMatch.periods}</span>
              </div>

              {/* Scoring Log */}
              {selectedMatch.events.length > 0 && (
                <div>
                  <h4 className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-2">Scoring Log</h4>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {selectedMatch.events.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between text-xs p-2 rounded bg-muted/20"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`font-display uppercase ${ev.team === "red" ? "text-team-red" : "text-team-green"}`}>
                            {ev.team === "red" ? selectedMatch.redWrestler : selectedMatch.blueWrestler}
                          </span>
                          <span className="text-muted-foreground">P{ev.period}</span>
                          <span className="text-muted-foreground">{formatTime(ev.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">{ev.label}</span>
                          {ev.points !== 0 && (
                            <span className="font-bold text-primary">+{ev.points}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
