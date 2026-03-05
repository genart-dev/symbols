import type {
  SymbolCategory,
  SymbolStyle,
  SymbolVariant,
  SketchSymbolDef,
} from "@genart-dev/format";

export type { SymbolCategory, SymbolStyle, SymbolVariant, SketchSymbolDef };

/** Full definition of a symbol in the registry. */
export interface SymbolDefinition {
  readonly id: string;
  readonly name: string;
  readonly category: SymbolCategory;
  readonly tags: readonly string[];
  readonly description: string;
  readonly styles: Partial<Record<SymbolStyle, SymbolVariant>>;
}

/** Search result entry. */
export interface SymbolSearchResult {
  readonly id: string;
  readonly name: string;
  readonly category: SymbolCategory;
  readonly tags: readonly string[];
  readonly description: string;
  readonly availableStyles: readonly SymbolStyle[];
}
