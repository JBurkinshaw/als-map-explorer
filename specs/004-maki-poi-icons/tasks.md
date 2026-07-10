---
description: "Task list for Maki POI Icons"
---

# Tasks: Maki POI Icons

**Input**: Design documents from `/specs/004-maki-poi-icons/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/poi-icons.md

**Tests**: Tests are OPTIONAL (constitution: automated tests only for fragile seams). One unit
test is included for the pure `iconNameFor()` resolver, consistent with the project's existing
unit tests on request builders / sandbox.

**Organization**: Grouped by user story. US1 (P1) is a self-contained MVP; US2 (P2) layers the
editable, explained mapping on top.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1 / US2 for story-phase tasks

## Path Conventions

Single project: `src/`, `tests/` at repository root (per plan.md).

---

## Phase 1: Setup (Shared Configuration)

**Purpose**: Add the centralized mapping and CDN config both stories depend on.

- [X] T001 Add Maki icon config to `src/config.ts`: `MAKI_CDN_BASE` (pinned `https://cdn.jsdelivr.net/npm/@mapbox/maki@8.2.0/icons`), `POI_ICON_MAP` (the 8 verified entries from research.md R2, keyed on corrected ALS IDs incl. `petrol-gasoline_station`, `grocery`, `atm`→`bank`), and `FALLBACK_ICON = 'marker'`.
- [X] T002 [P] Add a `PoiIconMap` type alias (`Record<string, string>`) to `src/types.ts` for readability.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The icon module both stories build on. Blocks US1 and US2.

- [X] T003 Create `src/map/poiIcons.ts` with the pure `iconNameFor(poi, map, fallback)` per data-model.md resolution rules (primary category first, then first matching category, then fallback; never throws).
- [X] T004 In `src/map/poiIcons.ts`, add an inline generic fallback SVG constant and `loadIconSvg(name)`: return cached SVG text if present; else `fetch(`${MAKI_CDN_BASE}/${name}.svg`)`, cache on HTTP 200; on non-200 or network error resolve to the inline fallback SVG (never reject).
- [X] T005 In `src/map/poiIcons.ts`, add `buildMarkerElement(svgMarkup)` returning a fixed-size, consistently-styled container element whose content is the SVG, suitable for `new maplibregl.Marker({ element })`.

**Checkpoint**: `src/map/poiIcons.ts` compiles and exports `iconNameFor`, `loadIconSvg`, `buildMarkerElement`.

---

## Phase 3: User Story 1 - Read the map at a glance by POI type (Priority: P1) 🎯 MVP

**Goal**: Each POI marker shows a category-appropriate Maki icon; unmapped/uncategorised POIs
show the generic fallback; marker click still shows details.

**Independent Test**: Run a mixed POI search; confirm distinct type-appropriate icons, a
fallback marker for anything unmapped (no blanks), and that clicking a marker shows its popup.

- [X] T006 [US1] Update `MapController.showPois(pois)` in `src/map/mapController.ts` to import `POI_ICON_MAP`/`FALLBACK_ICON` from config, resolve each POI via `iconNameFor`, obtain its SVG via `loadIconSvg`, and build the marker with `buildMarkerElement` + `new maplibregl.Marker({ element })`. Preserve the existing `setPopup`/`setLngLat`/`clearPois` behaviour unchanged (FR-006). Handle async icon load without leaving markers blank (create with fallback, upgrade on resolve, or pre-resolve before adding).
- [X] T007 [P] [US1] Add `tests/unit/poiIcons.test.ts` covering `iconNameFor`: primary category wins over non-primary; unmapped-only category returns fallback; no-categories returns fallback; each of the eight seeded filter categories returns its distinct icon (guards FR-011 / SC-003).

**Checkpoint**: US1 is independently demonstrable - the map reads by type with safe fallback.

---

## Phase 4: User Story 2 - See and change how categories map to icons (Priority: P2)

**Goal**: The category-to-icon mapping is visible, explained, and editable; editing it updates
the markers; a Maki reference link is provided.

**Independent Test**: Locate the mapping in the POI tab, read its explanation, change one
category's icon via the editable snippet and see markers update; confirm the reference link
resolves and an invalid name degrades to the fallback without breaking the map.

- [X] T008 [US2] In `src/panels/poiTab.ts`, add a `setPoiIcons(patch)` helper that merges `patch` into `POI_ICON_MAP` (mutating the shared config object) and re-renders current results via `map.showPois(store.poiResults)` - no new ALS request (FR-010).
- [X] T009 [US2] In `src/panels/poiTab.ts`, add a second editable region (reuse `LockedEditor` + `runSnippet`) seeded from the current mapping (e.g. `setPoiIcons({ hotel: 'lodging', hospital: 'hospital' })`), inject `setPoiIcons` into the snippet scope, and wire Apply/Reset with non-fatal error handling (invalid icon name → notice + fallback, per SC-006).
- [X] T010 [US2] In `src/explain/content.ts`, extend the POI explanation with a plain-language paragraph on how a category becomes an icon (incl. fallback behaviour) and add a **Maki icon set** reference link (`https://labs.mapbox.com/maki-icons/` and/or `https://github.com/mapbox/maki`) so the mapping is visible + explained (FR-007, FR-009).

**Checkpoint**: US2 complete - the learning loop (see it, change it, watch the map) works.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T011 [P] Ensure marker icons are legible at city zoom (size/contrast) via `buildMarkerElement` styling in `src/map/poiIcons.ts` (and `src/panels/*.module.css` if needed) - SC-001, FR-005.
- [X] T012 [P] Run automated checks from quickstart.md: `npm run test` (incl. new suite), `npx tsc --noEmit`, `npm run build` - all green.
- [ ] T013 Manual in-browser validation per quickstart.md (US1 + US2 scenarios, incl. invalid-name fallback). Requires a real ALS API key; confirms icons fetch from the CDN and the map never blanks.

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: no dependencies - start immediately.
- **Foundational (Phase 2)**: depends on Setup (uses config). BLOCKS both user stories.
- **US1 (Phase 3)**: depends on Foundational. This is the MVP.
- **US2 (Phase 4)**: depends on Foundational; also depends on US1's marker rendering (it
  re-renders via the same `showPois` path). Best built after US1.
- **Polish (Phase 5)**: after the desired stories are complete.

### Within stories

- T003 → T004 → T005 are the same file (`poiIcons.ts`), so sequential.
- T006 (US1) depends on T003-T005. T007 is independent of T006 (different file) → `[P]`.
- T008 → T009 are the same file (`poiTab.ts`), so sequential; T010 is a different file → can
  run alongside them.

## Parallel Opportunities

- Phase 1: T002 `[P]` alongside T001 (different files).
- Phase 3: T007 `[P]` (test file) alongside T006 (map controller).
- Phase 5: T011 and T012 `[P]`.

## Implementation Strategy

- **MVP scope**: Phase 1 + Phase 2 + Phase 3 (US1) - a map that reads by POI type with a safe
  fallback. Shippable on its own.
- **Increment**: add Phase 4 (US2) for the editable/explained mapping, then Phase 5 polish.
