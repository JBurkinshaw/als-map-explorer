# Implementation Plan: Maki POI Icons

**Branch**: `004-maki-poi-icons` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-maki-poi-icons/spec.md`

## Summary

Give each POI marker an icon that reflects its category, using Mapbox's open-source Maki
set, with a clear generic fallback when nothing matches. A small, visible, editable
category-to-icon mapping lets the learner see and change how a place's category drives its
marker.

**Technical approach**: Maki SVGs are pulled by name from the jsDelivr CDN at runtime
(`https://cdn.jsdelivr.net/npm/@mapbox/maki@8.2.0/icons/<name>.svg`), cached in memory, and
drawn into a custom MapLibre marker element. No new npm dependency is added. A pure
`iconNameFor(poi, mapping)` function (unit-tested) picks the icon from the POI's primary
category; a tiny inline SVG is the always-available fallback so the map is never blank. The
mapping is a plain record in `src/config.ts`, rendered read-only in the POI tab and editable
through the existing sandbox pattern via an injected `setPoiIcons()` helper. The ALS Places
request is untouched.

## Technical Context

**Language/Version**: TypeScript 5.6, ES modules, Vite 6

**Primary Dependencies**: `maplibre-gl` ^5.24 (custom `Marker` element - already present). **No
new npm dependency.** Maki icons obtained from the jsDelivr CDN, pinned to `@mapbox/maki@8.2.0`.

**Storage**: None. In-memory cache (`Map<string, string>`) for fetched SVG text; the mapping
lives in `src/config.ts`.

**Testing**: Vitest - unit test the pure `iconNameFor()` resolver (primary-category selection,
fallback rules). Icon fetching/DOM is verified in-browser via quickstart, not unit-tested.

**Target Platform**: Modern evergreen browsers (same as the rest of the app).

**Project Type**: Single-page vanilla-TS web app.

**Performance Goals**: Markers render without perceptible lag for a typical result set
(MaxResults default 50). Each distinct icon is fetched at most once (cached); repeat renders
and repeated categories hit the cache. The fallback is inline, so it is instant.

**Constraints**: No new npm dependencies (constitution). MUST NOT change how the ALS Places
request is constructed or sent. A missing/invalid icon name MUST never blank or freeze the
map (non-fatal fallback). Icon fetching needs network - acceptable, since the app already
requires network for ALS; the fallback covers offline/failed fetches.

**Scale/Scope**: ~8 curated category mappings shipped (covering the app's filters), plus
best-effort resolution of any Maki name the learner types; dozens of markers per search.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Learning-First (NON-NEGOTIABLE)**: PASS. The category-to-icon mapping is shown in the
  POI tab, explained in plain language, editable via the sandbox, and paired with a reference
  link to the Maki set. The CDN icon URL is visible and raw, in the same spirit as the raw ALS
  requests, so the learner sees exactly where an icon comes from.
- **II. Fast Iteration Over Perfection**: PASS. Reuses the existing marker, sandbox, and
  LockedEditor patterns; adds no dependency and no build step. A curated 8-category mapping is
  the smallest thing that demonstrates the concept; broader coverage is best-effort via fallback.
- **III. ALS as the Backbone**: PASS. POIs still come from ALS Places, unchanged. Icons are a
  presentation concern layered on the existing results (FR-010).
- **IV. MapLibre for Rendering**: PASS. Icons are rendered through `maplibregl.Marker` with a
  custom element - standard MapLibre usage, no bypass.
- **V. Readable, Documented Integration Points**: PASS. The mapping and CDN base are
  centralized in `src/config.ts`; the resolver is a pure, commented function; the fetch/cache
  seam is small and documented.

**Result**: No violations. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/004-maki-poi-icons/
├── plan.md              # This file
├── research.md          # Phase 0 - icon-sourcing decision (CDN vs npm vs bundled)
├── data-model.md        # Phase 1 - mapping + resolution entities
├── quickstart.md        # Phase 1 - in-browser validation steps
├── contracts/
│   └── poi-icons.md     # Phase 1 - resolver, fetch/cache, marker, sandbox helper contracts
└── tasks.md             # Phase 2 (/speckit-tasks - NOT created here)
```

### Source Code (repository root)

```text
src/
├── config.ts            # + POI_ICON_MAP, FALLBACK_ICON, MAKI_CDN_BASE
├── map/
│   ├── mapController.ts  # showPois() builds a custom marker element with the icon
│   └── poiIcons.ts       # NEW - iconNameFor() (pure) + loadIconSvg() (fetch+cache) + buildMarkerEl()
├── panels/
│   └── poiTab.ts         # + read-only mapping view, editable snippet, inject setPoiIcons()
├── explain/
│   └── content.ts        # + icon-mapping explanation paragraph + Maki reference link
└── types.ts             # + PoiIconMap type (if useful)

tests/unit/
└── poiIcons.test.ts      # NEW - iconNameFor() selection + fallback rules
```

**Structure Decision**: Single-project layout (unchanged). The one new module,
`src/map/poiIcons.ts`, sits in the map layer because it owns the marker DOM element and the
SVG fetch/cache; its `iconNameFor()` function is pure and exported for unit testing. The
mapping and CDN base live in `src/config.ts`, honouring Principle V (centralized config).

## Complexity Tracking

> No constitution violations; section intentionally empty.
