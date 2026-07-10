# Data Model: Live Request Preview & Complete Documentation Links

Small, additive changes to existing types plus one new pure module. Nothing persisted;
all state is the session-only `SettingsStore`.

## Changed entity: `Explanation` (src/types.ts)

Replace the single reference link with a list.

| Field | Type | Notes |
|-------|------|-------|
| paragraphs | `string[]` | unchanged (from 002) |
| ~~referenceLabel~~ | ~~`string`~~ | removed |
| ~~referenceUrl~~ | ~~`string`~~ | removed |
| **references** | **`ReferenceLink[]`** | **NEW - curated list of labelled doc links; each rendered as a new-tab link** |

New supporting type:

```
export interface ReferenceLink {
  label: string;
  url: string;
}
```

All existing content entries (basemap, poi, threeD) migrate from one label/url to a
`references` array. Each tab must have at least three links (SC-004); see research R2 for the
curated inventory.

## New (derived, not stored): request preview

Produced on demand from the same session state that drives the real requests - never stored,
never diverges. Lives in the new pure module `src/als/preview.ts`.

- **POI preview** - `{ method: 'POST'; url: string; body: string }`
  - `url` from `buildSearchRequest(query, center).url`, with the key masked.
  - `body` is the `buildSearchRequest(...).body` pretty-printed as JSON (no key present).
  - Reflects search mode: nearby → search-nearby endpoint + QueryPosition/QueryRadius body;
    text → search-text endpoint + QueryText/BiasPosition body.
- **3D / basemap preview** - `string`
  - The `buildStyleUrl(view)` URL with the key masked; reflects color-scheme, terrain,
    buildings, and contour-density params currently set.

### Masking rule (security-critical)

`maskApiKey(url)` replaces the `key` query-parameter value with `***` while building the
preview string. The real key is never placed into any rendered text. This is the single
enforcement point (FR-005, SC-002) and is unit-tested to never leak the key.

### Fidelity rule

Preview functions call the same builders (`buildSearchRequest`, `buildStyleUrl`) that
`searchPlaces` / `map.applyBasemap` use to send real requests, so the preview equals the real
request minus the key (FR-007, SC-003).

## Live-update behaviour

The POI and 3D tabs already subscribe to `store` changes to keep controls and code in sync.
The preview element re-renders inside that same subscription callback, so any control change or
applied code edit refreshes the preview (FR-002, SC-001). The preview is read-only - it is
display text, not an input (FR-006).

## Unchanged

`MapView`, `PoiQuery`, `Poi`, `PoiCategory`, `ContourDensity` are unchanged. `buildSearchRequest`
and `buildStyleUrl` are reused as-is (no signature change expected).
