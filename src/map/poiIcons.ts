// Resolves each POI to a Maki icon and renders it as a MapLibre marker element.
// Icons are fetched by name from the pinned Maki CDN (see config.MAKI_CDN_BASE) and
// cached; an unknown name (404) or a network failure falls back to an inline SVG, so
// a bad icon or being offline never leaves a marker blank (SC-006).
//
// See specs/004-maki-poi-icons/contracts/poi-icons.md.

import { MAKI_CDN_BASE } from '../config';
import type { Poi, PoiIconMap } from '../types';

/**
 * Inline generic marker (a Maki-style teardrop), shown immediately while an icon
 * loads and used whenever a fetch fails. Bundled so it needs no network.
 */
export const FALLBACK_MARKER_SVG =
  '<svg viewBox="0 0 15 15" width="15" height="15" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M7.5 1C4.46 1 2 3.46 2 6.5c0 4.25 5.5 7.5 5.5 7.5s5.5-3.25 5.5-7.5' +
  'C13 3.46 10.54 1 7.5 1zm0 7.5a2 2 0 110-4 2 2 0 010 4z"/></svg>';

/**
 * Pick the Maki icon name for a POI: try its primary category first, then any other
 * mapped category, else `fallback`. Pure and total - never throws, always returns a
 * non-empty string (data-model.md resolution rules).
 */
export function iconNameFor(poi: Poi, map: PoiIconMap, fallback: string): string {
  const ordered = [...poi.categories].sort((a, b) => Number(b.primary) - Number(a.primary));
  for (const category of ordered) {
    const name = map[category.id];
    if (name) return name;
  }
  return fallback;
}

// In-memory cache of fetched SVG markup, keyed by icon name. Each icon is fetched once.
const svgCache = new Map<string, string>();

/**
 * Fetch a Maki icon's SVG markup by name (cached). On any failure - unknown name
 * (404), network error - resolves to FALLBACK_MARKER_SVG. Never rejects, so callers
 * cannot blank the map.
 */
export async function loadIconSvg(name: string): Promise<string> {
  const cached = svgCache.get(name);
  if (cached !== undefined) return cached;
  try {
    const res = await fetch(`${MAKI_CDN_BASE}/${name}.svg`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const svg = await res.text();
    svgCache.set(name, svg);
    return svg;
  } catch {
    return FALLBACK_MARKER_SVG;
  }
}

/** Wrap SVG markup in a styled, fixed-size element suitable for maplibregl.Marker. */
export function buildMarkerElement(svgMarkup: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'poi-marker';
  el.innerHTML = svgMarkup;
  return el;
}
