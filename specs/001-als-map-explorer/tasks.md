---

description: "Task list for ALS Map Explorer implementation"
---

# Tasks: ALS Map Explorer

**Input**: Design documents from `/specs/001-als-map-explorer/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: OPTIONAL per the project constitution (fast iteration). A few targeted
Vitest tasks are included for the fragile seams (sandbox runner, ALS request/URL
builders) and are clearly marked `(OPTIONAL)`. Skip them freely; the rest of the
feature is validated via quickstart.md.

**Organization**: Grouped by user story. Setup + Foundational + US1 = the MVP.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1 / US2 / US3 (user-story phases only)

## Path Conventions

Single client-side project rooted at the repo (per plan.md): `src/`, `tests/`,
`index.html` at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and tooling

- [ ] T001 Scaffold Vite + TypeScript project at repo root: `package.json` (scripts: dev/build/test), `tsconfig.json` (ES2022, strict, CSS-module types), `vite.config.ts`, and `index.html` with a `#map` container and an app-root container
- [ ] T002 Install dependencies: runtime `maplibre-gl@^5.24`, `codemirror@^6` + `@codemirror/state` + `@codemirror/view` + `@codemirror/lang-javascript`, `@awesome.me/webawesome`; dev `vite@^6`, `typescript`, `vitest`
- [ ] T003 [P] Global styling bootstrap: import `maplibre-gl/dist/maplibre-gl.css` and Web Awesome, call `setBasePath()`/loader so assets resolve under Vite, add a base theme + `src/styles/app.module.css` and `src/styles/layout.module.css`
- [ ] T004 [P] Create `.env.example` (`VITE_ALS_API_KEY`, `VITE_AWS_REGION`) and `.gitignore` (`.env.local`, `node_modules`, `dist`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure every user story builds on - central config, the
settings store, and the reusable code-panel primitives (editor, sandbox, tab shell)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Implement `src/config.ts` - CENTRAL integration config: read `VITE_ALS_API_KEY` / `VITE_AWS_REGION`, ALS Maps + Places endpoints, default `MapView`/`POIQuery` values, curated map-style list, and a curated POI category list (per Principle V, all ALS config lives here)
- [ ] T006 [P] Implement `src/state/store.ts` - `SettingsStore` (mapView, poiQuery, poiResults; `subscribe`, `setMapView`, `setPoiQuery`, `setPoiResults`) per data-model.md
- [ ] T007 [P] Implement `src/panels/editor.ts` - CodeMirror 6 wrapper: locked scaffold with one editable region via `EditorState.changeFilter` + a `StateField` tracking the range through edits; `@codemirror/lang-javascript` highlighting; get/set region text; reset-to-original
- [ ] T008 [P] Implement `src/panels/sandbox.ts` - run the edited region via `new Function(...injected, code)` with an injected scope (per contracts/sandbox-scope.md); return `{ ok: true } | { ok: false, error }`, never throw to the caller (SC-006)
- [ ] T009 [P] Implement `src/panels/codePanel.ts` - Web Awesome `wa-split-panel` layout (map | code panel) + `wa-tab-group` shell with a `registerTab(id, label, element)` API for stories to add their tabs
- [ ] T010 [P] Implement `src/ui/notice.ts` - non-fatal error/notice display (banner/toast) reused across stories to surface ALS/code errors without blanking the map (SC-006)
- [ ] T011 [P] Implement `src/explain/content.ts` - the `Explanation` structure `{ summary, referenceLabel, referenceUrl }` and a per-capability registry (populated by each story)
- [ ] T012 Implement `src/main.ts` - bootstrap: build config, mount the split-panel + tab-group shell + notice area, and expose registration hooks for the map and tabs (stories wire into this file)
- [ ] T013 [P] (OPTIONAL) Vitest for the sandbox runner in `tests/unit/sandbox.test.ts` - success path, thrown-error isolation, and scope restriction

**Checkpoint**: Foundation ready - the app shell renders with an empty tabbed code panel; user stories can now begin

---

## Phase 3: User Story 1 - See the basemap and the code behind it (Priority: P1) 🎯 MVP

**Goal**: Render a 2D Amazon basemap and expose it through the dual-control loop -
HTML inputs + an editable code region + a plain-language explanation with a
reference link, kept in sync via the store.

**Independent Test**: Load the app → a 2D Amazon basemap renders at a default
center/zoom; changing the style/color-scheme input updates the map and the code
region; editing + applying the code updates the map; invalid code shows a
non-fatal error and keeps the last map; reset restores the snippet; the reference
link opens the ALS Maps doc.

- [ ] T014 [P] [US1] Implement `src/als/basemap.ts` - `buildStyleUrl(region, style, colorScheme, opts?)` returning the ALS Maps v2 descriptor URL with `?key=` (per contracts/als-maps.md); raw and commented so the request is visible
- [ ] T015 [US1] Implement `src/map/mapController.ts` - create the MapLibre map with the ALS basemap style (`validateStyle: false`); on `style.load` force a flat 2D default (`setProjection({})`, `setPitch(0)`); listen for map `error` events → `notice`; expose add/clear marker + `setStyleUrl` APIs (depends on T014, T005, T010)
- [ ] T016 [US1] Register the map in `src/main.ts` so a default Amazon basemap renders on load (FR-001, SC-001) (depends on T015, T012)
- [ ] T017 [P] [US1] Add the basemap explanation + ALS Maps reference link to `src/explain/content.ts` (FR-008/009)
- [ ] T018 [US1] Implement `src/panels/basemapTab.ts` - HTML inputs (style `wa-select`, color-scheme `wa-switch`) + an editable snippet (build style URL / `setStyle`) + the explanation; wire both controls to the store so input↔code stay in sync; Apply runs via sandbox, Reset restores the snippet, errors route to `notice` (FR-002/003/004/010/011, SC-002/003/006) (depends on T014, T015, T017, T006, T007, T008)
- [ ] T019 [US1] Register the basemap tab via `codePanel.registerTab` in `src/main.ts` (depends on T018, T009)
- [ ] T020 [P] [US1] (OPTIONAL) Vitest for `buildStyleUrl` in `tests/unit/basemap.test.ts` - style, color-scheme, and key params

**Checkpoint**: MVP - a working, editable Amazon basemap with explanation. Fully demoable.

---

## Phase 4: User Story 2 - Explore and filter points of interest (Priority: P2)

**Goal**: Search POIs via ALS Places and filter by category, rendered as markers,
exposed through the same dual-control loop.

**Independent Test**: With the basemap present, run a POI search → markers appear;
toggle category filters → only matching POIs remain; edit + apply the POI code →
results update; an empty area shows a "no results" indication (not an error);
selecting a marker shows basic details; the reference link opens the ALS Places doc.

**Note**: Depends on the map instance from US1 (T015).

- [ ] T021 [P] [US2] Implement `src/als/places.ts` - `searchPlaces(mode, params)`: `fetch` POST to Places v2 `search-nearby` / `search-text` with `?key=` and `Filter.IncludeCategories` (per contracts/als-places.md); map `ResultItems` → `POI[]`; handle empty results and HTTP/network errors without throwing (SC-006)
- [ ] T022 [P] [US2] Add the POI explanation + ALS Places reference link to `src/explain/content.ts` (FR-008/009)
- [ ] T023 [US2] Extend `src/map/mapController.ts` - render `POI[]` as markers, clear on new search, and show basic details on marker select (FR-012) (depends on T015)
- [ ] T024 [US2] Implement `src/panels/poiTab.ts` - inputs (mode text/nearby, query text, radius, category checkboxes, max results) + an editable snippet (`searchPlaces` call) + the explanation; wire to the store; show "no results" and "results limited" indications; errors route to `notice` (FR-005/006/003/004/010) (depends on T021, T023, T022, T006, T007, T008)
- [ ] T025 [US2] Register the POI tab via `codePanel.registerTab` in `src/main.ts` (depends on T024)
- [ ] T026 [P] [US2] (OPTIONAL) Vitest for `places.ts` in `tests/unit/places.test.ts` - request-body construction, category filter mapping, and `ResultItems`→`POI` mapping

**Checkpoint**: US1 + US2 both work independently - basemap editing and POI search/filter.

---

## Phase 5: User Story 3 - Control the map's 3D features (Priority: P3)

**Goal**: Control the full ALS 3D feature set - 3D terrain, 3D buildings, globe
view, camera tilt - making the style-request vs runtime distinction explicit
(FR-013), through the same dual-control loop.

**Independent Test**: With the basemap present, enable terrain → 3D relief with a
tilted camera; enable buildings → 3D structures; toggle globe → globe/flat; change
pitch → viewing angle updates; edit + apply the 3D code → map updates; basemap and
POIs are preserved; reference links open the ALS 3D and MapLibre docs.

**Note**: Depends on the map instance from US1 (T015) and `als/basemap.ts` (T014).

- [ ] T027 [US3] Extend `src/config.ts` + `src/state/store.ts` with 3D fields on `MapView` (`terrain3d`, `buildings3d`, `contourDensity`, `globe`, `pitch`) per data-model.md (depends on T005, T006)
- [ ] T028 [P] [US3] Implement `src/map/threeD.ts` - style-request features (`terrain`/`buildings`/`contour-density`) by rebuilding the URL via `als/basemap.ts` + `map.setStyle`, re-applying runtime settings on the next `style.load`; runtime features `setGlobe` (`setProjection`) and `setPitch`; nudge pitch > 0 when terrain/buildings enabled (per contracts/als-maps.md, research D4)
- [ ] T029 [P] [US3] Add the 3D explanation + ALS 3D and MapLibre globe reference links to `src/explain/content.ts`, explicitly distinguishing style-request (terrain/buildings) from runtime (globe/tilt) features (FR-008/009/013)
- [ ] T030 [US3] Implement `src/panels/threeDTab.ts` - inputs (terrain `wa-switch`, buildings `wa-switch`, globe `wa-switch`, pitch `wa-slider`) + an editable snippet showing both mechanisms + the explanation; wire to the store; preserve basemap + POIs across changes; errors route to `notice` (FR-007/013/003/004/010) (depends on T027, T028, T029, T007, T008)
- [ ] T031 [US3] Register the 3D tab via `codePanel.registerTab` in `src/main.ts` (depends on T030)

**Checkpoint**: All three user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cross-story concerns and final validation

- [ ] T032 [P] Resolve Web Awesome shadow-DOM caveats (research D7): ensure overlays (select/tooltip/dialog) stack above the MapLibre canvas, fix `pointer-events`, and apply theming via CSS custom properties + `::part(...)` in global CSS (not CSS Modules)
- [ ] T033 [P] Missing/invalid API-key startup guard: clear, actionable message instead of a blank map when `VITE_ALS_API_KEY`/region is absent or rejected (SC-006, spec Edge Cases)
- [ ] T034 Verify every on-screen reference link resolves to a live ALS/MapLibre page (SC-005)
- [ ] T035 [P] Write `README.md` - setup (API key provisioning), run commands, and a short "how ALS + MapLibre integrate" teaching summary (Constitution Principle I)
- [ ] T036 Run `quickstart.md` validation - all US1-US3 scenarios plus the cross-cutting checks
- [ ] T037 [P] Performance pass against SC-001 (<5s basemap), SC-002 (<1s input→map), SC-003 (<2s code apply)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies - start immediately
- **Foundational (Phase 2)**: depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-5)**: depend on Foundational. US1 is the MVP. US2 and US3 additionally depend on the map instance from US1 (T015) and are best built in priority order, though each is independently testable once US1's map exists.
- **Polish (Phase 6)**: depends on the desired user stories being complete

