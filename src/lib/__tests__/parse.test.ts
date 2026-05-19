import { describe, expect, it } from "vitest";
import { parseConfig } from "../parse";

describe("parseConfig", () => {
  it("rejects empty input", () => {
    const r = parseConfig("   ");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/empty/i);
  });

  it("rejects invalid JSON", () => {
    const r = parseConfig("{ not json");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/invalid json/i);
  });

  it("rejects config missing mcpServers (test case 15)", () => {
    const r = parseConfig('{"servers": {}}');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/mcpServers/);
  });

  it("accepts empty mcpServers as a valid zero-server config", () => {
    const r = parseConfig('{"mcpServers": {}}');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.result.totalServers).toBe(0);
      expect(r.result.categories).toEqual([]);
      expect(r.result.highestRisk).toBeNull();
    }
  });

  it("rejects non-object mcpServers", () => {
    const r = parseConfig('{"mcpServers": []}');
    expect(r.ok).toBe(false);
  });

  it("rejects server with non-string command", () => {
    const r = parseConfig('{"mcpServers":{"x":{"command":123}}}');
    expect(r.ok).toBe(false);
  });

  it("accepts a valid sample-like config and surfaces summary", () => {
    const r = parseConfig(
      JSON.stringify({
        mcpServers: {
          fs: {
            command: "npx",
            args: ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
          },
          gh: {
            command: "npx",
            args: ["-y", "@modelcontextprotocol/server-github"],
            env: { GITHUB_PERSONAL_ACCESS_TOKEN: "x" },
          },
        },
      })
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.result.totalServers).toBe(2);
      expect(r.result.categories).toContain("Filesystem");
      expect(r.result.categories).toContain("External API");
      expect(r.result.categories).toContain("Secrets");
      expect(r.result.highestRisk).toBeTruthy();
    }
  });
});
