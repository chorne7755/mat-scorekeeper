import { useState, ReactNode, FormEvent } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkPasscode, isUnlocked, rememberUnlock, lock } from "@/lib/passcode";

export default function PasscodeGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(isUnlocked);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (await checkPasscode(code)) { rememberUnlock(); setUnlocked(true); setCode(""); setError(false); }
    else setError(true);
  };

  if (unlocked) {
    return (
      <>
        {children}
        <Button variant="outline" size="sm" className="fixed top-3 right-3 z-50" aria-label="Lock app"
          onClick={() => { lock(); setUnlocked(false); }}>
          <Lock className="w-4 h-4 mr-1" /> Lock
        </Button>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-lg border border-border bg-card p-8 text-center">
        <Lock className="w-10 h-10 mx-auto text-primary" />
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wide text-foreground">RHS Wrestling</h1>
          <p className="text-sm text-muted-foreground mt-1">Authorized scorers only</p>
        </div>
        <Input type="password" autoFocus placeholder="Team passcode" aria-label="Team passcode"
          value={code} onChange={(e) => { setCode(e.target.value); setError(false); }} />
        {error && <p className="text-sm text-destructive">Incorrect passcode</p>}
        <Button type="submit" className="w-full">Unlock</Button>
      </form>
    </div>
  );
}