### Within Each User Story

- ALS/data module + explanation content (both [P]) → mapController wiring → tab UI → register tab in `main.ts`
- `src/main.ts` is edited sequentially by T012, T016, T019, T025, T031 (same file - not parallel)
- `src/explain/content.ts` is created in T011 then extended by T017, T022, T029 (same file - sequential across phases)

### Parallel Opportunities

- Setup: T003, T004 in parallel (after T001, T002)
- Foundational: T006-T011 + T013 all in parallel (different files); T005 first, T012 last
- US1: T014 ∥ T017 (∥ T020 test); then T015 → T016, T018 → T019
- US2: T021 ∥ T022 (∥ T026 test); then T023 → T024 → T025
- US3: T028 ∥ T029; T027 first; then T030 → T031
- Polish: T032, T033, T035, T037 in parallel

---

## Parallel Example: Foundational primitives

```bash
# After T005 (config), launch the shared primitives together:
Task: "Implement src/state/store.ts"
Task: "Implement src/panels/editor.ts"
Task: "Implement src/panels/sandbox.ts"
Task: "Implement src/panels/codePanel.ts"
Task: "Implement src/ui/notice.ts"
Task: "Implement src/explain/content.ts"
```

## Parallel Example: User Story 1

```bash
# Independent US1 pieces:
Task: "Implement src/als/basemap.ts (buildStyleUrl)"
Task: "Add basemap explanation + reference link to src/explain/content.ts"
Task: "(OPTIONAL) Vitest for buildStyleUrl in tests/unit/basemap.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: run the US1 quickstart scenarios - editable Amazon basemap with explanation
5. Demo the MVP

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → validate → demo (MVP: editable basemap)
3. US2 → validate → demo (POI search + filter)
4. US3 → validate → demo (full 3D controls)
5. Polish → final quickstart validation

---

## Notes

- [P] = different files, no dependency on an incomplete task
- Keep ALS calls raw and readable - the learner is meant to see the actual requests (Constitution Principle III)
- Every tab pairs code + HTML inputs + a plain-language explanation + a reference link
- Errors (bad code, failed/empty ALS calls) must always route to `notice` and preserve the last working map (SC-006)
- Tests are OPTIONAL; the `(OPTIONAL)` tasks cover only the fragile seams
- Commit after each task or logical group; explain proposed changes before editing code (Constitution workflow)
