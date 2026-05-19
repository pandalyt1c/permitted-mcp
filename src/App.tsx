import { useEffect, useMemo, useState } from "react";
import { ConfigEditor } from "./components/ConfigEditor";
import { ServerCard } from "./components/ServerCard";
import { SummaryBar } from "./components/SummaryBar";
import { parseConfig } from "./lib/parse";
import { SAMPLE_CONFIG } from "./lib/sample";
import { buildPlaintextSummary } from "./lib/summary";

function App() {
  const [text, setText] = useState<string>(SAMPLE_CONFIG);
  const [copied, setCopied] = useState(false);

  const outcome = useMemo(() => parseConfig(text), [text]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  async function handleCopy() {
    if (!outcome.ok) return;
    const summary = buildPlaintextSummary(outcome.result);
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
    } catch {
      // Fallback if clipboard API blocked
      const ta = document.createElement("textarea");
      ta.value = summary;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-900">
        <div className="mx-auto max-w-5xl px-4 md:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-sm bg-green-500" aria-hidden />
            <span className="font-mono text-sm text-zinc-100">permitted<span className="text-zinc-500">.io</span>/mcp</span>
          </div>
          <a
            href="https://permitted.io"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-zinc-500 hover:text-zinc-300"
          >
            permitted.io ↗
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl w-full px-4 md:px-6 py-8 md:py-12 flex-1">
        <section className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl text-zinc-100 tracking-tight">
            See what your MCP servers can actually do.
          </h1>
          <p className="mt-3 text-sm md:text-base text-zinc-400 max-w-2xl">
            Paste your Claude Desktop MCP config. Get the combined permission
            surface across every connected server. Parsing runs in your
            browser. Nothing is sent anywhere.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConfigEditor
            value={text}
            onChange={setText}
            onLoadSample={() => setText(SAMPLE_CONFIG)}
            onClear={() => setText("")}
            error={outcome.ok ? null : outcome.error}
          />

          <div className="flex flex-col gap-4">
            {outcome.ok ? (
              <>
                <SummaryBar result={outcome.result} onCopy={handleCopy} copied={copied} />
                <div className="grid grid-cols-1 gap-3">
                  {outcome.result.servers.map((s) => (
                    <ServerCard key={s.name} server={s} />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
                Results will appear here once the config parses.
              </div>
            )}
          </div>
        </div>

        <section className="mt-12 border-t border-zinc-900 pt-6 text-xs text-zinc-500 space-y-2">
          <p>
            <span className="text-zinc-300">How it works.</span>{" "}
            We parse the JSON locally and infer permission categories from
            command, args, env var keys, and known npm package names. Env
            values are never displayed and never leave the browser.
          </p>
          <p>
            <span className="text-zinc-300">Categories.</span>{" "}
            Code execution, Database, Filesystem, External API, Network,
            Secrets, Unknown. Servers we do not recognize are marked Unknown.
          </p>
        </section>
      </main>

      <footer className="border-t border-zinc-900">
        <div className="mx-auto max-w-5xl px-4 md:px-6 py-6 flex flex-col md:flex-row gap-2 md:items-center md:justify-between text-xs text-zinc-500">
          <p>
            Built by <a className="text-zinc-300 hover:text-green-500" href="https://permitted.io" target="_blank" rel="noreferrer">permitted.io</a>. Sibling tool: <a className="text-zinc-300 hover:text-green-500" href="https://iamlens.dev" target="_blank" rel="noreferrer">IAM Lens</a>.
          </p>
          <p className="font-mono">v0.1</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
