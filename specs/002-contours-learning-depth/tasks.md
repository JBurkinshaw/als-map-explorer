---

description: "Task list for Topographic Contours & Deeper Learning Context"
---

# Tasks: Topographic Contours & Deeper Learning Context

**Input**: Design documents from `/specs/002-contours-learning-depth/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: OPTIONAL per the project constitution (fast iteration). One targeted Vitest
task covers the fragile seam (the contour style-URL builder) and is marked `(OPTIONAL)`.
Everything else is validated via quickstart.md.

**Organization**: Grouped by user story. This feature edits the existing 001 app in
place - the shared foundation (config, store, editor, sandbox, tab shell, notice) already
exists, so Setup/Foundational are minimal. Setup + US1 = the MVP.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1 / US2 / US3 (user-story phases only)

## Path Conventions

Single client-side project rooted at the repo (per plan.md): `src/`, `tests/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Start from a known-good baseline before editing.

- [ ] T001 Confirm the baseline builds and tests pass before changes: run `npm install`, `npm run build`, and `npm run test` and verify all green (establishes the pre-002 known-good state)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: None required. The 001 foundation (`src/config.ts`, `src/state/store.ts`,
`src/panels/editor.ts`, `src/panels/sandbox.ts`, `src/panels/tabShell.ts`,
`src/ui/notice.ts`, `src/explain/content.ts`) already provides every shared primitive
this feature builds on. No new blocking infrastructure is introduced.

**Checkpoint**: Existing foundation is sufficient - user stories can begin.

---

## Phase 3: User Story 1 - Topographic contours (Priority: P1) 🎯 MVP

**Goal**: Expose ALS contour lines as an on/off control in the 3D features tab, wired
end-to-end so the setting reaches the style request and the map redraws.

**Independent Test**: In the 3D tab, toggle contours on → contour lines appear; off →
they disappear; edit the value in code + Apply → map matches the control. No other story
required.

### Implementation for User Story 1

- [ ] T002 [US1] Add `ContourDensity` type (`'Off' | 'Low' | 'Medium' | 'High'`) and a `contourDensity: ContourDensity` field on the `MapView` interface in `src/types.ts` (place beside `terrain3d`/`buildings3d`, the style-request features), per data-model.md
- [ ] T003 [US1] Add `contourDensity: 'Off'` to `DEFAULT_MAP_VIEW` in `src/config.ts` (depends on T002)
- [ ] T004 [P] [US1] In `src/als/basemap.ts`, type `contourDensity` as `ContourDensity` and ensure `buildStyleUrl` emits `contour-density=<level>` only for `Low`/`Medium`/`High` and omits the param when `'Off'` (add an intent comment; this closes the "field never reached the builder" gap), per contracts/contour-style.md
- [ ] T005 [US1] In `src/map/threeD.ts`, add `contourDensity` to `ThreeDPatch` and update `apply3D` so a contour change is treated as a style-request change (`styleChanged` → `map.applyBasemap(view)`), matching terrain/buildings (depends on T002)
- [ ] T006 [US1] In `src/panels/threeDTab.ts`, add a contours on/off control (Web Awesome switch) alongside terrain/buildings, mapping on→`'Medium'` and off→`'Off'`; extend `ThreeDInput` and `codeFor` to include contours; keep the control and code region in sync via the existing store subscription (depends on T002, T005)
- [ ] T007 [US1] In `src/explain/content.ts`, add a contours explanation + reference link (`https://docs.aws.amazon.com/location/latest/developerguide/maps-topographic-map.html`) describing `contour-density` and its Low/Medium/High levels, using the explanation structure current at implementation time (depends on T006)
- [ ] T008 [P] [US1] (OPTIONAL) Vitest in `tests/unit/basemap.test.ts`: assert `buildStyleUrl` includes `contour-density=Medium` when `contourDensity: 'Medium'` and omits `contour-density` entirely when `'Off'` (depends on T004)

**Checkpoint**: Contours toggle on/off, redraw the map, and stay in sync between the HTML control and the code region. MVP is demoable.

---

## Phase 4: User Story 2 - Richer code context (Priority: P2)

**Goal**: Show each tab's editable line inside its enclosing call and nearby real code,
keeping the surrounding scaffold locked.

**Independent Test**: Open each tab → the editable region sits inside visible enclosing
code; the scaffold cannot be edited; a valid edit behaves exactly as before.

### Implementation for User Story 2

