# Permitted MCP — Claude Code Context

## What this is
Permitted MCP (permitted.io/mcp) is a browser-based visualizer for MCP
server configs. Paste your Claude Desktop config, see which servers are
connected and what permission surface each carries. Static, no backend.

## Brand
- Product: Permitted MCP (sub-product of permitted.io)
- Sibling: IAM Lens at iamlens.dev (never refer to it as Permitted.io/IAM)
- Aesthetic: dark, infrastructure, minimal, monospace-forward
- Voice: engineer to engineer. No marketing. No em dashes anywhere in
  user-facing copy. ASCII quotes only. No "delve / leverage / robust /
  seamless / powerful / comprehensive / elevate / unlock". No contrastive
  negation ("not X but Y"). No emoji. No exclamation points.

## v0.1 Scope (HARD LIMIT — soft launch May 22)
IN:
1. Paste + edit MCP JSON (Claude Desktop format)
2. Robust parse, malformed JSON fails gracefully with specific error
3. Per-server analysis: name, command, args, inferred categories,
   env var KEYS (never values)
4. Summary bar: server count, unique categories, highest-risk surface
5. One-click copy of plaintext summary (Slack / issue / GitHub pasteable)
6. Pre-loaded sample config showing mixed real risk
7. Privacy copy (parsing is in-browser)
8. Responsive, works on phone
9. Cloudflare Pages deploy target

OUT: backend, auth, saving, history, comparison/diff, registry polling,
telemetry / analytics.

## Stack decisions
- Vite + React + TypeScript (matches IAM Lens)
- Tailwind CSS v4 with `@tailwindcss/vite` plugin (no tailwind.config.js,
  no postcss.config.js; CSS uses `@import "tailwindcss"`). v4 was the
  installed version. Going with current rather than downgrading to v3.
- Vitest + jsdom for tests
- No runtime backend, no external API, no telemetry
- Windows / PowerShell dev environment

## Permission taxonomy
Final categories (single enum, sorted in display by severity):

  Code execution    shell, python, node, sandboxed eval
  Filesystem        read/write local files
  Database          sql, nosql, vector stores
  Network           outbound HTTP, browser automation, fetch
  External API      third-party SaaS (GitHub, Slack, Stripe, gdrive, etc.)
  Secrets           any server with env vars present
  Unknown           heuristic matched nothing else

Severity ranking (high to low): Code execution, Database, Filesystem,
External API, Secrets, Network, Unknown.

Inference is a pure function `inferPermissions(server) => Category[]`,
isolated in `src/lib/infer.ts`. Signals: command, args (npx package name
is highly informative), env var presence, URL / connection-string args,
path args.

When the heuristic does not recognize the server, it returns Unknown
(plus Secrets if env vars are present). Honest beats clever.

## File layout
  src/
    lib/
      types.ts         Types for raw config and analyzed result
      parse.ts         JSON parse + shape validation -> ParseResult
      infer.ts         Pure inferPermissions
      sample.ts        Pre-loaded sample config string
      summary.ts       buildPlaintextSummary(result)
      __tests__/
        infer.test.ts  15-case corpus
        parse.test.ts  malformed input cases
    components/
      Badge.tsx
      ServerCard.tsx
      SummaryBar.tsx
      ConfigEditor.tsx
    App.tsx
    main.tsx
    index.css

## Palette (Tailwind classes)
- bg zinc-950, surface zinc-900, border zinc-800
- text-zinc-100 primary, text-zinc-400 secondary, text-zinc-600 muted
- accent green-500 (brand)
- category colors:
    Code execution    red-500
    Database          violet-500
    Filesystem        amber-500
    External API      blue-500
    Network           cyan-500
    Secrets           yellow-500
    Unknown           zinc-500
