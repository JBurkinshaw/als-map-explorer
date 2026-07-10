---

description: "Task list for Live Request Preview & Complete Documentation Links"
---

# Tasks: Live Request Preview & Complete Documentation Links

**Input**: Design documents from `/specs/003-request-preview-doc-links/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: OPTIONAL per the constitution, with one exception kept as a first-class task: the
API-key masking / preview-fidelity test, because it guards a security invariant (SC-002) and
the preview↔request fidelity (SC-003).

**Organization**: Grouped by user story. Edits the existing app in place; the 001/002
foundation (store, tab shell, request builders) already exists. Setup + US1 = the MVP.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1 / US2 (user-story phases only)

## Path Conventions

Single client-side project rooted at the repo (per plan.md): `src/`, `tests/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Start from a known-good baseline before editing.

- [X] T001 Confirm the baseline builds and tests pass: run `npm run build` and `npm run test` and verify all green (pre-003 known-good state)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: None required. The existing foundation already provides everything shared: the
`SettingsStore` (with `subscribe` for live updates), the tab shell, and the pure request
builders `buildSearchRequest` (`src/als/places.ts`) and `buildStyleUrl` (`src/als/basemap.ts`)
that the preview reuses for fidelity.

**Checkpoint**: Existing foundation is sufficient - user stories can begin.

---

## Phase 3: User Story 1 - Live request preview (Priority: P1) 🎯 MVP

**Goal**: On the POI and 3D tabs, show a read-only, live-updating preview of the exact request
the app will send, with the API key always masked.

**Independent Test**: Change POI controls → previewed method/URL/body update; toggle 3D
features → previewed style URL params update; the key shows as `***` in every state. Needs
neither US2 nor anything else.

### Implementation for User Story 1

- [X] T002 [US1] Create `src/als/preview.ts` (pure): `maskApiKey(url)` replacing the `key` query-param value with `***`; `poiRequestPreview(query, center)` returning `{ method: 'POST', url (masked), body (pretty JSON) }` from `buildSearchRequest`; `styleRequestPreview(view)` returning the masked `buildStyleUrl(view)`. Mask when composing the string, never emit the real key (per contracts/request-preview.md)
- [X] T003 [US1] In `src/panels/tabShell.ts`, add a read-only `preview` mount element to `TabShell` (placed after the editor, before the explanation) that tabs can populate
- [X] T004 [US1] In `src/panels/poiTab.ts`, render `poiRequestPreview(store.poiQuery, map.getCenter())` into the preview mount and refresh it inside the existing `store.subscribe(...)` callback so it updates live (depends on T002, T003)
- [X] T005 [US1] In `src/panels/threeDTab.ts`, render `styleRequestPreview(store.mapView)` into the preview mount and refresh it inside the existing `store.subscribe(...)` callback (depends on T002, T003)
- [X] T006 [P] [US1] Vitest `tests/unit/preview.test.ts`: assert `maskApiKey` output (and both preview builders) never contain a non-empty `config.apiKey` (SC-002); assert the previewed request matches `buildSearchRequest`/`buildStyleUrl` output minus the key (SC-003); assert nearby vs text mode produce the right endpoint/body (depends on T002)

**Checkpoint**: POI and 3D tabs show a live, key-masked request preview that mirrors what is sent.

---

## Phase 4: User Story 2 - Complete documentation links (Priority: P2)

**Goal**: Replace each tab's single reference link with a curated list of direct, labelled
ALS/MapLibre doc links, each opening in a new tab.

**Independent Test**: Each tab shows ≥3 clearly-labelled links opening in new tabs, covering
the capability's docs. Independent of US1.

### Implementation for User Story 2

- [X] T007 [US2] In `src/types.ts`, add `ReferenceLink { label: string; url: string }` and change `Explanation` to carry `references: ReferenceLink[]` (remove `referenceLabel`/`referenceUrl`), per data-model.md
- [X] T008 [US2] Update `renderExplanation` in `src/panels/tabShell.ts` to render `Explanation.references` as a list of anchors, each `target="_blank"` and `rel="noreferrer"` (depends on T007; same file as T003 - sequence after T003)
- [X] T009 [US2] Rewrite the `references` arrays in `src/explain/content.ts` using the curated inventory in research.md R2: basemap, poi, and threeD each get ≥3 direct ALS/MapLibre links (depends on T007)

**Checkpoint**: Every tab shows a curated set of direct documentation links opening in new tabs.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Styling, optional extras, and end-to-end validation.

- [X] T010 [P] Style the preview block and the reference-link list in `src/panels/tab.module.css` (read-only/monospace preview; tidy link list)
- [X] T011 [P] (OPTIONAL) Add a style-URL preview to `src/panels/basemapTab.ts` using `styleRequestPreview` (FR-011, nice-to-have)
- [X] T012 Run `npm run build` (tsc + vite) and `npm run test`; confirm all green including the masking/fidelity test
- [ ] T013 Run `specs/003-request-preview-doc-links/quickstart.md` for US1 + US2, confirming the API key is masked in every preview state and links open in new tabs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: None (reuses existing store, shell, and request builders).
- **User Stories (Phase 3-4)**: Build on the existing app; can proceed P1 → P2 or in parallel with care around shared files.
- **Polish (Phase 5)**: After the desired user stories.

### User Story Dependencies

- **US1 (P1)**: Self-contained; the MVP. No dependency on US2.
- **US2 (P2)**: Independent of US1, but shares two files - sequence around them (below).

### Shared-file cautions (do not [P] across these)

- `src/panels/tabShell.ts`: T003 (US1, add preview mount) and T008 (US2, change `renderExplanation`) touch the same file - run T003 before T008.
- `src/types.ts`: T007 (US2) must precede T008 and T009.

### Parallel Opportunities

- Within US1: T004 (poiTab) and T005 (threeDTab) are [P] with each other once T002/T003 land; T006 (test) is [P] after T002.
- In Polish: T010 (CSS) and T011 (optional basemap preview) are [P].

---

## Parallel Example: User Story 1

```bash
# After preview.ts (T002) and the shell mount (T003):
Task: "Render live POI request preview in src/panels/poiTab.ts"
Task: "Render live 3D style-URL preview in src/panels/threeDTab.ts"
Task: "Add preview masking/fidelity tests in tests/unit/preview.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (baseline green).
2. Phase 3: US1 - live request preview on POI + 3D, key masked.
3. **STOP and VALIDATE**: change controls, watch the preview track; confirm `key=***`. Demo.

### Incremental Delivery

1. Setup → US1 (MVP: live request preview) → validate/demo.
2. US2 (curated doc links) → validate/demo.
3. Polish (styling, optional basemap preview) → full quickstart validation.

---

## Notes

- [P] = different files, no dependency on an incomplete task.
- Two shared files (`tabShell.ts`, `types.ts`) are the only cross-story ordering constraints.
- Security: the API key MUST be masked when composing the preview string (FR-005); masking lives in one pure function (`maskApiKey`) and is unit-tested to never leak the key (SC-002).
- Fidelity: preview reuses the same builders that send the real requests, so it cannot drift (FR-007).
- Explain proposed changes before editing code; surface tips/lessons as you go (Constitution workflow).
