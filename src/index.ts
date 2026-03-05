export type {
  SymbolDefinition,
  SymbolSearchResult,
  SymbolCategory,
  SymbolStyle,
  SymbolVariant,
  SketchSymbolDef,
} from "./types.js";

export { SYMBOL_REGISTRY, listCategories } from "./registry.js";
export { searchSymbols } from "./search.js";
export type { SearchOptions } from "./search.js";
export { resolveSymbol, resolveSymbolValue, resolveAllSymbols } from "./resolver.js";
export {
  validatePathData,
  validateSymbolPaths,
  validateViewBox,
  validateSymbolSize,
  validateSymbol,
} from "./validator.js";
export { searchIconify, fetchAndParseIcon, SAFE_PREFIXES } from "./iconify.js";
export type { IconifySearchResult, FetchedIconData } from "./iconify.js";
