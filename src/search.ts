import type { SymbolCategory, SymbolStyle } from "@genart-dev/format";
import type { SymbolSearchResult } from "./types.js";
import { SYMBOL_REGISTRY } from "./registry.js";

export interface SearchOptions {
  query?: string;
  category?: SymbolCategory;
  style?: SymbolStyle;
  limit?: number;
}

/**
 * Search the symbol registry by keyword, category, and/or style.
 * Keyword matching runs on id, name, tags, and description.
 */
export function searchSymbols(opts: SearchOptions = {}): SymbolSearchResult[] {
  const { query, category, style, limit = 20 } = opts;
  const q = query ? query.toLowerCase().trim() : null;

  const results: SymbolSearchResult[] = [];

  for (const sym of Object.values(SYMBOL_REGISTRY)) {
    // Filter by category
    if (category && sym.category !== category) continue;

    // Filter by style availability
    if (style && !sym.styles[style]) continue;

    // Keyword filter
    if (q) {
      const haystack = [sym.id, sym.name, sym.description, ...sym.tags].join(" ").toLowerCase();
      if (!haystack.includes(q)) continue;
    }

    results.push({
      id: sym.id,
      name: sym.name,
      category: sym.category,
      tags: sym.tags,
      description: sym.description,
      availableStyles: Object.keys(sym.styles) as SymbolStyle[],
    });
  }

  // Sort alphabetically by name
  results.sort((a, b) => a.name.localeCompare(b.name));

  return results.slice(0, limit);
}
