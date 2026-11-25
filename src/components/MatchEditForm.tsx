import { useState } from "react";
import { MatchResult } from "@/types/wrestling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TeamSelect from "@/components/TeamSelect";

const WIN_TYPES = [
  { value: "Fall", label: "Fall (Pin)" },
  { value: "Technical Fall", label: "Technical Fall (TF)" },
  { value: "Major Decision", label: "Major Decision (MAJ)" },
  { value: "Decision", label: "Decision (DEC)" },
  { value: "Forfeit", label: "Forfeit (FF)" },
  { value: "Injury Default", label: "Injury Default (INJ)" },
  { value: "Disqualification", label: "Disqualification (DQ)" },
];

interface Props {
  match: MatchResult;
  teams: string[];
  onSave: (match: MatchResult) => void;
  onCancel: () => void;
}

export default function MatchEditForm({ match, teams, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<MatchResult>({ ...match });
  const set = <K extends keyof MatchResult>(field: K, value: MatchResult[K]) =>
    setDraft((previous) => ({ ...previous, [field]: value }));
  const winnerSide = draft.winner === draft.redWrestler ? "red" : draft.winner === draft.blueWrestler ? "green" : "";
  const valid = draft.weightClass.trim() && draft.redWrestler.trim() && draft.blueWrestler.trim() && winnerSide && draft.winType;

  return (
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (valid) onSave(draft); }}>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="edit-bout">Bout #</Label>
          <Input id="edit-bout" inputMode="numeric" value={draft.boutNumber || ""}
            onChange={(e) => set("boutNumber", e.target.value.replace(/[^0-9]/g, "").slice(0, 4))} className="bg-muted border-border" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="edit-weight">Weight Class</Label>
          <Input id="edit-weight" value={draft.weightClass} onChange={(e) => set("weightClass", e.target.value)} required className="bg-muted border-border" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3 p-3 rounded-lg border border-team-red/30 bg-team-red/5">
          <div className="font-display text-sm uppercase tracking-widest text-team-red">Red Corner</div>
          <div className="space-y-1">
            <Label htmlFor="edit-red-name">Wrestler</Label>
            <Input id="edit-red-name" value={draft.redWrestler} onChange={(e) => set("redWrestler", e.target.value)} required className="bg-muted border-border" />
          </div>
          <div className="space-y-1">
            <Label>Team</Label>
            <TeamSelect value={draft.redSchool} teams={teams} onChange={(value) => set("redSchool", value)} placeholder="Select red team…" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-red-score">Final Score</Label>
            <Input id="edit-red-score" type="number" min="0" value={draft.redScore}
              onChange={(e) => set("redScore", Math.max(0, Number(e.target.value)))} required className="bg-muted border-border" />
          </div>
        </div>
        <div className="space-y-3 p-3 rounded-lg border border-team-green/30 bg-team-green/5">
          <div className="font-display text-sm uppercase tracking-widest text-team-green">Green Corner</div>
          <div className="space-y-1">
            <Label htmlFor="edit-green-name">Wrestler</Label>
            <Input id="edit-green-name" value={draft.blueWrestler} onChange={(e) => set("blueWrestler", e.target.value)} required className="bg-muted border-border" />
          </div>
          <div className="space-y-1">
            <Label>Team</Label>
            <TeamSelect value={draft.blueSchool} teams={teams} onChange={(value) => set("blueSchool", value)} placeholder="Select green team…" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-green-score">Final Score</Label>
            <Input id="edit-green-score" type="number" min="0" value={draft.blueScore}
              onChange={(e) => set("blueScore", Math.max(0, Number(e.target.value)))} required className="bg-muted border-border" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label>Winner</Label>
          <Select value={winnerSide} onValueChange={(side) => set("winner", side === "red" ? draft.redWrestler : draft.blueWrestler)}>
            <SelectTrigger className="bg-muted border-border" aria-label="Winner"><SelectValue placeholder="Select winner…" /></SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="red">{draft.redWrestler} (Red)</SelectItem>
              <SelectItem value="green">{draft.blueWrestler} (Green)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>How It Ended</Label>
          <Select value={draft.winType} onValueChange={(value) => set("winType", value)}>
            <SelectTrigger className="bg-muted border-border" aria-label="How it ended"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-card border-border">
              {WIN_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Periods</Label>
          <Select value={String(draft.periods)} onValueChange={(value) => set("periods", Number(value))}>
            <SelectTrigger className="bg-muted border-border" aria-label="Periods"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-card border-border">
              {[1, 2, 3, 4, 5, 6, 7].map((period) => <SelectItem key={period} value={String(period)}>{period <= 3 ? `Period ${period}` : `OT ${period - 3}`}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {match.syncStatus === "synced" && (
        <p className="text-xs text-muted-foreground rounded border border-border p-3">
          Saving updates this device and future Excel exports. The old row stays in Google Sheets; remove it there before syncing this corrected bout again.
        </p>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!valid}>Save Changes</Button>
      </div>
    </form>
  );
}
