import type { SymbolPath } from "@genart-dev/format";

const SVG_PATH_COMMANDS = /^[MmZzLlHhVvCcSsQqTtAa\d\s.,+-]+$/;
const MAX_SYMBOL_BYTES = 10 * 1024; // 10KB

/**
 * Validate SVG path data string.
 * Returns an array of error strings (empty = valid).
 */
export function validatePathData(d: string): string[] {
  const errors: string[] = [];
  if (!d || d.trim().length === 0) {
    errors.push("Path d attribute must not be empty");
    return errors;
  }
  if (!SVG_PATH_COMMANDS.test(d)) {
    errors.push(`Path d attribute contains invalid characters`);
  }
  // Must start with M or m
  const trimmed = d.trim();
  if (!/^[Mm]/.test(trimmed)) {
    errors.push("Path d attribute must start with M or m command");
  }
  return errors;
}

/**
 * Validate an array of SymbolPaths.
 * Returns an array of error strings (empty = valid).
 */
export function validateSymbolPaths(paths: readonly SymbolPath[]): string[] {
  const errors: string[] = [];
  if (!paths || paths.length === 0) {
    errors.push("Symbol must have at least one path");
    return errors;
  }
  for (let i = 0; i < paths.length; i++) {
    const p = paths[i];
    if (!p || typeof p.d !== "string") {
      errors.push(`paths[${i}].d must be a string`);
      continue;
    }
    const pathErrors = validatePathData(p.d);
    for (const e of pathErrors) {
      errors.push(`paths[${i}]: ${e}`);
    }
    if (p.fill !== undefined && typeof p.fill !== "string") {
      errors.push(`paths[${i}].fill must be a string`);
    }
    if (p.stroke !== undefined && typeof p.stroke !== "string") {
      errors.push(`paths[${i}].stroke must be a string`);
    }
    if (p.strokeWidth !== undefined && typeof p.strokeWidth !== "number") {
      errors.push(`paths[${i}].strokeWidth must be a number`);
    }
  }
  return errors;
}

/**
 * Validate a viewBox string (e.g. "0 0 100 100").
 */
export function validateViewBox(viewBox: string): string[] {
  const errors: string[] = [];
  if (!viewBox || typeof viewBox !== "string") {
    errors.push("viewBox must be a string");
    return errors;
  }
  const parts = viewBox.trim().split(/\s+/);
  if (parts.length !== 4 || parts.some((p) => isNaN(Number(p)))) {
    errors.push(`viewBox must be "minX minY width height" (e.g. "0 0 100 100"), got: "${viewBox}"`);
  }
  return errors;
}

/**
 * Validate total size of paths JSON against the 10KB limit.
 */
export function validateSymbolSize(paths: readonly SymbolPath[]): string[] {
  const json = JSON.stringify(paths);
  const bytes = new TextEncoder().encode(json).length;
  if (bytes > MAX_SYMBOL_BYTES) {
    return [`Symbol paths exceed 10KB size limit (${bytes} bytes)`];
  }
  return [];
}

/** Run all validations on a symbol being created. */
export function validateSymbol(
  paths: readonly SymbolPath[],
  viewBox: string,
): string[] {
  return [
    ...validateSymbolPaths(paths),
    ...validateViewBox(viewBox),
    ...validateSymbolSize(paths),
  ];
}
