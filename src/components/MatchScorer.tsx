import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScoringEvent, MatchSetup, MatchResult } from "@/types/wrestling";

// Simple uuid fallback
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

interface ScoreBtnProps {
  label: string;
  points: number;
  colorClass: string;
  onClick: () => void;
}

function ScoreButton({ label, points, colorClass, onClick }: ScoreBtnProps) {
  return (
    <button
      onClick={onClick}
      className={`score-btn flex flex-col items-center justify-center rounded-lg p-3 text-foreground border border-white/10 ${colorClass} hover:brightness-110 active:scale-95 w-full`}
    >
      <span className="font-display text-2xl leading-none font-bold">{points > 0 ? `+${points}` : points}</span>
      <span className="text-xs uppercase tracking-wider mt-1 opacity-90">{label}</span>
    </button>
  );
}

interface TeamPanelProps {
  name: string;
  school: string;
  score: number;
  side: "red" | "blue";
  onScore: (type: ScoringEvent["type"], points: number, label: string) => void;
}

function TeamPanel({ name, school, score, side, onScore }: TeamPanelProps) {
  const isRed = side === "red";
  const borderColor = isRed ? "border-team-red/50" : "border-team-blue/50";
  const bgGlow = isRed ? "team-red-panel" : "team-blue-panel";
  const scoreColor = isRed ? "text-team-red" : "text-team-blue";
  const labelColor = isRed ? "text-team-red" : "text-team-blue";
  const btnBg = isRed
    ? {
        takedown: "bg-score-takedown/80",
        escape: "bg-score-escape/80",
        reversal: "bg-score-reversal/80",
        nearfall2: "bg-score-nearfall/80",
        nearfall3: "bg-score-nearfall/90",
        penalty: "bg-score-penalty/80",
      }
    : {
        takedown: "bg-score-takedown/80",
        escape: "bg-score-escape/80",
        reversal: "bg-score-reversal/80",
        nearfall2: "bg-score-nearfall/80",
        nearfall3: "bg-score-nearfall/90",
        penalty: "bg-score-penalty/80",
      };

  return (
    <div className={`scoreboard-panel ${bgGlow} border ${borderColor} p-4 flex flex-col gap-4`}>
      {/* Name & Score */}
      <div className="text-center">
        <div className={`font-display text-xs uppercase tracking-[0.2em] ${labelColor} mb-1`}>
          {isRed ? "🔴" : "🔵"} {school || (isRed ? "Red Corner" : "Blue Corner")}
        </div>
        <div className="font-display text-xl truncate text-foreground">{name}</div>
        <div className={`font-display text-7xl md:text-8xl font-bold leading-none mt-2 ${scoreColor}`} style={{ textShadow: isRed ? "0 0 30px hsl(5,85%,55%,0.6)" : "0 0 30px hsl(214,80%,52%,0.6)" }}>
          {score}
        </div>
      </div>

      {/* Scoring buttons */}
      <div className="grid grid-cols-2 gap-2">
        <ScoreButton label="Takedown" points={3} colorClass={btnBg.takedown} onClick={() => onScore("takedown", 3, "Takedown")} />
        <ScoreButton label="Escape" points={1} colorClass={btnBg.escape} onClick={() => onScore("escape", 1, "Escape")} />
        <ScoreButton label="Reversal" points={2} colorClass={btnBg.reversal} onClick={() => onScore("reversal", 2, "Reversal")} />
        <ScoreButton label="Near Fall" points={2} colorClass={btnBg.nearfall2} onClick={() => onScore("nearfall2", 2, "Near Fall (2)")} />
        <ScoreButton label="Near Fall" points={3} colorClass={btnBg.nearfall3} onClick={() => onScore("nearfall3", 3, "Near Fall (3)")} />
        <ScoreButton label="Near Fall" points={4} colorClass={btnBg.nearfall3} onClick={() => onScore("nearfall3", 4, "Near Fall (4)")} />
        <ScoreButton label="Penalty" points={1} colorClass={btnBg.penalty} onClick={() => onScore("penalty", 1, "Penalty")} />
        <ScoreButton label="+1 Pt" points={1} colorClass="bg-secondary/80" onClick={() => onScore("escape", 1, "+1 Point")} />
        <ScoreButton label="-1 Pt" points={-1} colorClass="bg-score-penalty/60" onClick={() => onScore("penalty", -1, "-1 Point")} />
      </div>
    </div>
  );
}

interface Props {
  setup: MatchSetup;
  onComplete: (result: MatchResult) => void;
  onCancel: () => void;
}

