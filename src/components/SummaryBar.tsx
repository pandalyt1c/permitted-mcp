import type { AnalysisResult } from "../lib/types";
import { Badge } from "./Badge";

export function SummaryBar({ result, onCopy, copied }: { result: AnalysisResult; onCopy: () => void; copied: boolean }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-3">
          <Stat label="Servers" value={String(result.totalServers)} />
          <Stat label="Categories" value={String(result.categories.length)} />
          <Stat label="Highest risk" value={result.highestRisk ?? "none"} mono />
        </div>
        <button
          onClick={onCopy}
          className="self-start rounded border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 px-3 py-1.5 text-xs font-mono text-zinc-200 transition"
        >
          {copied ? "copied" : "copy summary"}
        </button>
      </div>
      {result.categories.length > 0 && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Permission surface</div>
          <div className="flex flex-wrap gap-1.5">
            {result.categories.map((c) => (
              <Badge key={c} category={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`mt-1 text-2xl ${mono ? "font-mono text-base text-zinc-100" : "text-zinc-100"}`}>{value}</div>
    </div>
  );
}
