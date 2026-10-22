"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DownloadReportButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="lg" className="gap-1.5" onClick={onClick}>
      <Download className="size-4" />
      Unduh Laporan
    </Button>
  );
}
