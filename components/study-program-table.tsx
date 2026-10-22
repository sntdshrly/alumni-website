import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { topStudyPrograms } from "@/data/dashboard";
import { Panel } from "@/components/panel";

export function StudyProgramTable() {
  return (
    <Panel title="Top 5 Program Studi Tujuan">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-auto">Program Studi</TableHead>
            <TableHead className="w-14 px-1 text-right">Jumlah</TableHead>
            <TableHead className="w-14 px-1 text-right">%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topStudyPrograms.map((row) => (
            <TableRow key={row.name}>
              <TableCell className="truncate text-slate-700" title={row.name}>
                {row.name}
              </TableCell>
              <TableCell className="px-1 text-right font-medium text-slate-900">
                {row.value}
              </TableCell>
              <TableCell className="px-1 text-right text-slate-500">
                {row.pct.toFixed(1).replace(".", ",")}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Panel>
  );
}