- [ ] T009 [P] [US2] Expand the locked scaffold (the `PREFIX`/`SUFFIX` constants) in `src/panels/basemapTab.ts` so the editable region shows within its enclosing `setBasemap(...)` call and brief surrounding context; verify the editable region and lock behaviour still work
- [ ] T010 [P] [US2] Same for `src/panels/poiTab.ts` (`searchPois(...)` context)
- [ ] T011 [US2] Same for `src/panels/threeDTab.ts` (`set3D(...)` context), including the contours line added in US1 (depends on T006 - same file)

**Checkpoint**: All three tabs show fuller code context; editing behaviour unchanged.

---

## Phase 5: User Story 3 - Deeper ALS + MapLibre explanations (Priority: P3)

**Goal**: Replace each tab's single-summary explanation with structured, multi-paragraph
content that names both the ALS request and how MapLibre consumes it.

**Independent Test**: Each tab's explanation covers the ALS request and the MapLibre
consumption step, renders as more than one block, and keeps a working reference link.

### Implementation for User Story 3

- [ ] T012 [US3] In `src/types.ts`, change the `Explanation` interface from `summary: string` to `paragraphs: string[]` (keep `referenceLabel`/`referenceUrl`), per data-model.md
- [ ] T013 [US3] Update `renderExplanation` in `src/panels/tabShell.ts` to render each entry in `paragraphs` as its own block element (text content, no raw HTML) while preserving the reference link (depends on T012)
- [ ] T014 [US3] Rewrite the explanations in `src/explain/content.ts` (basemap, poi, threeD, and contours) as structured `paragraphs` that name the ALS request/response and how MapLibre consumes the result for each capability (depends on T012, T013; and T007 - same file)

**Checkpoint**: Every tab has a richer, correctly-formatted explanation with a reference link.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the whole feature end-to-end.

- [ ] T015 Run `npm run build` (tsc + vite) and `npm run test`; confirm all green
- [ ] T016 Run the `specs/002-contours-learning-depth/quickstart.md` validation for US1, US2, US3, including the contour failure-path check (map never blanks/freezes)
- [ ] T017 Manual sanity: enable contours + terrain + buildings together and confirm a single combined style request renders all three

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately.
- **Foundational (Phase 2)**: None (reuses the 001 foundation).
- **User Stories (Phase 3-5)**: All build on the existing app; can proceed in priority order (P1 → P2 → P3) or in parallel with care around shared files (below).
- **Polish (Phase 6)**: After the desired user stories are complete.

### User Story Dependencies

- **US1 (P1)**: Self-contained; the MVP. No dependency on US2/US3.
- **US2 (P2)**: Independent, but T011 edits `threeDTab.ts` which US1 (T006) also edits - sequence T006 before T011.
- **US3 (P3)**: Independent, but T014 edits `content.ts` which US1 (T007) also edits - sequence T007 before T014. US1's explanation (T007) uses whatever `Explanation` shape exists when it runs; US3 (T012) then migrates all entries to `paragraphs`.

### Shared-file cautions (do not [P] across these)

- `src/types.ts`: T002 (US1, adds `contourDensity`) and T012 (US3, changes `Explanation`) edit different parts of the same file - run sequentially.
- `src/panels/threeDTab.ts`: T006 (US1) then T011 (US2).
- `src/explain/content.ts`: T007 (US1) then T014 (US3).

### Parallel Opportunities

- Within US1: T004 (basemap.ts) and, after T004, T008 (test) are [P] relative to the threeD.ts/threeDTab.ts work, given T002 is done.
- Within US2: T009 (basemapTab) and T010 (poiTab) are [P] with each other; T011 waits on T006.

---

## Parallel Example: User Story 2

```bash
# basemapTab and poiTab context expansions touch different files - run together:
Task: "Expand locked scaffold in src/panels/basemapTab.ts"
Task: "Expand locked scaffold in src/panels/poiTab.ts"
# threeDTab waits for US1's contours line (T006).
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (baseline green).
2. Phase 3: US1 - contours wired end-to-end.
3. **STOP and VALIDATE**: toggle contours on/off + code apply; demo the MVP.

### Incremental Delivery

1. Setup → US1 (MVP: working contours) → validate/demo.
2. US2 (richer code context) → validate/demo.
3. US3 (deeper explanations) → validate/demo.
4. Polish → full quickstart validation.

---

## Notes

- [P] = different files, no dependency on an incomplete task.
- Watch the three shared files called out above; they are the only cross-story ordering constraints.
- Keep ALS calls raw and readable; contours are one ALS style parameter with one visible effect (Constitution III).
- Errors (bad code, failed/empty style request) must always route to `notice` and preserve the last working map (SC-002, FR-007).
- Explain proposed changes before editing code; surface tips/lessons as you go (Constitution workflow).
