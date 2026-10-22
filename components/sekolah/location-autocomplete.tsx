"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { indonesiaCities } from "@/data/indonesia-cities";
import { cn } from "@/lib/utils";

type LocationAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
};

export function LocationAutocomplete({ value, onChange, id }: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);

  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return indonesiaCities.slice(0, 8);
    return indonesiaCities.filter((city) => city.toLowerCase().includes(query)).slice(0, 8);
  }, [value]);

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          id={id}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 120)}
          placeholder="Cari nama kota..."
          autoComplete="off"
          className="pl-8"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-md">
          {suggestions.map((city) => (
            <li key={city}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(city);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50",
                  city === value && "bg-blue-50 text-blue-700",
                )}
              >
                {city}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
