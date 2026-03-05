import { describe, it, expect } from "vitest";
import { searchSymbols } from "../src/search.js";

describe("searchSymbols", () => {
  it("returns empty array with no filters (ADR 043: static registry removed)", () => {
    const results = searchSymbols({});
    expect(results).toHaveLength(0);
  });

  it("returns empty array for keyword filter (registry empty)", () => {
    expect(searchSymbols({ query: "tree" })).toHaveLength(0);
    expect(searchSymbols({ query: "sailboat" })).toHaveLength(0);
  });

  it("returns empty array for category filter (registry empty)", () => {
    expect(searchSymbols({ category: "nature" })).toHaveLength(0);
  });

  it("filters by style availability (vacuously empty — registry empty)", () => {
    const results = searchSymbols({ style: "organic" });
    expect(results).toHaveLength(0);
  });

  it("respects limit", () => {
    const results = searchSymbols({ limit: 3 });
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("returns empty array for unknown keyword", () => {
    const results = searchSymbols({ query: "xyznonexistentsymbol999" });
    expect(results).toHaveLength(0);
  });

  it("results are sorted by name (vacuously true — empty)", () => {
    const results = searchSymbols({});
    const names = results.map((r) => r.name);
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  it("each result has availableStyles (vacuously true — empty)", () => {
    const results = searchSymbols({});
    for (const r of results) {
      expect(r.availableStyles).toBeInstanceOf(Array);
      expect(r.availableStyles.length).toBeGreaterThan(0);
    }
  });
});
