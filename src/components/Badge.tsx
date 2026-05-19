import type { Category } from "../lib/types";

const CATEGORY_STYLE: Record<Category, string> = {
  "Code execution": "border-red-500/40 bg-red-500/10 text-red-300",
  Database: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  Filesystem: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  "External API": "border-blue-500/40 bg-blue-500/10 text-blue-300",
  Network: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  Secrets: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  Unknown: "border-zinc-600/60 bg-zinc-700/20 text-zinc-300",
};

export function Badge({ category }: { category: Category }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-mono uppercase tracking-wide ${CATEGORY_STYLE[category]}`}
    >
      {category}
    </span>
  );
}
