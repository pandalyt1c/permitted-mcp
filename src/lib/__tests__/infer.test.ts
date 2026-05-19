import { describe, expect, it } from "vitest";
import { inferPermissions, shapeServer } from "../infer";
import type { Category, RawServer } from "../types";

function cats(name: string, raw: RawServer): Category[] {
  return inferPermissions(shapeServer(name, raw)).categories.sort();
}

function setEq(a: Category[], b: Category[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

describe("inferPermissions — required corpus", () => {
  it("1. filesystem server with path args → Filesystem", () => {
    const c = cats("filesystem", {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/Users/you/projects"],
    });
    expect(c).toEqual(["Filesystem"]);
  });

  it("2. github with GITHUB_TOKEN → External API, Secrets", () => {
    const c = cats("github", {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: { GITHUB_PERSONAL_ACCESS_TOKEN: "x" },
    });
    expect(setEq(c, ["External API", "Secrets"])).toBe(true);
  });

  it("3. postgres with connection string → Database (and Network)", () => {
    const c = cats("postgres", {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-postgres", "postgresql://u:p@host:5432/db"],
    });
    expect(c).toContain("Database");
  });

  it("4. sqlite with db path arg → Database, Filesystem", () => {
    const c = cats("sqlite", {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-sqlite", "/data/app.db"],
    });
    expect(setEq(c, ["Database", "Filesystem"])).toBe(true);
  });

  it("5. puppeteer → Network, Code execution", () => {
    const c = cats("puppeteer", {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-puppeteer"],
    });
    expect(setEq(c, ["Code execution", "Network"])).toBe(true);
  });

  it("6. brave-search with API key env → Network, External API, Secrets", () => {
    const c = cats("brave", {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-brave-search"],
      env: { BRAVE_API_KEY: "x" },
    });
    expect(setEq(c, ["Network", "External API", "Secrets"])).toBe(true);
  });

  it("7. slack with SLACK_TOKEN → External API, Secrets", () => {
    const c = cats("slack", {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-slack"],
      env: { SLACK_BOT_TOKEN: "x", SLACK_TEAM_ID: "y" },
    });
    expect(setEq(c, ["External API", "Secrets"])).toBe(true);
  });

  it("8. gdrive with OAuth env vars → External API, Secrets", () => {
    const c = cats("gdrive", {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-gdrive"],
      env: { GOOGLE_CLIENT_ID: "x", GOOGLE_CLIENT_SECRET: "y" },
    });
    expect(setEq(c, ["External API", "Secrets"])).toBe(true);
  });

  it("9. memory server → no risky categories", () => {
    const c = cats("memory", {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-memory"],
    });
    expect(c).toEqual([]);
  });

  it("10. sequential-thinking → no permission badges", () => {
    const c = cats("seq", {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
    });
    expect(c).toEqual([]);
  });

  it("11. fetch → Network", () => {
    const c = cats("fetch", {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-fetch"],
    });
    expect(c).toEqual(["Network"]);
  });

  it("12. custom python script → Code execution, Filesystem", () => {
    const c = cats("mything", {
      command: "python",
      args: ["./my_server.py"],
    });
    expect(setEq(c, ["Code execution", "Filesystem"])).toBe(true);
  });

  it("13. custom node script → Code execution, Filesystem", () => {
    const c = cats("mything", {
      command: "node",
      args: ["./server.js"],
    });
    expect(setEq(c, ["Code execution", "Filesystem"])).toBe(true);
  });

  it("14. unknown server with env vars → Unknown, Secrets", () => {
    const c = cats("mystery", {
      command: "npx",
      args: ["-y", "some-random-package-xyz"],
      env: { API_KEY: "x" },
    });
    expect(setEq(c, ["Unknown", "Secrets"])).toBe(true);
  });

  it("15. completely unrecognized command and args → Unknown", () => {
    const c = cats("mystery2", {
      command: "/usr/local/bin/randombinary",
      args: ["--flag"],
    });
    expect(c).toEqual(["Unknown"]);
  });
});
