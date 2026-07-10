# Research: Maki POI Icons

Phase 0. The one real unknown from the plan's Technical Context is **how to obtain the Maki
icons** - the question the planning step was asked to answer ("find the optimal and simplest
way"). R1 resolves it. R2 records the concrete category-to-icon mapping (verified against the
live icon set). R3 covers rendering a Maki SVG in a MapLibre marker.

## R1. How to obtain the Maki icons

**Decision**: Fetch Maki SVGs by name from the **jsDelivr CDN at runtime**, pinned to a fixed
version, and cache each fetched SVG in memory. Base URL:

```
https://cdn.jsdelivr.net/npm/@mapbox/maki@8.2.0/icons/<name>.svg
```

Ship a tiny **inline generic-fallback SVG** in code (not fetched) so a missing icon, a bad
name, or an offline/blocked CDN never leaves a marker blank.

**Rationale**:

- **Simplest**: no new npm dependency, no Vite asset/glob configuration, no build step, no
  vendored files to keep in sync. One `fetch` and a `Map` cache.
- **Verified to work in the browser**: jsDelivr serves the individual SVGs with
  `access-control-allow-origin: *` (checked), so a browser `fetch` from the app's origin
  succeeds. `@mapbox/maki@8.2.0` is the current published version (npm registry, checked).
- **Serves the learning goal directly**: the learner can point a category at *any* Maki icon
  name and watch it appear (User Story 2), because every name resolves against the live set -
  not just a pre-bundled handful. The raw CDN URL is visible, in the same spirit as the app's
  raw ALS requests: you can see exactly where an icon comes from.
- **Robust by construction**: an unknown name simply 404s; the resolver catches it and uses
  the inline fallback, satisfying "never blank the map" (FR-003) and the invalid-name edge
  case (SC-006). The fallback is inline, so it works with no network at all.
- **Minimal-dependencies principle stays honest**: this adds zero to `package.json`. Pinning
  the version keeps it reproducible rather than tracking a moving `latest`.

**Alternatives considered**:

- **npm `@mapbox/maki` package**: bundle the icons via the dependency and import the ones we
  need. Rejected as heavier and more fiddly for this app: it adds a dependency that ships
  200+ icons, and supporting the learner typing *any* icon name (US2) would need
  `import.meta.glob` to pull every SVG into the bundle. More config, larger bundle, no real
  benefit over the CDN for a learning demo. Kept in reserve if a fully offline build is ever
  required.
- **Vendor a curated SVG subset in the repo** (e.g. `src/assets/maki/*.svg`, ~8-12 files):
  zero runtime network and fully offline. Rejected as the primary approach because it caps
  US2's "point a category at any Maki icon" to the vendored set and adds a manual copy step.
  It is the natural fallback if we later need offline support - the fetch seam can be swapped
  for a local import without touching the resolver.
- **Floating `@mapbox/maki` (no version) on the CDN**: rejected - `latest` can change under
  us; pin the version for reproducibility.

## R2. Category-to-icon mapping (verified)

The app's existing POI filters define the categories that MUST have a distinct icon (FR-011).
Each Maki name below was confirmed to return HTTP 200 from the pinned CDN path; `atm` is the
only gap in the set, so ATMs use `bank` (closest match).

| ALS category ID            | App label      | Maki icon   | Notes                          |
|----------------------------|----------------|-------------|--------------------------------|
| `restaurant`               | Restaurants    | `restaurant`| exact                          |
| `coffee_shop`              | Coffee shops   | `cafe`      | closest Maki name              |
| `hotel`                    | Hotels         | `lodging`   | Maki's lodging/bed icon        |
| `petrol-gasoline_station`  | Fuel stations  | `fuel`      | exact concept                  |
| `grocery`                  | Supermarkets   | `grocery`   | exact                          |
| `hospital`                 | Hospitals      | `hospital`  | exact                          |
| `atm`                      | ATMs           | `bank`      | **no `atm` icon in Maki** (404)|
| `parking_lot`              | Parking        | `parking`   | exact                          |
| *(fallback / unmapped)*    | -              | `marker`    | Maki's generic teardrop pin    |

Note the mapping is keyed on the **corrected** ALS category IDs from the 003-era bug fix
(`petrol-gasoline_station`, `grocery`) - the same IDs the filter now sends.

## R3. Rendering a Maki SVG in a MapLibre marker

**Decision**: Build a custom marker element and pass it to `new maplibregl.Marker({ element })`,
replacing today's default `new maplibregl.Marker()`. The element is a small container whose
`innerHTML` is the fetched (or fallback) SVG.

**Rationale**: MapLibre's `Marker` accepts an `element` option for exactly this; it keeps the
existing popup/`setLngLat` flow intact. Maki SVGs are 15x15, monochrome, and inherit colour
via CSS `color`/`fill`, so a marker's look can be styled in one place. `showPois()` already
clears and rebuilds markers, so per-render icon resolution fits the current shape.

**Handling async fetch**: `showPois()` becomes marker-building that resolves icons; because a
distinct icon is fetched at most once and then cached, and the fallback is synchronous, a
marker can be created immediately with the fallback and upgraded when its SVG resolves - or
icons pre-resolved before adding markers. Either is acceptable; the contract keeps `iconNameFor`
pure and isolates the async fetch in `loadIconSvg`.

**Alternatives considered**: a MapLibre symbol layer with a sprite/`addImage` sheet. Rejected -
that is the heavier, styling-via-style-spec path; HTML markers keep the existing popup and
click behaviour and are far simpler for a learning demo of this size.
