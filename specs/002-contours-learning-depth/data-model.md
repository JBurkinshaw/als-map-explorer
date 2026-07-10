# Data Model: Topographic Contours & Deeper Learning Context

Feature 002 makes small, additive changes to the existing 001 domain types. Nothing is
persisted; all state is session-only in the `SettingsStore`.

## Changed entity: `MapView` (src/types.ts)

Add a contours attribute alongside the existing style-request 3D features.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| styleName | `MapStyleName` | `Standard` | unchanged |
| colorScheme | `ColorScheme` | `Light` | unchanged |
| center | `[number, number]` | NYC | unchanged |
| zoom | `number` | `11` | unchanged |
| terrain3d | `boolean` | `false` | style-request feature (unchanged) |
| buildings3d | `boolean` | `false` | style-request feature (unchanged) |
| **contourDensity** | **`ContourDensity`** | **`'Off'`** | **NEW - style-request feature; `'Off'` omits the `contour-density` param** |
| globe | `boolean` | `false` | runtime feature (unchanged) |
| pitch | `number` | `0` | runtime feature (unchanged) |

New supporting type:

```
export type ContourDensity = 'Off' | 'Low' | 'Medium' | 'High';
```

**Wiring rule (the fix at the heart of US1)**: `contourDensity` must be a real field on
`MapView` and `DEFAULT_MAP_VIEW`, and must be included in `ThreeDPatch`
(`src/map/threeD.ts`) so `apply3D` recognises a contour change as a *style change*
(`styleChanged`) and calls `map.applyBasemap(view)`. `applyBasemap` already rebuilds the
URL from the full `MapView`, and `als/basemap.ts` already emits `contour-density` from
`opts.contourDensity`. The value passed to the builder is the density string, or the
parameter is omitted when the value is `'Off'`.

**UI mapping (on/off control, per spec assumption)**:
- Control "on"  → `contourDensity = 'Medium'` (fixed default; see research R1)
- Control "off" → `contourDensity = 'Off'`

A future Low/Medium/High selector would set the field directly; the field already
supports it, so that enhancement is additive.

**Validation / state transitions**: `contourDensity` is independent of `terrain3d`
(contours render with or without 3D terrain). Enabling contours triggers a `setStyle`
reload; runtime settings (globe, pitch) are re-applied on `style.load` as today. A failed
contour style load preserves the last working map and shows a notice (reused 001 path).

## Changed entity: `Explanation` (src/types.ts)

Extend from a single summary string to structured, multi-paragraph content while keeping
the reference link. Rendering stays text-based (no raw HTML injection).

| Field | Type | Notes |
|-------|------|-------|
| ~~summary~~ | ~~`string`~~ | replaced by `paragraphs` |
| **paragraphs** | **`string[]`** | **NEW - one or more paragraphs; each rendered as its own block. Content names the ALS request and the MapLibre consumption step for the capability.** |
| referenceLabel | `string` | unchanged |
| referenceUrl | `string` | unchanged |

Optionally a capability may carry more than one reference link in future; not required by
this feature (one link per tab minimum, FR-012).

## New content: contours explanation entry (src/explain/content.ts)

Add a `contours` (or fold into the existing `threeD`) explanation entry with
`paragraphs` describing: the `contour-density` style-descriptor parameter and its
Low/Medium/High levels (the ALS request), and how the reloaded style is handed to
MapLibre via `setStyle` (the MapLibre consumption). Reference:
`https://docs.aws.amazon.com/location/latest/developerguide/maps-topographic-map.html`.

## Unchanged entities

`PoiQuery`, `PoiCategory`, `Poi`, `MapStyleName`, `ColorScheme` are unchanged by this
feature.
