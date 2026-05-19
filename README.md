# Permitted MCP

Browser-only visualizer for MCP (Model Context Protocol) server configs.
Paste a Claude Desktop config, get a per-server permission surface
breakdown. Sibling tool to [IAM Lens](https://iamlens.dev).

Live at [permitted.io/mcp](https://permitted.io/mcp).

## What it does

- Parses a `claude_desktop_config.json` style payload in the browser
- For each server, infers permission categories: Code execution,
  Database, Filesystem, External API, Network, Secrets, Unknown
- Shows env var keys (values are never displayed)
- Produces a copy-pasteable plaintext summary

No backend. No telemetry. Nothing leaves your browser.

## Run locally

```powershell
npm install
npm run dev
```

## Test

```powershell
npm test
```

22 tests covering the 15-case heuristic corpus plus parse error cases.

## Build

```powershell
npm run build
```

Outputs to `dist/`. Deployable to any static host. Cloudflare Pages is
the target for production.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`, no config file)
- Vitest + jsdom

## Layout

```
src/
  lib/
    types.ts         category and analysis types
    parse.ts         JSON parse + shape validation
    infer.ts         pure inferPermissions(server) -> Category[]
    sample.ts        pre-loaded sample config
    summary.ts       plaintext summary builder
    __tests__/       infer + parse tests
  components/
    Badge.tsx
    ConfigEditor.tsx
    ServerCard.tsx
    SummaryBar.tsx
  App.tsx
  main.tsx
  index.css
```
