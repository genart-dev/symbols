import type { SketchSymbolDef, SketchSymbolValue, SymbolStyle } from "@genart-dev/format";
import { SYMBOL_REGISTRY } from "./registry.js";

/**
 * Resolve a symbol ID and style from the registry into a SketchSymbolDef.
 * Throws if the symbol ID or style is not found.
 */
export function resolveSymbol(id: string, style: SymbolStyle = "geometric"): SketchSymbolDef {
  const sym = SYMBOL_REGISTRY[id];
  if (!sym) {
    throw new Error(`Unknown symbol "${id}". Use searchSymbols() to find available symbols.`);
  }

  const variant = sym.styles[style];
  if (!variant) {
    const available = Object.keys(sym.styles).join(", ");
    throw new Error(
      `Symbol "${id}" has no "${style}" style. Available styles: ${available}`,
    );
  }

  return {
    id: sym.id,
    name: sym.name,
    style,
    paths: variant.paths,
    viewBox: variant.viewBox,
  };
}

/**
 * Resolve a SketchSymbolValue: if it's a string (registry ID), resolve it;
 * if it's already a SketchSymbolDef, return as-is.
 */
export function resolveSymbolValue(
  value: SketchSymbolValue,
  style: SymbolStyle = "geometric",
): SketchSymbolDef {
  if (typeof value === "string") {
    return resolveSymbol(value, style);
  }
  return value;
}

/**
 * Resolve all string values in a symbols record to SketchSymbolDefs.
 * Already-resolved defs are passed through unchanged.
 */
export function resolveAllSymbols(
  symbols: Readonly<Record<string, SketchSymbolValue>>,
  defaultStyle: SymbolStyle = "geometric",
): Record<string, SketchSymbolDef> {
  const result: Record<string, SketchSymbolDef> = {};
  for (const [key, value] of Object.entries(symbols)) {
    result[key] = resolveSymbolValue(value, defaultStyle);
  }
  return result;
}
