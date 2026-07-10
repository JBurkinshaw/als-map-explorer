# Data Model: Maki POI Icons

This feature adds no persisted data and no change to the ALS request/response. It introduces
one small configuration entity (the mapping) and a derived resolution result. The existing
`Poi` / `PoiCategory` types (see `specs/001-als-map-explorer/data-model.md` and `src/types.ts`)
are reused unchanged.

## Entities

### PoiIconMap (configuration)

The association from an ALS place category ID to a Maki icon name.

| Field       | Type                     | Notes                                                        |
|-------------|--------------------------|-------------------------------------------------------------|
| entries     | `Record<string, string>` | key = ALS category ID, value = Maki icon name               |
| fallback    | `string`                 | Maki icon name used when no entry matches (default `marker`) |

- Lives in `src/config.ts` as `POI_ICON_MAP` (entries) and `FALLBACK_ICON` (fallback), plus
  `MAKI_CDN_BASE` for the pinned CDN base URL.
- Keys use the **corrected** ALS category IDs (`petrol-gasoline_station`, `grocery`, ...).
- Editable at runtime by the learner via the injected `setPoiIcons()` sandbox helper, which
  merges a partial record into the active entries and re-renders current results.
- Seed values: the verified table in `research.md` R2.

### IconResolution (derived, transient)

The outcome of resolving one POI to a marker icon. Not stored; computed per render.

| Field      | Type      | Notes                                                             |
|------------|-----------|------------------------------------------------------------------|
| name       | `string`  | the Maki icon name chosen for this POI                           |
| matched    | `boolean` | true if a mapping entry matched a category; false if fallback   |

Produced by the pure function `iconNameFor(poi, map)` (contract in `contracts/poi-icons.md`).

## Resolution rules

Given a `Poi` and a `PoiIconMap`:

1. Consider the POI's **primary** category first (`categories.find(c => c.primary)`), else the
   **first** category (`categories[0]`) - the same precedence the existing popup uses.
2. If that category's ID has an entry in the map, use it (`matched = true`).
3. Otherwise, if any other category ID has an entry, use the first such match (`matched = true`).
4. Otherwise use `fallback` (`matched = false`). A POI with no categories also yields fallback.

This gives one deterministic icon per POI (FR-004) and guarantees every POI resolves to a name
(FR-003).

## Validation & failure behaviour

- A resolved icon **name** is trusted as a string; correctness is enforced at fetch time, not
  here. `loadIconSvg(name)` fetches `${MAKI_CDN_BASE}/${name}.svg`; a non-200 response or
  network error resolves to the inline fallback SVG (never throws to the caller).
- Therefore an invalid name the learner types (US2) degrades to the generic marker with a
  non-fatal notice, never blanking the map (SC-006).

## Out of scope

- No change to `PoiQuery`, the ALS request builder, or how results are fetched (FR-010).
- No per-category colour theming; a single consistent marker style is used.
- No marker de-clustering for dense overlapping results.
