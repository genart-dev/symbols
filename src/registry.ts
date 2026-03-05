import type { SymbolDefinition } from "./types.js";

/**
 * Static symbol registry — intentionally empty since ADR 043.
 * Symbols are now fetched on-demand from Iconify via the fetch_symbol MCP tool.
 */
export const SYMBOL_REGISTRY: Readonly<Record<string, SymbolDefinition>> = {};

/** Sorted list of unique categories represented in the registry. Always empty. */
export function listCategories(): string[] {
  return [];
}
