# Phase 1 Data Model: ALS Map Explorer

All state is in-memory and session-scoped (no persistence). These are the
conceptual entities and the shape of the shared settings store that keeps HTML
inputs and code panels in sync. Types are illustrative TypeScript; final field
names are refined during implementation.

---

## MapView

The current visual state of the map. Single instance, owned by `mapController`.

| Field | Type | Notes / Validation |
|-------|------|--------------------|
| `styleName` | `'Standard' \| 'Monochrome' \| 'Hybrid' \| 'Satellite'` | Drives the ALS style URL |
| `colorScheme` | `'Light' \| 'Dark'` | Applies to Standard/Monochrome |
| `center` | `[lng: number, lat: number]` | lng ∈ [-180,180], lat ∈ [-90,90] |
| `zoom` | `number` | ∈ [0, 22] |
| `terrain3d` | `boolean` | Style-request feature (`terrain=Terrain3D`); default `false` |
| `contourDensity` | `string \| undefined` | Optional, pairs with terrain |
| `buildings3d` | `boolean` | Style-request feature (`buildings=Buildings3D`); default `false` |
| `globe` | `boolean` | Runtime (`setProjection`); ALS default is `true`, app starts `false` (flat) |
| `pitch` | `number` | Runtime camera tilt (`setPitch`); ∈ [0, 85]; default `0` |

3D control mechanisms differ (FR-013):
- `terrain3d` / `contourDensity` / `buildings3d` are set by **rebuilding the style
  URL** and calling `map.setStyle(...)`. Runtime settings (`globe`, `pitch`) are
  re-applied on the next `style.load`.
- `globe` toggles via `setProjection({})` (off/flat) vs `setProjection({type:'globe'})`.
- `pitch` toggles via `setPitch`; enabling terrain/buildings nudges pitch > 0 so
  the effect is visible.

Basemap and POIs are preserved across all 3D changes (FR-007).

---

## POIQuery

The learner's current POI search parameters. Single instance.

| Field | Type | Notes / Validation |
|-------|------|--------------------|
| `mode` | `'nearby' \| 'text'` | `nearby` → SearchNearby, `text` → SearchText |
| `queryText` | `string` | Required when `mode === 'text'` |
| `position` | `[lng, lat]` | Defaults to map center for `nearby` |
| `radiusMeters` | `number` | `nearby` only; > 0, sensible cap (e.g. 50000) |
| `includeCategories` | `string[]` | ALS category IDs; empty = no category filter |
| `maxResults` | `number` | Display cap (default ~50) |

---

## POI (result item)

A place returned by ALS Places. Zero-to-many, rebuilt on each search; rendered as
markers.

| Field | Type | Notes |
|-------|------|-------|
| `placeId` | `string` | ALS `PlaceId` |
| `title` | `string` | Display name |
| `position` | `[lng, lat]` | ALS `Position`; marker location |
| `categories` | `{ id: string; name: string; primary: boolean }[]` | For labeling / filter display |
| `address` | `string \| undefined` | Optional label from ALS |

Selecting a marker surfaces `title`, primary category, and `address` (FR-012).

---

## Capability

One of the three learning units, each rendered as a tab. Static, config-driven.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `'basemap' \| 'poi' \| 'mode'` | Maps to user stories US1/US2/US3 |
| `label` | `string` | Tab label |
| `snippet` | `CodeSnippet` | The code panel content |
| `explanation` | `Explanation` | Plain-language copy + reference link |

---

## CodeSnippet

The code shown for a capability: a locked scaffold with one editable region.

| Field | Type | Notes / Validation |
|-------|------|--------------------|
| `scaffold` | `string` | Full read-only snippet text (for display + context) |
| `editableRange` | `{ from: number; to: number }` | Char offsets of the editable region within the current doc; tracked live as the user types |
| `original` | `string` | The editable region's initial text (for reset, FR-011) |
| `current` | `string` | Current editable-region text |
| `apply(regionText): Result` | function | Runs the region in the sandbox scope and updates the map |

Invariant: edits outside `editableRange` are suppressed by the editor
(`changeFilter`). Reset restores `current = original`.

---

## Explanation

Plain-language description tied to a capability (FR-008/009).

| Field | Type | Notes |
|-------|------|-------|
| `summary` | `string` | Simplified "what this code does" copy |
| `referenceLabel` | `string` | Human label for the link |
| `referenceUrl` | `string` | Live ALS or MapLibre doc URL (SC-005) |

---

## SettingsStore (input ↔ code convergence)

The single source of truth that both the HTML inputs and the editable code write
to, satisfying FR-004 ("changing one is reflected in the other").

- Holds the `MapView` and `POIQuery` values.
- Emits change events; HTML inputs and code panels both subscribe and re-render.
- Two write paths converge here:
  1. **Input change** → update store → re-run the capability's effect → update map → re-render the snippet's editable region to match.
  2. **Code apply** → sandbox runs the edited region (which mutates map/settings) → reconcile store from the result → re-sync inputs.
- Last applied change wins (spec Edge Cases); on sandbox error the store and last
  working map are left unchanged and an error is surfaced (SC-006).

```ts
interface SettingsStore {
  mapView: MapView;
  poiQuery: POIQuery;
  poiResults: POI[];
  subscribe(fn: (s: SettingsStore) => void): () => void;
  setMapView(patch: Partial<MapView>): void;
  setPoiQuery(patch: Partial<POIQuery>): void;
  setPoiResults(results: POI[]): void;
}
```
