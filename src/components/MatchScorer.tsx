import { useState, useCallback } from "react";
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
  side: "red" | "green";
  onScore: (type: ScoringEvent["type"], points: number, label: string) => void;
}

function TeamPanel({ name, school, score, side, onScore }: TeamPanelProps) {
  const isRed = side === "red";
  const borderColor = isRed ? "border-team-red/50" : "border-team-green/50";
  const bgGlow = isRed ? "team-red-panel" : "team-green-panel";
  const scoreColor = isRed ? "text-team-red" : "text-team-green";
  const labelColor = isRed ? "text-team-red" : "text-team-green";

  const btnBg = {
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
          {isRed ? "🔴" : "🟢"} {school || (isRed ? "Red Corner" : "Green Corner")}
        </div>
        <div className="font-display text-xl truncate text-foreground">{name}</div>
        <div
          className={`font-display text-7xl md:text-8xl font-bold leading-none mt-2 ${scoreColor}`}
          style={{ textShadow: isRed ? "0 0 30px hsl(5,85%,55%,0.6)" : "0 0 30px hsl(142,65%,40%,0.6)" }}
        >
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

const PERIOD_LABELS = [
  "Period 1", "Period 2", "Period 3",
  "OT 1", "OT 2", "OT 3", "OT 4",
];

interface Props {
  setup: MatchSetup;
  onComplete: (result: MatchResult) => void;
  onCancel: () => void;
}

export default function MatchScorer({ setup, onComplete, onCancel }: Props) {
  const [period, setPeriod] = useState(1);
  const [redScore, setRedScore] = useState(0);
  const [greenScore, setGreenScore] = useState(0);
  const [events, setEvents] = useState<ScoringEvent[]>([]);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [selectedWinType, setSelectedWinType] = useState("");
  const [selectedWinner, setSelectedWinner] = useState<"red" | "green" | "">("");
  const [periodChoices, setPeriodChoices] = useState<Record<number, { wrestler: string; choice: string }>>({});
  const [showChoicePrompt, setShowChoicePrompt] = useState<number | null>(null);

  const addScore = useCallback((team: "red" | "blue", type: ScoringEvent["type"], points: number, label: string) => {
    const event: ScoringEvent = { id: uid(), team, type, points, period, timestamp: 0, label };
    setEvents((prev) => [...prev, event]);
    if (team === "red") setRedScore((s) => Math.max(0, s + points));
    else setGreenScore((s) => Math.max(0, s + points));
  }, [period]);

  const undo = () => {
    setEvents((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last.team === "red") setRedScore((s) => Math.max(0, s - last.points));
      else setGreenScore((s) => Math.max(0, s - last.points));
      return prev.slice(0, -1);
    });
  };

  const WIN_TYPES = [
    { value: "Fall", label: "Fall (Pin)" },
    { value: "Technical Fall", label: "Technical Fall (TF)" },
    { value: "Major Decision", label: "Major Decision (MAJ)" },
    { value: "Decision", label: "Decision (DEC)" },
    { value: "Forfeit", label: "Forfeit (FF)" },
    { value: "Injury Default", label: "Injury Default (INJ)" },
    { value: "Disqualification", label: "Disqualification (DQ)" },
  ];

  const POSITION_CHOICES = ["Neutral", "Top", "Bottom"];

  const handlePeriodChange = (newPeriod: number) => {
    // When moving to period 2 or 3, prompt for choice if not already set
    if ((newPeriod === 2 || newPeriod === 3) && !periodChoices[newPeriod]) {
      setShowChoicePrompt(newPeriod);
    } else {
      setPeriod(newPeriod);
    }
  };

  const confirmChoice = (wrestler: string, choice: string) => {
    if (showChoicePrompt) {
      setPeriodChoices((prev) => ({ ...prev, [showChoicePrompt]: { wrestler, choice } }));
      setPeriod(showChoicePrompt);
      setShowChoicePrompt(null);
    }
  };

  const endMatch = () => {
    const winner = selectedWinner === "red"
      ? setup.redWrestler
      : selectedWinner === "green"
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
      blueScore: greenScore,
      winner,
      winType: selectedWinType || "Decision",
      periods: period,
      events,
    };
    onComplete(result);
  };

  const periodLabel = PERIOD_LABELS[period - 1] ?? `Period ${period}`;
  const isOT = period > 3;

  return (
    <div className="min-h-screen flex flex-col px-3 py-4 gap-4 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2">
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground text-sm uppercase tracking-wider font-display transition-colors">
          ← Cancel
        </button>
        <div className="text-center">
          <div className="font-display text-primary uppercase tracking-[0.2em] text-xs">{setup.weightClass} lbs</div>
          <div className={`font-display text-lg uppercase tracking-wide ${isOT ? "text-score-nearfall" : "text-foreground"}`}>
            {periodLabel}
          </div>
        </div>
        {/* Period navigation */}
        <div className="flex gap-1">
          {period > 1 && (
          <Button
              variant="outline"
              size="sm"
              onClick={() => handlePeriodChange(period - 1)}
              className="font-display uppercase tracking-wider border-border text-muted-foreground hover:bg-muted text-xs px-2"
            >
              ← Prev
            </Button>
          )}
          {period < 7 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePeriodChange(period + 1)}
              className="font-display uppercase tracking-wider border-border text-muted-foreground hover:bg-muted text-xs px-2"
            >
              Next →
            </Button>
          )}
        </div>
      </div>

      {/* Period position choice prompt */}
      {showChoicePrompt && (
        <div className="scoreboard-panel p-4 border border-primary/40 text-center space-y-3">
          <div className="font-display text-foreground uppercase tracking-wide text-sm">
            {PERIOD_LABELS[(showChoicePrompt) - 1]} — Who chooses position?
          </div>
          {[
            { label: setup.redWrestler, side: "red" as const },
            { label: setup.blueWrestler, side: "green" as const },
          ].map(({ label, side }) => (
            <div key={side} className="space-y-1">
              <div className={`font-display text-xs uppercase tracking-widest ${side === "red" ? "text-team-red" : "text-team-green"}`}>
                {side === "red" ? "🔴" : "🟢"} {label}
              </div>
              <div className="flex gap-2 justify-center">
                {POSITION_CHOICES.map((choice) => (
                  <button
                    key={choice}
                    onClick={() => confirmChoice(label, choice)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide border bg-muted/40 text-muted-foreground border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={() => { setPeriod(showChoicePrompt); setShowChoicePrompt(null); }}
            className="text-xs text-muted-foreground hover:text-foreground uppercase tracking-wider"
          >
            Skip
          </button>
        </div>
      )}

      {/* Period choices display */}
      {Object.keys(periodChoices).length > 0 && (
        <div className="flex justify-center gap-4 text-xs">
          {Object.entries(periodChoices).map(([p, { wrestler, choice }]) => (
            <span key={p} className="text-muted-foreground">
              <span className="text-foreground font-semibold">{PERIOD_LABELS[Number(p) - 1]}:</span> {wrestler} → {choice}
            </span>
          ))}
        </div>
      )}
      <div className="flex justify-center gap-2">
        {PERIOD_LABELS.map((label, i) => {
          const p = i + 1;
          const isActive = period === p;
          const isPast = period > p;
          const isOvertime = p > 3;
          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              title={label}
              className={`rounded-full transition-all duration-150 ${isOvertime ? "w-2 h-2" : "w-3 h-3"} ${
                isActive
                  ? isOvertime ? "bg-score-nearfall scale-125" : "bg-primary scale-125"
                  : isPast
                  ? "bg-muted-foreground/60"
                  : "bg-muted border border-border"
              }`}
            />
          );
        })}
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
          score={greenScore}
          side="green"
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
                <span className={ev.team === "red" ? "text-team-red" : "text-team-green"}>
                  {ev.team === "red" ? "🔴" : "🟢"} {ev.team === "red" ? setup.redWrestler : setup.blueWrestler}
                </span>
                <span className="text-muted-foreground">{ev.label}</span>
                <span className="text-primary font-bold">{ev.points > 0 ? `+${ev.points}` : ev.points} pts</span>
                <span className="text-muted-foreground">{PERIOD_LABELS[(ev.period ?? 1) - 1]}</span>
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
            Final: <span className="text-team-red">{redScore}</span> — <span className="text-team-green">{greenScore}</span>
          </div>
          {/* Winner selection */}
          <div className="text-left">
            <label className="font-display text-xs uppercase tracking-widest text-muted-foreground block mb-2">Who won?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedWinner("red")}
                className={`px-3 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide border transition-all ${
                  selectedWinner === "red"
                    ? "bg-team-red text-foreground border-team-red"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                }`}
              >
                🔴 {setup.redWrestler}
              </button>
              <button
                onClick={() => setSelectedWinner("green")}
                className={`px-3 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide border transition-all ${
                  selectedWinner === "green"
                    ? "bg-team-green text-foreground border-team-green"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                }`}
              >
                🟢 {setup.blueWrestler}
              </button>
            </div>
          </div>
          {/* Win type selection */}
          <div className="text-left">
            <label className="font-display text-xs uppercase tracking-widest text-muted-foreground block mb-2">How did the match end?</label>
            <div className="grid grid-cols-2 gap-2">
              {WIN_TYPES.map((wt) => (
                <button
                  key={wt.value}
                  onClick={() => setSelectedWinType(wt.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide border transition-all ${
                    selectedWinType === wt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {wt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Button onClick={() => { setConfirmEnd(false); setSelectedWinType(""); setSelectedWinner(""); }} variant="outline" className="flex-1 border-border text-muted-foreground hover:bg-muted font-display uppercase tracking-wider">
              Back
            </Button>
            <Button onClick={endMatch} disabled={!selectedWinType || !selectedWinner} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-display uppercase tracking-wider disabled:opacity-40">
              Confirm & Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
