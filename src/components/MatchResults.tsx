import { MatchResult } from "@/types/wrestling";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

interface Props {
  results: MatchResult[];
  onNewMatch: () => void;
}

export default function MatchResults({ results, onNewMatch }: Props) {
  const exportToExcel = () => {
    const rows = results.map((r) => ({
      Date: r.date,
      "Weight Class": `${r.weightClass} lbs`,
      "Red Wrestler": r.redWrestler,
      "Red School": r.redSchool || "-",
      "Red Score": r.redScore,
      "Blue Wrestler": r.blueWrestler,
      "Blue School": r.blueSchool || "-",
      "Blue Score": r.blueScore,
      Winner: r.winner,
      "Win Type": r.winType,
      Periods: r.periods,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    // Column widths
    ws["!cols"] = [
      { wch: 12 }, { wch: 14 }, { wch: 20 }, { wch: 20 },
      { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 10 },
      { wch: 22 }, { wch: 18 }, { wch: 8 },
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
          "Blue Wrestler": r.blueWrestler,
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
            const blueWon = r.blueScore > r.redScore;
            return (
              <div key={r.id} className="scoreboard-panel p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
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
                  <span className={`font-display text-4xl font-bold ${blueWon ? "text-team-blue" : "text-muted-foreground"}`}>{r.blueScore}</span>
                </div>

                {/* Blue side */}
                <div className={`flex-1 pl-4 ${blueWon ? "opacity-100" : "opacity-70"}`}>
                  <div className={`font-display text-lg uppercase ${blueWon ? "text-team-blue" : "text-foreground"}`}>
                    {blueWon && "🏆"} {r.blueWrestler}
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
    </div>
  );
}
