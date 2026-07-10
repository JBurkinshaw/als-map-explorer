# Contract: POI Icons

Interfaces this feature adds. All live in `src/map/poiIcons.ts` unless stated. The sandbox
helper extends the POI tab's injected scope (see `specs/001-als-map-explorer/contracts/sandbox-scope.md`).

## Config (`src/config.ts`)

```ts
/** Pinned Maki CDN base. Icons are fetched as `${MAKI_CDN_BASE}/<name>.svg`. */
export const MAKI_CDN_BASE = 'https://cdn.jsdelivr.net/npm/@mapbox/maki@8.2.0/icons';

/** ALS category ID -> Maki icon name. Keys use corrected ALS IDs. */
export const POI_ICON_MAP: Record<string, string> = {
  restaurant: 'restaurant',
  coffee_shop: 'cafe',
  hotel: 'lodging',
  'petrol-gasoline_station': 'fuel',
  grocery: 'grocery',
  hospital: 'hospital',
  atm: 'bank',          // Maki has no `atm` icon
  parking_lot: 'parking',
};

/** Maki icon used when no mapping entry matches. */
export const FALLBACK_ICON = 'marker';
```

## `iconNameFor(poi, map, fallback)` - pure, unit-tested

```ts
export function iconNameFor(
  poi: Poi,
  map: Record<string, string>,
  fallback: string,
): string;
```

- Selects the POI's primary category (else first category); returns its mapped icon name.
- Falls back to another matching category, then to `fallback`, per the resolution rules in
  `data-model.md`.
- Never throws; always returns a non-empty string.

**Test expectations** (`tests/unit/poiIcons.test.ts`):

- Primary category wins over a non-primary one when both are mapped.
- A POI whose only category is unmapped returns `fallback`.
- A POI with no categories returns `fallback`.
- With the seed `POI_ICON_MAP`, each of the eight filter categories returns its distinct icon
  (guards FR-011 / SC-003).

## `loadIconSvg(name)` - async, cached, non-throwing

```ts
export function loadIconSvg(name: string): Promise<string>; // resolves to SVG markup
```

- Returns cached SVG text if `name` was fetched before (in-memory `Map<string, string>`).
- Otherwise fetches `${MAKI_CDN_BASE}/${name}.svg`; on HTTP 200 caches and returns the SVG text.
- On non-200 or network error, resolves to the **inline fallback SVG** (a small teardrop/dot
  defined in the module) - it never rejects, so callers cannot blank the map.

## `buildMarkerElement(svgMarkup)` - DOM

```ts
export function buildMarkerElement(svgMarkup: string): HTMLElement;
```

- Returns a styled container element (fixed size, consistent colour) whose content is the SVG,
  suitable for `new maplibregl.Marker({ element })`.

## MapController change (`src/map/mapController.ts`)

`showPois(pois)` builds each marker with a custom element:

```ts
new maplibregl.Marker({ element })
  .setLngLat(poi.position)
  .setPopup(popup)      // unchanged popup / details behaviour (FR-006)
  .addTo(this.map);
```

The controller resolves each POI's icon name via `iconNameFor`, obtains SVG via `loadIconSvg`,
and builds the element via `buildMarkerElement`. It reads the active mapping (which
`setPoiIcons` can mutate). Clearing/rebuilding markers is unchanged.

## Sandbox helper (POI tab injected scope)

Extends the scope currently `{ searchPois }` with:

```ts
/** Merge a partial category->icon map and re-render current results. */
setPoiIcons(patch: Record<string, string>): void;
```

- Merges `patch` into the active `POI_ICON_MAP`, then re-renders the current POI results with
  the updated icons (no new ALS request).
- Editable snippet shown in the POI tab seeds from the current mapping, e.g.
  `setPoiIcons({ hotel: 'lodging', hospital: 'hospital' })`.
- An unknown icon name applied here degrades to the fallback marker with a non-fatal notice
  (SC-006), consistent with `loadIconSvg`.

## Explanation & reference (`src/explain/content.ts`)

- Add a plain-language paragraph to the POI explanation covering how a category becomes an icon
  and the fallback behaviour.
- Add a reference link: **Maki icon set** - `https://labs.mapbox.com/maki-icons/` (browsable
  gallery) and/or the repo `https://github.com/mapbox/maki`.
