import { useEffect, useState } from "react";
import { divisionFor, fetchRosters, loadRosters, loadUrls, saveUrls, loadAutoSync, saveAutoSync, Division } from "@/lib/sheetsSync";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MatchSetup } from "@/types/wrestling";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Settings } from "lucide-react";

const DEFAULT_WEIGHT_CLASSES = [
"105G", "106", "113", "114G", "120", "120G", "126", "126G",
"132", "132G", "138", "138G", "144", "145G", "150", "152G",
"157", "165", "165G", "175", "185+G", "190", "215", "285"];
const WEIGHTS_KEY = "mat-scorekeeper-weight-classes";
const parseWeights = (t: string) => Array.from(new Set(t.split(/[,\n]/).map((w) => w.trim()).filter(Boolean)));
const loadWeights = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(WEIGHTS_KEY) || "null");
    if (Array.isArray(v) && v.length) return v;
  } catch {}
  return DEFAULT_WEIGHT_CLASSES;
};



interface Props {
  onStart: (setup: MatchSetup) => void;
  matchCount: number;
  onViewResults?: () => void;
}

export default function MatchSetupForm({ onStart, matchCount, onViewResults }: Props) {
  const [boutNumber, setBoutNumber] = useState<string>(String(matchCount + 1));
  const [weights, setWeights] = useState<string[]>(loadWeights);
  const [form, setForm] = useState<MatchSetup>({
    weightClass: "",
    redWrestler: "",
    redSchool: "",
    blueWrestler: "",
    blueSchool: ""
  });

  const [rosters, setRosters] = useState(loadRosters);
  useEffect(() => { fetchRosters().then(setRosters); }, []);
  const roster = form.weightClass ? rosters[divisionFor(form.weightClass)] : [...rosters.boys, ...rosters.girls];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.weightClass || !form.redWrestler || !form.blueWrestler) return;
    onStart({ ...form, boutNumber });
  };

  const set = (field: keyof MatchSetup, value: string) =>
  setForm((prev) => ({ ...prev, [field]: value }));

  const isValid = form.weightClass && form.redWrestler && form.blueWrestler;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-display text-5xl md:text-6xl text-foreground mb-2 uppercase tracking-wide">
          Wrestling<br />
          <span className="text-primary">Score Keeper</span>
        </h1>
        <div className="mt-5 inline-flex items-center gap-3 px-5 py-2 rounded-full border border-primary/40 bg-primary/5">
          <Label htmlFor="bout-number" className="text-primary text-sm font-semibold uppercase tracking-widest">
            Bout #
          </Label>
          <Input
            id="bout-number"
            inputMode="numeric"
            value={boutNumber}
            onChange={(e) => setBoutNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
            placeholder="0"
            className="w-16 h-8 px-1 rounded-none border-0 border-b border-primary/50 bg-transparent text-center font-display text-xl text-primary placeholder:text-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0" />

        </div>
        <p className="text-muted-foreground text-sm mt-3">Enter match details to begin scoring</p>
        {onViewResults && (
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onViewResults}>
            View Results ({matchCount})
          </Button>
        )}
      </div>


      <datalist id="roster-names">
        {roster.map((n) => <option key={n} value={n} />)}
      </datalist>

      {/* Form card */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl scoreboard-panel p-6 md:p-8 space-y-6">
        {/* Weight class */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-foreground font-display uppercase tracking-wider text-sm">Weight Class (lbs)</Label>
            <WeightEditor weights={weights} onSave={setWeights} />
          </div>
          <Select onValueChange={(v) => set("weightClass", v)} value={form.weightClass}>
            <SelectTrigger className="bg-muted border-border text-foreground">
              <SelectValue placeholder="Select weight class…" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              {weights.map((w) =>
              <SelectItem key={w} value={w}>{w} lbs</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Two columns for teams */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Red corner */}
          <div className="space-y-3 p-4 rounded-lg border border-team-red/30 bg-team-red/5">
            <div className="font-display text-team-red uppercase tracking-widest text-sm font-semibold">RED CORNER</div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Wrestler Name *</Label>
              <Input
                value={form.redWrestler}
                onChange={(e) => set("redWrestler", e.target.value)}
                list="roster-names"
                autoComplete="off"
                placeholder="First Last"
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
          <div className="space-y-3 p-4 rounded-lg border border-team-blue/30 bg-team-blue/5 border-green-500 text-green-500">
            <div className="font-display text-team-blue uppercase tracking-widest text-sm font-semibold text-green-500"> GREEN CORNER</div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Wrestler Name *</Label>
              <Input
                value={form.blueWrestler}
                onChange={(e) => set("blueWrestler", e.target.value)}
                list="roster-names"
                autoComplete="off"
                placeholder="First Last"
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
        <SheetsSettings onRosters={setRosters} rosters={rosters} />
      </form>
    </div>);

}
function WeightEditor({ weights, onSave }: { weights: string[]; onSave: (w: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const parsed = parseWeights(text);
  const save = (list: string[]) => {
    localStorage.setItem(WEIGHTS_KEY, JSON.stringify(list));
    onSave(list);
    setOpen(false);
  };
  return (
    <>
      <button type="button" onClick={() => { setText(weights.join(", ")); setOpen(true); }}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary uppercase tracking-wider">
        <Settings className="w-3.5 h-3.5" /> Edit List
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wider">Edit Weight Classes</DialogTitle>
            <DialogDescription>Separate weights with commas. {parsed.length} weight classes detected.</DialogDescription>
          </DialogHeader>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="bg-muted border-border" />
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setText(DEFAULT_WEIGHT_CLASSES.join(", "))}>Reset to Defaults</Button>
            <Button type="button" disabled={!parsed.length} onClick={() => save(parsed)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SheetsSettings({ rosters, onRosters }: { rosters: Record<Division, string[]>; onRosters: (r: Record<Division, string[]>) => void }) {
  const [open, setOpen] = useState(false);
  const [urls, setUrls] = useState(loadUrls);
  const [auto, setAuto] = useState(loadAutoSync);
  const [loading, setLoading] = useState(false);
  const refresh = async () => {
    saveUrls(urls);
    setLoading(true);
    const r = await fetchRosters();
    setLoading(false);
    onRosters(r);
    toast.success(`Rosters loaded: ${r.boys.length} boys, ${r.girls.length} girls`);
  };
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary uppercase tracking-wider">
        <Settings className="w-3.5 h-3.5" /> Google Sheets Sync · {rosters.boys.length} boys, {rosters.girls.length} girls
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wider">Google Sheets Sync</DialogTitle>
            <DialogDescription>Weights with a "G" go to the Girls sheet, all others to the Boys sheet.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Boys sheet link</Label>
              <Input value={urls.boys} onChange={(e) => setUrls({ ...urls, boys: e.target.value.trim() })} className="bg-muted border-border" />
            </div>
            <div className="space-y-1">
              <Label>Girls sheet link</Label>
              <Input value={urls.girls} onChange={(e) => setUrls({ ...urls, girls: e.target.value.trim() })} className="bg-muted border-border" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Send each bout automatically when saved</Label>
              <Switch checked={auto} onCheckedChange={(v) => { setAuto(v); saveAutoSync(v); }} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" disabled={loading} onClick={refresh}>{loading ? "Loading…" : "Refresh Rosters"}</Button>
            <Button type="button" onClick={() => { saveUrls(urls); setOpen(false); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
