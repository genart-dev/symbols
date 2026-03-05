import { describe, it, expect } from "vitest";
import {
  validatePathData,
  validateSymbolPaths,
  validateViewBox,
  validateSymbolSize,
  validateSymbol,
} from "../src/validator.js";

describe("validatePathData", () => {
  it("returns no errors for valid path", () => {
    expect(validatePathData("M10 10 L90 90 Z")).toHaveLength(0);
    expect(validatePathData("M50 5 C60 10 70 20 80 30")).toHaveLength(0);
  });

  it("error for empty path", () => {
    const errors = validatePathData("");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("error for path not starting with M", () => {
    const errors = validatePathData("L10 10 Z");
    expect(errors.some((e) => e.includes("M or m"))).toBe(true);
  });

  it("accepts lowercase m start", () => {
    expect(validatePathData("m10 10 l80 0")).toHaveLength(0);
  });
});

describe("validateSymbolPaths", () => {
  it("returns no errors for valid paths", () => {
    const paths = [
      { d: "M0 0 L100 0 L100 100 L0 100 Z", fill: "#ff0000" },
      { d: "M10 10 C20 5 30 5 40 10", stroke: "#000", strokeWidth: 2 },
    ];
    expect(validateSymbolPaths(paths)).toHaveLength(0);
  });

  it("error for empty paths array", () => {
    const errors = validateSymbolPaths([]);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("error for path with invalid d", () => {
    const errors = validateSymbolPaths([{ d: "" }]);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("error for non-number strokeWidth", () => {
    const errors = validateSymbolPaths([{ d: "M0 0 L10 10", strokeWidth: "2" as unknown as number }]);
    expect(errors.some((e) => e.includes("strokeWidth"))).toBe(true);
  });
});

describe("validateViewBox", () => {
  it("accepts valid viewBox", () => {
    expect(validateViewBox("0 0 100 100")).toHaveLength(0);
    expect(validateViewBox("0 0 120 80")).toHaveLength(0);
    expect(validateViewBox("-10 -10 200 200")).toHaveLength(0);
  });

  it("rejects malformed viewBox", () => {
    expect(validateViewBox("0 0 100").length).toBeGreaterThan(0);
    expect(validateViewBox("not valid at all").length).toBeGreaterThan(0);
  });
});

describe("validateSymbolSize", () => {
  it("accepts small symbol", () => {
    const paths = [{ d: "M0 0 L100 100" }];
    expect(validateSymbolSize(paths)).toHaveLength(0);
  });

  it("rejects oversized symbol", () => {
    const hugePath = { d: "M" + "0 0 L100 100 ".repeat(1000) };
    const errors = validateSymbolSize([hugePath]);
    expect(errors.some((e) => e.includes("10KB"))).toBe(true);
  });
});

describe("validateSymbol", () => {
  it("returns no errors for valid symbol", () => {
    const paths = [{ d: "M10 10 L90 90 L50 5 Z", fill: "#3a7c3e" }];
    const errors = validateSymbol(paths, "0 0 100 100");
    expect(errors).toHaveLength(0);
  });

  it("collects all errors", () => {
    const errors = validateSymbol([], "bad");
    expect(errors.length).toBeGreaterThan(1);
  });
});
