import { describe, it, expect } from "vitest";
import { resolveSymbol, resolveSymbolValue, resolveAllSymbols } from "../src/resolver.js";

describe("resolveSymbol", () => {
  it("throws for any string ID (registry is empty — ADR 043)", () => {
    expect(() => resolveSymbol("pine-tree")).toThrow(/Unknown symbol/);
    expect(() => resolveSymbol("mountain")).toThrow(/Unknown symbol/);
    expect(() => resolveSymbol("sailboat")).toThrow(/Unknown symbol/);
  });

  it("throws for unknown symbol", () => {
    expect(() => resolveSymbol("nonexistent-xyz")).toThrow(/Unknown symbol/);
  });
});

describe("resolveSymbolValue", () => {
  it("throws for string registry ID (registry is empty — ADR 043)", () => {
    expect(() => resolveSymbolValue("oak-tree", "geometric")).toThrow(/Unknown symbol/);
  });

  it("passes through existing SketchSymbolDef unchanged", () => {
    const def = {
      id: "custom",
      name: "Custom",
      paths: [{ d: "M0 0 L100 100" }],
      viewBox: "0 0 100 100",
      custom: true as const,
    };
    const result = resolveSymbolValue(def);
    expect(result).toBe(def);
  });
});

describe("resolveAllSymbols", () => {
  it("throws for string registry IDs (registry is empty — ADR 043)", () => {
    const symbols = {
      "pine-tree": "pine-tree",
    };
    expect(() => resolveAllSymbols(symbols)).toThrow(/Unknown symbol/);
  });

  it("passes through already-resolved defs", () => {
    const def = {
      paths: [{ d: "M0 0 L50 50" }],
      viewBox: "0 0 100 100",
    };
    const result = resolveAllSymbols({ custom: def });
    expect(result["custom"]).toBe(def);
  });
});
