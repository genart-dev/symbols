/**
 * Iconify API client and SVG body parser.
 * No external dependencies — uses Node 18+ built-in fetch.
 */

import type { SymbolPath } from "@genart-dev/format";

// ---------------------------------------------------------------------------
// Safe prefix allowlist (MIT / ISC / Apache 2.0 only)
// ---------------------------------------------------------------------------

export const SAFE_PREFIXES: Readonly<Record<string, string>> = {
  ph: "MIT (Phosphor Icons)",
  lucide: "ISC (Lucide)",
  tabler: "MIT (Tabler Icons)",
  heroicons: "MIT (Heroicons)",
  bi: "MIT (Bootstrap Icons)",
  mdi: "Apache 2.0 (Material Design Icons)",
  ri: "Apache 2.0 (Remix Icons)",
  carbon: "Apache 2.0 (Carbon Design System)",
  fluent: "MIT (Fluent UI)",
};

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface IconifySearchResult {
  readonly iconifyId: string;
  readonly prefix: string;
  readonly name: string;
  readonly license: string;
}

export interface FetchedIconData {
  readonly iconifyId: string;
  readonly prefix: string;
  readonly name: string;
  readonly viewBox: string;
  readonly paths: readonly SymbolPath[];
  readonly license: string;
}

// ---------------------------------------------------------------------------
// Internal Iconify API response shapes
// ---------------------------------------------------------------------------

interface IconifySearchResponse {
  icons: string[];
  total?: number;
}

interface IconifyIconData {
  body: string;
  width?: number;
  height?: number;
}

interface IconifyIconSetResponse {
  prefix: string;
  icons: Record<string, IconifyIconData>;
  width?: number;
  height?: number;
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

const BASE_URL = "https://api.iconify.design";
const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// SVG body parser
// ---------------------------------------------------------------------------

/**
 * Parse an Iconify SVG body string into SymbolPath[].
 * Handles <path>, <g> with inherited attributes.
 * currentColor → #000000, none → "none".
 */
export function parseSvgBody(body: string): SymbolPath[] {
  const paths: SymbolPath[] = [];
  parseSvgBodyInto(body, {}, paths);
  return paths;
}

interface InheritedAttrs {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

function normColor(value: string | undefined): string | undefined {
  if (!value || value === "inherit") return undefined;
  if (value === "currentColor") return "#000000";
  return value;
}

function normStrokeWidth(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = parseFloat(value);
  return isNaN(n) ? undefined : n;
}

function parseSvgBodyInto(
  markup: string,
  inherited: InheritedAttrs,
  out: SymbolPath[],
): void {
  // Find all top-level elements (non-nested). We parse iteratively.
  // Strategy: scan for opening tags, extract attributes, handle <g> recursively.
  const tagRe = /<(path|g|circle|rect|ellipse|polygon|polyline|line)(\s[^>]*)?\s*\/?>/gi;
  let match: RegExpExecArray | null;

  while ((match = tagRe.exec(markup)) !== null) {
    const tag = match[1].toLowerCase();
    const attrStr = match[2] ?? "";

    if (tag === "path") {
      const d = extractAttr(attrStr, "d");
      if (!d) continue;

      const rawFill = extractAttr(attrStr, "fill") ?? inherited.fill;
      const rawStroke = extractAttr(attrStr, "stroke") ?? inherited.stroke;
      const rawSW = extractAttr(attrStr, "stroke-width") ?? String(inherited.strokeWidth ?? "");

      const fill = normColor(rawFill);
      const stroke = normColor(rawStroke);
      const strokeWidth = normStrokeWidth(rawSW);

      out.push({
        d,
        ...(fill !== undefined ? { fill } : {}),
        ...(stroke !== undefined ? { stroke } : {}),
        ...(strokeWidth !== undefined ? { strokeWidth } : {}),
      });
    } else if (tag === "g") {
      // Find the matching closing </g> for this <g> to recurse into its body.
      const gStart = match.index + match[0].length;
      const gEnd = findClosingG(markup, gStart);
      const inner = markup.slice(gStart, gEnd);

      const gFill = normColor(extractAttr(attrStr, "fill") ?? inherited.fill);
      const gStroke = normColor(extractAttr(attrStr, "stroke") ?? inherited.stroke);
      const gSW = normStrokeWidth(extractAttr(attrStr, "stroke-width"));

      const childInherited: InheritedAttrs = {
        fill: gFill ?? inherited.fill,
        stroke: gStroke ?? inherited.stroke,
        strokeWidth: gSW ?? inherited.strokeWidth,
      };

      parseSvgBodyInto(inner, childInherited, out);

      // Advance regex past the </g>
      tagRe.lastIndex = gEnd + "</g>".length;
    }
    // circle/rect/ellipse/polygon/polyline/line → skip (rare in ph/lucide)
  }
}

function extractAttr(attrStr: string, name: string): string | undefined {
  const re = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|\\'([^\\']*)\\'|(\\S+))`, "i");
  const m = re.exec(attrStr);
  if (!m) return undefined;
  return m[1] ?? m[2] ?? m[3];
}

