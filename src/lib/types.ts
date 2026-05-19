export type Category =
  | "Code execution"
  | "Database"
  | "Filesystem"
  | "External API"
  | "Network"
  | "Secrets"
  | "Unknown";

export const ALL_CATEGORIES: Category[] = [
  "Code execution",
  "Database",
  "Filesystem",
  "External API",
  "Network",
  "Secrets",
  "Unknown",
];

// Display severity, high to low.
export const SEVERITY: Record<Category, number> = {
  "Code execution": 6,
  Database: 5,
  Filesystem: 4,
  "External API": 3,
  Secrets: 2,
  Network: 1,
  Unknown: 0,
};

export interface RawServer {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  // Some configs use url/transport for SSE servers
  url?: string;
  type?: string;
}

export interface RawConfig {
  mcpServers: Record<string, RawServer>;
}

export interface AnalyzedServer {
  name: string;
  command: string;
  args: string[];
  envKeys: string[];
  url?: string;
  categories: Category[];
  // npm package guess if we identified one
  pkg?: string;
}

export interface AnalysisResult {
  servers: AnalyzedServer[];
  totalServers: number;
  categories: Category[];
  highestRisk: Category | null;
}

export type ParseOutcome =
  | { ok: true; result: AnalysisResult }
  | { ok: false; error: string };
