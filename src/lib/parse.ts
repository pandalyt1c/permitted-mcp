import { inferPermissions, shapeServer } from "./infer";
import type {
  AnalysisResult,
  AnalyzedServer,
  Category,
  ParseOutcome,
  RawConfig,
  RawServer,
} from "./types";
import { SEVERITY } from "./types";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function validateServer(name: string, raw: unknown): RawServer | string {
  if (!isPlainObject(raw)) return `Server "${name}" is not an object`;
  const server: RawServer = {};
  if ("command" in raw) {
    if (typeof raw.command !== "string") return `Server "${name}" has a non-string "command"`;
    server.command = raw.command;
  }
  if ("args" in raw) {
    if (!Array.isArray(raw.args) || raw.args.some((a) => typeof a !== "string")) {
      return `Server "${name}" has invalid "args" (must be array of strings)`;
    }
    server.args = raw.args as string[];
  }
  if ("env" in raw) {
    if (!isPlainObject(raw.env)) return `Server "${name}" has invalid "env" (must be object)`;
    const env: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw.env)) {
      env[k] = typeof v === "string" ? v : String(v);
    }
    server.env = env;
  }
  if ("url" in raw) {
    if (typeof raw.url !== "string") return `Server "${name}" has a non-string "url"`;
    server.url = raw.url;
  }
  if ("type" in raw && typeof raw.type === "string") server.type = raw.type;
  return server;
}

export function parseConfig(text: string): ParseOutcome {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Config is empty. Paste a Claude Desktop MCP config to analyze." };

  let data: unknown;
  try {
    data = JSON.parse(trimmed);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Invalid JSON: ${msg}` };
  }

  if (!isPlainObject(data)) {
    return { ok: false, error: "Config must be a JSON object at the top level." };
  }

  if (!("mcpServers" in data)) {
    return {
      ok: false,
      error: 'Missing required key "mcpServers". A Claude Desktop config has the shape { "mcpServers": { ... } }.',
    };
  }

  if (!isPlainObject(data.mcpServers)) {
    return { ok: false, error: '"mcpServers" must be an object mapping server names to definitions.' };
  }

  const rawServers = data.mcpServers as Record<string, unknown>;
  const names = Object.keys(rawServers);

  const analyzed: AnalyzedServer[] = [];
  for (const name of names) {
    const v = validateServer(name, rawServers[name]);
    if (typeof v === "string") return { ok: false, error: v };
    const shaped = shapeServer(name, v);
    const { categories, pkg } = inferPermissions(shaped);
    analyzed.push({
      name,
      command: v.command ?? "",
      args: v.args ?? [],
      envKeys: v.env ? Object.keys(v.env) : [],
      url: v.url,
      categories: sortCategories(categories),
      pkg,
    });
  }

  const allCats = new Set<Category>();
  analyzed.forEach((s) => s.categories.forEach((c) => allCats.add(c)));
  const uniqueCats = sortCategories(Array.from(allCats));

  const highestRisk =
    uniqueCats.length === 0
      ? null
      : uniqueCats.reduce((hi, c) => (SEVERITY[c] > SEVERITY[hi] ? c : hi), uniqueCats[0]);

  const result: AnalysisResult = {
    servers: analyzed,
    totalServers: analyzed.length,
    categories: uniqueCats,
    highestRisk,
  };
  return { ok: true, result };
}

export function sortCategories(cs: Category[]): Category[] {
  return [...new Set(cs)].sort((a, b) => SEVERITY[b] - SEVERITY[a]);
}

// Convenience for tests: parse a RawConfig directly without JSON.
export function analyzeRawConfig(cfg: RawConfig): AnalysisResult {
  const out = parseConfig(JSON.stringify(cfg));
  if (!out.ok) throw new Error(out.error);
  return out.result;
}