/** Find the index of </g> that closes the <g> starting at `from`. */
function findClosingG(markup: string, from: number): number {
  let depth = 1;
  let i = from;
  while (i < markup.length && depth > 0) {
    const openIdx = markup.indexOf("<g", i);
    const closeIdx = markup.indexOf("</g>", i);
    if (closeIdx === -1) break;
    if (openIdx !== -1 && openIdx < closeIdx) {
      // Check it's actually a <g tag (not <gradient etc)
      const after = markup[openIdx + 2];
      if (after === ">" || after === " " || after === "\t" || after === "\n" || after === "\r") {
        depth++;
        i = openIdx + 2;
        continue;
      }
    }
    depth--;
    if (depth === 0) return closeIdx;
    i = closeIdx + 4;
  }
  return markup.length;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Search Iconify for icons matching a query.
 * Filters to SAFE_PREFIXES only. Returns at most `limit` results (default 10).
 */
export async function searchIconify(
  query: string,
  limit = 10,
  prefixes?: string[],
): Promise<IconifySearchResult[]> {
  const safePrefixes = prefixes
    ? prefixes.filter((p) => SAFE_PREFIXES[p])
    : Object.keys(SAFE_PREFIXES);

  const params = new URLSearchParams({
    query,
    limit: String(Math.min(limit * 3, 60)), // over-fetch to allow prefix filtering
    prefixes: safePrefixes.join(","),
  });

  const url = `${BASE_URL}/search?${params}`;
  let response: Response;
  try {
    response = await fetchWithTimeout(url);
  } catch {
    return [];
  }

  if (!response.ok) return [];

  const data = (await response.json()) as IconifySearchResponse;
  const icons: string[] = data.icons ?? [];

  const results: IconifySearchResult[] = [];
  for (const iconifyId of icons) {
    const colon = iconifyId.indexOf(":");
    if (colon === -1) continue;
    const prefix = iconifyId.slice(0, colon);
    const name = iconifyId.slice(colon + 1);
    const license = SAFE_PREFIXES[prefix];
    if (!license) continue;
    results.push({ iconifyId, prefix, name, license });
    if (results.length >= limit) break;
  }

  return results;
}

/**
 * Fetch an icon from Iconify and parse its SVG body into SymbolPath[].
 * Returns FetchedIconData on success, throws on error.
 */
export async function fetchAndParseIcon(iconifyId: string): Promise<FetchedIconData> {
  const colon = iconifyId.indexOf(":");
  if (colon === -1) {
    throw new Error(`Invalid iconifyId "${iconifyId}" — expected "prefix:name" format`);
  }

  const prefix = iconifyId.slice(0, colon);
  const name = iconifyId.slice(colon + 1);

  const license = SAFE_PREFIXES[prefix];
  if (!license) {
    throw new Error(
      `Prefix "${prefix}" is not in the approved list. Use: ${Object.keys(SAFE_PREFIXES).join(", ")}`,
    );
  }

  const url = `${BASE_URL}/${prefix}.json?icons=${name}`;
  let response: Response;
  try {
    response = await fetchWithTimeout(url);
  } catch (err) {
    throw new Error(
      `Iconify unavailable — use create_symbol for manual geometry (${String(err)})`,
    );
  }

  if (response.status === 404) {
    throw new Error(`Icon "${iconifyId}" not found — call fetch_symbol with query to search`);
  }
  if (!response.ok) {
    throw new Error(`Iconify returned HTTP ${response.status} for "${iconifyId}"`);
  }

  const data = (await response.json()) as IconifyIconSetResponse;
  const iconData = data.icons?.[name];
  if (!iconData) {
    throw new Error(`Icon "${iconifyId}" not found in response — call fetch_symbol with query to search`);
  }

  const width = iconData.width ?? data.width ?? 24;
  const height = iconData.height ?? data.height ?? 24;
  const viewBox = `0 0 ${width} ${height}`;

  let paths: SymbolPath[];
  try {
    paths = parseSvgBody(iconData.body);
  } catch (err) {
    throw new Error(`SVG parse error for "${iconifyId}": ${String(err)}`);
  }

  if (paths.length === 0) {
    throw new Error(
      `No parseable <path> elements in "${iconifyId}" body: ${iconData.body.slice(0, 200)}`,
    );
  }

  return { iconifyId, prefix, name, viewBox, paths, license };
}
