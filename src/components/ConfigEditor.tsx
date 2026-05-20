interface Props {
  value: string;
  onChange: (v: string) => void;
  onLoadSample: () => void;
  onClear: () => void;
  error?: string | null;
}

export function ConfigEditor({ value, onChange, onLoadSample, onClear, error }: Props) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="cfg" className="text-[10px] uppercase tracking-wider text-zinc-500">
          MCP config (Claude Desktop format)
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onLoadSample}
            className="rounded border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 px-2.5 py-1 text-xs font-mono text-zinc-300 transition"
          >
            load sample
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded border border-zinc-800 hover:border-zinc-700 px-2.5 py-1 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition"
          >
            clear
          </button>
        </div>
      </div>
      <textarea
        id="cfg"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        placeholder='{ "mcpServers": { ... } }'
        className="min-h-[260px] md:min-h-[420px] w-full max-w-full resize rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
      />
      {error && (
        <div className="mt-2 rounded border border-red-500/40 bg-red-500/5 px-3 py-2 text-sm text-red-300 font-mono">
          {error}
        </div>
      )}
    </div>
  );
}
