import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@digihire/shared";
import { Button } from "@digihire/shared";
import { Calendar } from "@digihire/shared";
import { Popover, PopoverContent, PopoverTrigger } from "@digihire/shared";

interface Props {
  from: Date | undefined;
  to: Date | undefined;
  onChange: (from: Date | undefined, to: Date | undefined) => void;
}

export function DateRangeFilter({ from, to, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <DatePicker label="From" value={from} onChange={(d) => onChange(d, to)} />
      <DatePicker label="To" value={to} onChange={(d) => onChange(from, d)} />
      {(from || to) && (
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onChange(undefined, undefined)}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function DatePicker({ label, value, onChange }: { label: string; value: Date | undefined; onChange: (d: Date | undefined) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-9 w-[130px] justify-start text-left font-normal", !value && "text-muted-foreground")}>
          <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
          {value ? format(value, "MMM d, yyyy") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className={cn("p-3 pointer-events-auto")} />
      </PopoverContent>
    </Popover>
  );
}


