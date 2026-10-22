import { cn } from "@/lib/utils";

type PanelProps = {
  title: string;
  className?: string;
  children: React.ReactNode;
};

export function Panel({ title, className, children }: PanelProps) {
  return (
    <div className={cn("flex w-full min-w-0 flex-col rounded-xl border border-black/5 bg-white p-5 shadow-sm", className)}>
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 min-w-0 flex-1">{children}</div>
    </div>
  );
}
