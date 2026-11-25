import { useState } from "react";
import { Settings } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_TEAMS, parseTeams, saveTeams } from "@/lib/teams";

interface Props {
  teams: string[];
  onSave: (teams: string[]) => void;
}

export default function TeamsEditor({ teams, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const parsed = parseTeams(text);

  const save = () => {
    if (!saveTeams(parsed)) {
      toast.error("Could not save the team list on this device.");
      return;
    }
    onSave(parsed);
    setOpen(false);
  };

  return (
    <>
      <button type="button" onClick={() => { setText(teams.join(", ")); setOpen(true); }}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary uppercase tracking-wider">
        <Settings className="w-3.5 h-3.5" /> Edit Teams
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wider">Edit Teams</DialogTitle>
            <DialogDescription>Separate school abbreviations with commas. {parsed.length} teams detected.</DialogDescription>
          </DialogHeader>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} className="bg-muted border-border" aria-label="Team list" />
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setText(DEFAULT_TEAMS.join(", "))}>Reset to Defaults</Button>
            <Button type="button" disabled={!parsed.length} onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
