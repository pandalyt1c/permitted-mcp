import type { Category, RawServer } from "./types";

interface InferInput {
  name: string;
  command: string;
  args: string[];
  envKeys: string[];
  url?: string;
}

// Extract the most relevant package or script identifier from args.
// For npx / bunx / pnpx / uvx we take the first non-flag arg.
function identifyPackage(command: string, args: string[]): string | undefined {
  const cmd = command.toLowerCase();
  const runners = ["npx", "bunx", "pnpx", "yarn", "pnpm", "uvx", "uv"];
  const isRunner = runners.some((r) => cmd === r || cmd.endsWith("/" + r) || cmd.endsWith("\\" + r));
  if (!isRunner) return undefined;
  for (const a of args) {
    if (!a) continue;
    if (a.startsWith("-")) continue;
    // yarn / pnpm may have a subcommand like "dlx" or "exec"
    if (["dlx", "exec", "run", "tool"].includes(a)) continue;
    return a;
  }
  return undefined;
}

// Permission inference. Pure function. Honest about unknowns.
export function inferPermissions(input: InferInput): {
  categories: Category[];
  pkg?: string;
} {
  const cats = new Set<Category>();
  const { command, args, envKeys, url } = input;
  const cmd = (command || "").toLowerCase();
  const argsLower = args.map((a) => a.toLowerCase());
  const pkg = identifyPackage(command, args);
  const pkgLower = pkg?.toLowerCase();

  // ---- Known @modelcontextprotocol/* official servers ----
  const officialMatch = pkgLower?.match(/@modelcontextprotocol\/server-([a-z0-9-]+)/);
  const officialName = officialMatch?.[1];

  let matchedKnown = false;

  if (officialName) {
    matchedKnown = true;
    switch (officialName) {
      case "filesystem":
        cats.add("Filesystem");
        break;
      case "github":
      case "gitlab":
        cats.add("External API");
        break;
      case "postgres":
      case "mysql":
      case "mongodb":
      case "redis":
        cats.add("Database");
        cats.add("Network");
        break;
      case "sqlite":
        cats.add("Database");
        cats.add("Filesystem");
        break;
      case "puppeteer":
      case "playwright":
        cats.add("Network");
        cats.add("Code execution");
        break;
      case "brave-search":
      case "google-maps":
      case "everart":
        cats.add("Network");
        cats.add("External API");
        break;
      case "fetch":
        cats.add("Network");
        break;
      case "slack":
      case "gdrive":
      case "google-drive":
      case "linear":
      case "notion":
      case "sentry":
      case "stripe":
        cats.add("External API");
        break;
      case "memory":
      case "sequential-thinking":
      case "time":
      case "everything":
        // Benign / utility servers. No risky categories.
        break;
      default:
        // Unknown @modelcontextprotocol server. Treat as unknown for now.
        matchedKnown = false;
    }
  }

  // ---- Direct-script commands: python, node, deno, bun, ruby, php ----
  const codeRunners = ["python", "python3", "node", "deno", "bun", "ruby", "php", "sh", "bash", "pwsh", "powershell"];
  const isDirectCodeRunner = codeRunners.some((r) => cmd === r || cmd.endsWith("/" + r) || cmd.endsWith("\\" + r) || cmd.endsWith("." + r + ".exe") || cmd.endsWith(r + ".exe"));
  if (isDirectCodeRunner) {
    cats.add("Code execution");
    // If args reference a local script path, that script reads/writes files by default.
    const hasScriptPath = args.some((a) => /\.(py|js|mjs|cjs|ts|rb|php|sh)$/i.test(a) || a.startsWith("./") || a.startsWith(".\\") || a.startsWith("../"));
    if (hasScriptPath) cats.add("Filesystem");
    matchedKnown = true;
  }

  // ---- Heuristics on package / args / url for non-official servers ----
  // Database connection strings
  const dbProtocols = ["postgres://", "postgresql://", "mysql://", "mongodb://", "mongodb+srv://", "redis://", "sqlite://"];
  const argHasDbUrl = argsLower.some((a) => dbProtocols.some((p) => a.includes(p)));
  if (argHasDbUrl) {
    cats.add("Database");
    cats.add("Network");
    matchedKnown = true;
  }

  // HTTP url args -> Network
  const argHasHttp = argsLower.some((a) => a.startsWith("http://") || a.startsWith("https://"));
  if (argHasHttp) {
    cats.add("Network");
  }

  if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
    cats.add("Network");
    matchedKnown = true;
  }

  // Package-name hints for non-@modelcontextprotocol packages
  if (pkgLower && !officialName) {
    const hints: Array<[RegExp, Category[]]> = [
      [/(^|[/-])filesystem([/-]|$)/, ["Filesystem"]],
      [/(^|[/-])fs([/-]|$)/, ["Filesystem"]],
      [/(^|[/-])fetch([/-]|$)/, ["Network"]],
      [/(^|[/-])http([/-]|$)/, ["Network"]],
      [/(puppeteer|playwright|chromium|browser)/, ["Network", "Code execution"]],
      [/(postgres|postgresql|mysql|mongo|redis|sqlite|duckdb|clickhouse)/, ["Database"]],
      [/(github|gitlab|slack|notion|linear|stripe|sentry|jira|asana|gdrive|gmail|drive)/, ["External API"]],
      [/(brave-search|google-maps|search)/, ["Network", "External API"]],
    ];
    for (const [re, addCats] of hints) {
      if (re.test(pkgLower)) {
        for (const c of addCats) cats.add(c);
        matchedKnown = true;
      }
    }
  }

  // ---- Secrets: any env vars present implies credentials are at play ----
  if (envKeys.length > 0) {
    cats.add("Secrets");
  }

  // ---- Unknown: nothing else matched ----
  if (!matchedKnown && cats.size === 0) {
    cats.add("Unknown");
  } else if (!matchedKnown && cats.size === 1 && cats.has("Secrets")) {
    // Only Secrets matched because env vars exist, but we still don't know what the server does.
    cats.add("Unknown");
  }

  return {
    categories: Array.from(cats),
    pkg,
  };
}

export function shapeServer(name: string, raw: RawServer): InferInput {
  return {
    name,
    command: raw.command ?? "",
    args: raw.args ?? [],
    envKeys: raw.env ? Object.keys(raw.env) : [],
    url: raw.url,
  };
}