export default function MatchScorer({ setup, onComplete, onCancel }: Props) {
  const [period, setPeriod] = useState(1);
  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);
  const [events, setEvents] = useState<ScoringEvent[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  // Timer
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const addScore = useCallback((team: "red" | "blue", type: ScoringEvent["type"], points: number, label: string) => {
    const event: ScoringEvent = { id: uid(), team, type, points, period, timestamp: seconds, label };
    setEvents((prev) => [...prev, event]);
    if (team === "red") setRedScore((s) => Math.max(0, s + points));
    else setBlueScore((s) => Math.max(0, s + points));
  }, [period, seconds]);

  const undo = () => {
    setEvents((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last.team === "red") setRedScore((s) => Math.max(0, s - last.points));
      else setBlueScore((s) => Math.max(0, s - last.points));
      return prev.slice(0, -1);
    });
  };

  const determineWinType = () => {
    const diff = Math.abs(redScore - blueScore);
    if (diff >= 15) return "Technical Fall";
    if (diff >= 8) return "Major Decision";
    return "Decision";
  };

  const endMatch = () => {
    const winner = redScore > blueScore
      ? setup.redWrestler
      : blueScore > redScore
        ? setup.blueWrestler
        : "Draw";
    const result: MatchResult = {
      id: uid(),
      date: new Date().toLocaleDateString(),
      weightClass: setup.weightClass,
      redWrestler: setup.redWrestler,
      redSchool: setup.redSchool,
      blueWrestler: setup.blueWrestler,
      blueSchool: setup.blueSchool,
      redScore,
      blueScore,
      winner,
      winType: redScore === blueScore ? "Draw" : determineWinType(),
      periods: period,
      events,
    };
    onComplete(result);
  };

  return (
    <div className="min-h-screen flex flex-col px-3 py-4 gap-4 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2">
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground text-sm uppercase tracking-wider font-display transition-colors">
          ← Cancel
        </button>
        <div className="text-center">
          <div className="font-display text-primary uppercase tracking-[0.2em] text-xs">{setup.weightClass} lbs</div>
          <div className="font-display text-foreground text-lg uppercase tracking-wide">Period {period}</div>
        </div>
        <div className="font-display text-2xl text-foreground tabular-nums">{formatTime(seconds)}</div>
      </div>

      {/* Timer controls */}
      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          onClick={() => setRunning((r) => !r)}
          className="font-display uppercase tracking-wider border-primary/50 text-primary hover:bg-primary/10"
        >
          {running ? "⏸ Pause" : "▶ Start"}
        </Button>
        <Button
          variant="outline"
          onClick={() => { setSeconds(0); setRunning(false); }}
          className="font-display uppercase tracking-wider border-border text-muted-foreground hover:bg-muted"
        >
          ↺ Reset
        </Button>
        {period < 3 && (
          <Button
            variant="outline"
            onClick={() => { setPeriod((p) => p + 1); setSeconds(0); setRunning(false); }}
            className="font-display uppercase tracking-wider border-border text-muted-foreground hover:bg-muted"
          >
            Period {period + 1} →
          </Button>
        )}
      </div>

      {/* Scoreboards side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        <TeamPanel
          name={setup.redWrestler}
          school={setup.redSchool}
          score={redScore}
          side="red"
          onScore={(type, pts, label) => addScore("red", type, pts, label)}
        />
        <TeamPanel
          name={setup.blueWrestler}
          school={setup.blueSchool}
          score={blueScore}
          side="blue"
          onScore={(type, pts, label) => addScore("blue", type, pts, label)}
        />
      </div>

      {/* Event log */}
      {events.length > 0 && (
        <div className="scoreboard-panel p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">Scoring Log</span>
            <button onClick={undo} className="text-xs text-destructive hover:underline font-semibold uppercase tracking-wider">
              ↩ Undo Last
            </button>
          </div>
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1">
            {[...events].reverse().map((ev) => (
              <div key={ev.id} className="flex items-center justify-between text-xs">
                <span className={ev.team === "red" ? "text-team-red" : "text-team-blue"}>
                  {ev.team === "red" ? "🔴" : "🔵"} {ev.team === "red" ? setup.redWrestler : setup.blueWrestler}
                </span>
                <span className="text-muted-foreground">{ev.label}</span>
                <span className="text-primary font-bold">+{ev.points} pts</span>
                <span className="text-muted-foreground tabular-nums">{formatTime(ev.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* End Match */}
      {!confirmEnd ? (
        <Button
          onClick={() => setConfirmEnd(true)}
          className="w-full h-14 font-display text-lg uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 gold-glow"
        >
          End Match
        </Button>
      ) : (
        <div className="scoreboard-panel p-4 border border-primary/40 text-center space-y-3">
          <div className="font-display text-foreground uppercase tracking-wide">
            Final: <span className="text-team-red">{redScore}</span> — <span className="text-team-blue">{blueScore}</span>
          </div>
          <p className="text-muted-foreground text-sm">Confirm end of match?</p>
          <div className="flex gap-3">
            <Button onClick={() => setConfirmEnd(false)} variant="outline" className="flex-1 border-border text-muted-foreground hover:bg-muted font-display uppercase tracking-wider">
              Back
            </Button>
            <Button onClick={endMatch} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-display uppercase tracking-wider">
              Confirm & Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
