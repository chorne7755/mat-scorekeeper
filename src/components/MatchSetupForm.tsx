import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MatchSetup } from "@/types/wrestling";

const WEIGHT_CLASSES = [
"106", "113", "120", "126", "132", "138", "144", "150",
"157", "165", "175", "190", "215", "285"];


interface Props {
  onStart: (setup: MatchSetup) => void;
  matchCount: number;
}

export default function MatchSetupForm({ onStart, matchCount }: Props) {
  const [form, setForm] = useState<MatchSetup>({
    weightClass: "",
    redWrestler: "",
    redSchool: "",
    blueWrestler: "",
    blueSchool: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.weightClass || !form.redWrestler || !form.blueWrestler) return;
    onStart(form);
  };

  const set = (field: keyof MatchSetup, value: string) =>
  setForm((prev) => ({ ...prev, [field]: value }));

  const isValid = form.weightClass && form.redWrestler && form.blueWrestler;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-block px-4 py-1 rounded-full border border-primary/40 text-primary text-sm font-semibold uppercase tracking-widest mb-4">
          Match {matchCount + 1}
        </div>
        <h1 className="font-display text-5xl md:text-6xl text-foreground mb-2 uppercase tracking-wide">
          Wrestling<br />
          <span className="text-primary">Score Keeper</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-3">Enter match details to begin scoring</p>
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl scoreboard-panel p-6 md:p-8 space-y-6">
        {/* Weight class */}
        <div className="space-y-2">
          <Label className="text-foreground font-display uppercase tracking-wider text-sm">Weight Class (lbs)</Label>
          <Select onValueChange={(v) => set("weightClass", v)} value={form.weightClass}>
            <SelectTrigger className="bg-muted border-border text-foreground">
              <SelectValue placeholder="Select weight class…" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              {WEIGHT_CLASSES.map((w) =>
              <SelectItem key={w} value={w}>{w} lbs</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Two columns for teams */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Red corner */}
          <div className="space-y-3 p-4 rounded-lg border border-team-red/30 bg-team-red/5">
            <div className="font-display text-team-red uppercase tracking-widest text-sm font-semibold">🔴 Red Corner</div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Wrestler Name *</Label>
              <Input
                value={form.redWrestler}
                onChange={(e) => set("redWrestler", e.target.value)}
                placeholder="Last, First"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                required />

            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">School / Team</Label>
              <Input
                value={form.redSchool}
                onChange={(e) => set("redSchool", e.target.value)}
                placeholder="School name"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />

            </div>
          </div>

          {/* Blue corner */}
          <div className="space-y-3 p-4 rounded-lg border border-team-blue/30 bg-team-blue/5 border-green-500">
            <div className="font-display text-team-blue uppercase tracking-widest text-sm font-semibold text-green-500">🔵 GREEN CORNER</div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Wrestler Name *</Label>
              <Input
                value={form.blueWrestler}
                onChange={(e) => set("blueWrestler", e.target.value)}
                placeholder="Last, First"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                required />

            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">School / Team</Label>
              <Input
                value={form.blueSchool}
                onChange={(e) => set("blueSchool", e.target.value)}
                placeholder="School name"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />

            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!isValid}
          className="w-full h-14 font-display text-lg uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 gold-glow disabled:opacity-40 disabled:cursor-not-allowed">

          Start Match
        </Button>
      </form>
    </div>);

}