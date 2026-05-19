import type { AnalyzedServer } from "../lib/types";
import { Badge } from "./Badge";

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}

function renderArg(a: string): string {
  // Mask connection strings in display
  const dbProtocols = ["postgres://", "postgresql://", "mysql://", "mongodb://", "mongodb+srv://", "redis://"];
  for (const p of dbProtocols) {
    if (a.toLowerCase().startsWith(p)) {
      try {
        const u = new URL(a);
        const host = u.hostname || "(host)";
        const path = u.pathname || "";
        return `${u.protocol}//${u.username ? "***:***@" : ""}${host}${path}`;
      } catch {
        return `${p}***`;
      }
    }
  }
  return truncate(a, 80);
}

export function ServerCard({ server }: { server: AnalyzedServer }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-mono text-sm text-zinc-100 truncate">{server.name}</h3>
          {server.pkg ? (
            <p className="font-mono text-xs text-zinc-400 truncate mt-0.5">{server.pkg}</p>
          ) : server.command ? (
            <p className="font-mono text-xs text-zinc-400 truncate mt-0.5">{server.command}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-end gap-1.5 shrink-0">
          {server.categories.length === 0 ? (
            <span className="text-xs text-zinc-500 font-mono uppercase tracking-wide">low risk</span>
          ) : (
            server.categories.map((c) => <Badge key={c} category={c} />)
          )}
        </div>
      </div>

      {server.args.length > 0 && (
        <div className="mt-3 border-t border-zinc-800 pt-3">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">args</div>
          <ul className="space-y-0.5">
            {server.args.map((a, i) => (
              <li key={i} className="font-mono text-xs text-zinc-300 break-all">
                {renderArg(a)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {server.envKeys.length > 0 && (
        <div className="mt-3 border-t border-zinc-800 pt-3">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">env keys (values hidden)</div>
          <div className="flex flex-wrap gap-1.5">
            {server.envKeys.map((k) => (
              <span key={k} className="font-mono text-xs text-zinc-300 bg-zinc-800/80 border border-zinc-700 rounded px-1.5 py-0.5">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {server.url && (
        <div className="mt-3 border-t border-zinc-800 pt-3">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">url</div>
          <p className="font-mono text-xs text-zinc-300 break-all">{truncate(server.url, 100)}</p>
        </div>
      )}
    </div>
  );
}
