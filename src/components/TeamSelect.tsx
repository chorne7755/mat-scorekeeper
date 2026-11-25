import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  value: string;
  teams: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function TeamSelect({ value, teams, onChange, placeholder = "Select team…" }: Props) {
  const options = Array.from(new Set([...teams, ...(value ? [value] : [])]));
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-muted border-border text-foreground" aria-label={placeholder}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-card border-border text-foreground">
        {options.map((team) => <SelectItem key={team} value={team}>{team}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
