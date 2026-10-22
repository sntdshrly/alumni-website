"use client";

import Image from "next/image";
import { useState } from "react";
import { Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { filterOptions } from "@/data/dashboard";
import type { FilterDashboard } from "@/lib/dashboard-report";

type HeaderProps = {
  title: string;
  actions?: React.ReactNode;
  // Dipanggil tombol "Unduh Laporan" bawaan, dengan filter yang sedang dipilih.
  onDownload?: (filter: FilterDashboard) => void;
};

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  className: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as string)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DefaultFilters({ onDownload }: { onDownload?: (filter: FilterDashboard) => void }) {
  const [filter, setFilter] = useState<FilterDashboard>({
    tahunLulus: filterOptions.tahunLulus[0],
    sekolah: filterOptions.sekolah[0],
    periodeData: filterOptions.periodeData[0],
  });

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <FilterSelect
        value={filter.tahunLulus}
        onChange={(tahunLulus) => setFilter({ ...filter, tahunLulus })}
        options={filterOptions.tahunLulus}
        placeholder="Tahun Lulus"
        className="min-w-[140px]"
      />
      <FilterSelect
        value={filter.sekolah}
        onChange={(sekolah) => setFilter({ ...filter, sekolah })}
        options={filterOptions.sekolah}
        placeholder="Sekolah"
        className="min-w-[140px]"
      />
      <FilterSelect
        value={filter.periodeData}
        onChange={(periodeData) => setFilter({ ...filter, periodeData })}
        options={filterOptions.periodeData}
        placeholder="Periode Data"
        className="min-w-[170px]"
      />

      <Button
        variant="outline"
        size="lg"
        className="gap-1.5"
        disabled={!onDownload}
        onClick={() => onDownload?.(filter)}
      >
        <Download className="size-4" />
        Unduh Laporan
      </Button>
    </div>
  );
}

export function Header({ title, actions, onDownload }: HeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-black/5 bg-white px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <Image
          src="/logo-univ-binus.png"
          alt="BINUS University"
          width={666}
          height={449}
          priority
          className="hidden h-10 w-auto shrink-0 object-contain sm:block"
        />
        <div className="hidden h-8 w-px shrink-0 bg-slate-200 sm:block" />
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">{actions ?? <DefaultFilters onDownload={onDownload} />}</div>
    </header>
  );
}
