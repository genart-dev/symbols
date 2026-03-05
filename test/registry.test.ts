import { describe, it, expect } from "vitest";
import { SYMBOL_REGISTRY, listCategories } from "../src/registry.js";

describe("SYMBOL_REGISTRY", () => {
  it("is empty (ADR 043: symbols now fetched from Iconify via fetch_symbol)", () => {
    expect(Object.keys(SYMBOL_REGISTRY).length).toBe(0);
  });

  it("all symbols have required fields (vacuously true — registry is empty)", () => {
    for (const [id, sym] of Object.entries(SYMBOL_REGISTRY)) {
      expect(sym.id).toBe(id);
      expect(sym.name).toBeTruthy();
      expect(sym.category).toBeTruthy();
      expect(sym.tags).toBeInstanceOf(Array);
      expect(sym.tags.length).toBeGreaterThan(0);
      expect(sym.description).toBeTruthy();
      expect(Object.keys(sym.styles).length).toBeGreaterThan(0);
    }
  });

  it("all symbol styles have paths and viewBox (vacuously true — registry is empty)", () => {
    for (const sym of Object.values(SYMBOL_REGISTRY)) {
      for (const [styleName, variant] of Object.entries(sym.styles)) {
        expect(variant.paths.length, `${sym.id}/${styleName} paths`).toBeGreaterThan(0);
        expect(variant.viewBox, `${sym.id}/${styleName} viewBox`).toMatch(/^\d+ \d+ \d+ \d+/);
        for (const path of variant.paths) {
          expect(path.d, `${sym.id}/${styleName} path.d`).toBeTruthy();
          expect(typeof path.d).toBe("string");
        }
      }
    }
  });
});

describe("listCategories", () => {
  it("returns empty array (ADR 043: static registry removed)", () => {
    expect(listCategories()).toEqual([]);
  });
});
