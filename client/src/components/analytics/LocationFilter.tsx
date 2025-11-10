import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function LocationFilter({ value, onChange, className }: LocationFilterProps) {
  const locations = [
    { value: "all", label: "All Locations" },
    { value: "ahmedabad-main", label: "Ahmedabad Main" },
    { value: "ahmedabad-west", label: "Ahmedabad West" },
    { value: "ahmedabad-south", label: "Ahmedabad South" },
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {locations.map((location) => (
          <option key={location.value} value={location.value}>
            {location.label}
          </option>
        ))}
      </select>
    </div>
  );
}
