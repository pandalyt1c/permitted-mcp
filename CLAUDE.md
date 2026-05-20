# Permitted MCP — Claude Code Context

Last updated: May 20, 2026

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

## Repos (all public, pandalyt1c)

- pandalyt1c/permitted-mcp     — this app
- pandalyt1c/permitted-io      — static placeholder at permitted.io
- pandalyt1c/permitted-router  — Cloudflare Worker proxying /mcp route

## Deploy

- permitted-mcp: Cloudflare Pages, auto-deploys on push to main.
- permitted-io: Cloudflare Pages, auto-deploys on push to main.
- permitted-router: manual wrangler deploy (no auto-deploy yet).

Cloudflare account ID: 55c09b4e3f40185f2baa8dad29434fd2

## Worker proxy pattern

HTMLRewriter rewrites all absolute asset paths to /mcp/... prefix.
Injects <base href="/mcp/"> as belt-and-suspenders.
Do not modify the Vite build config to work around this.

## Git patterns

- No explicit -c user.email flags on commits. Claude Code handles identity.
- Public repo creation: use ! prefix. Example:
    ! gh repo create pandalyt1c/repo-name --public
- Run npm test before every commit. Must be green.

## Known gaps (as of May 20, 2026)

1. Script runner label: direct node/python runners show command name
   instead of script path. Fix in progress.
2. Textarea resize: vertical-only. Fix in progress.
3. GitHub auto-deploy: not yet wired. Manual deploy in place.

## Read on start

Read MEMORY.md in this directory if it exists.
