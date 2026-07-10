# Implementation Plan: Live Request Preview & Complete Documentation Links

**Branch**: `003-request-preview-doc-links` | **Date**: 2026-07-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-request-preview-doc-links/spec.md`

## Summary

Two learning-experience additions to the existing ALS Map Explorer, no new tab and no new
AWS Location Service API:

1. **Live request preview (US1, P1)** - on the POI and 3D tabs, show a read-only preview of
   the exact request the app will send, updating live as controls or the code region change.
   POI shows method + endpoint URL + JSON body; 3D shows the style-descriptor URL with its
   current query parameters. The API key is always masked. Fidelity comes for free by
   reusing the existing request builders (`als/places.ts#buildSearchRequest`, which already
   returns a pure `{ url, body }`, and `als/basemap.ts#buildStyleUrl`); the preview is a
   formatted, key-masked view of their output.
2. **Complete documentation links (US2, P2)** - replace each tab's single reference link with
   a curated list of direct, labelled links to the specific ALS/MapLibre docs. Extends the
   `Explanation` model from one link to a list.

Technical approach: add one small pure module (`als/preview.ts`) that masks the API key and
formats the preview text, wire a read-only preview element into the POI and 3D tabs that
re-renders on store changes, and generalise the explanation link rendering. Reuse every
existing seam (the store's `subscribe`, the request builders, the tab shell).

## Technical Context

**Language/Version**: TypeScript 5.x (ES2022), modern evergreen browsers - unchanged.

**Primary Dependencies**: `maplibre-gl` ^5.24, `codemirror` ^6, `@awesome.me/webawesome`; dev `vite` ^6, `typescript`, `vitest`. No new dependency.

**Storage**: N/A. Session-only in-memory state (`SettingsStore`).

**Testing**: Vitest for the fragile seam. This feature adds high-value pure tests: API-key masking never leaks the key, and the preview matches the real request builders' output.

**Target Platform**: Modern desktop browsers - unchanged.

**Project Type**: Single-project client-side static web app - unchanged.

**Performance Goals**: Preview updates within ~1s of a control change (SC-001) - trivially met, it is a synchronous string build on the existing store-change notification.

**Constraints**: The API key MUST be masked when composing the preview string, never merely hidden (FR-005, SC-002). The preview MUST reuse the real request builders so it cannot drift from what is sent (FR-007).

**Scale/Scope**: Same single page, same three tabs. Touches the explanation model + render, the POI and 3D tabs (add preview), a new pure preview/mask module, content, and CSS.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Status |
|-----------|------------|--------|
| I. Learning-First (NON-NEGOTIABLE) | The preview makes the actual ALS request visible as the learner drives it - the purest expression of the learning goal; curated deep links point straight at the authoritative docs. | PASS |
| II. Fast Iteration Over Perfection | Reuses existing builders and store; one small pure module + presentation changes; no new dep/API/tab. Sliced so US1 ships alone. | PASS |
| III. AWS Location Service as the Backbone | The preview is literally the raw ALS request (method/URL/body, style URL) built by the same code that sends it. | PASS |
| IV. MapLibre for Rendering | No rendering change; MapLibre docs are added as reference links only. | PASS |
| V. Readable, Documented Integration Points | Preview/masking centralised in one pure `als/preview.ts`; key handling explicit and commented. | PASS |

**Result**: PASS - no violations. Complexity Tracking not required.

*Post-design re-check (after Phase 1): still PASS. The security-sensitive part (key masking)
is isolated in one pure, unit-tested function that operates on the built URL string, so the
"never render the key" rule is enforced in one auditable place rather than scattered across
the tabs.*

## Project Structure

### Documentation (this feature)

```text
specs/003-request-preview-doc-links/
├── plan.md              # This file
├── research.md          # Phase 0 output (incl. the curated doc-link inventory)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── request-preview.md  # Internal contract: preview shape + masking rule
├── checklists/
│   └── requirements.md  # Spec quality checklist (from /speckit-specify)
└── tasks.md             # Phase 2 output (/speckit-tasks - NOT created here)
```

### Source Code (repository root) - files touched by this feature

```text
src/
├── types.ts             # MODIFY: Explanation gains `references: ReferenceLink[]` (replaces referenceLabel/Url); add ReferenceLink type
├── als/
│   ├── preview.ts       # NEW: pure helpers - maskApiKey(url), poiRequestPreview(query, center), styleRequestPreview(view)
│   ├── places.ts        # REUSE: buildSearchRequest already returns { url, body } (no change expected)
│   └── basemap.ts       # REUSE: buildStyleUrl already returns the URL (no change expected)
├── panels/
│   ├── tabShell.ts      # MODIFY: renderExplanation renders a list of links; expose a read-only `preview` mount
│   ├── poiTab.ts        # MODIFY: render + live-update the POI request preview on store changes (US1)
│   ├── threeDTab.ts     # MODIFY: render + live-update the 3D style-URL preview on store changes (US1)
│   ├── basemapTab.ts    # MODIFY: curated links (US2); optional style-URL preview (P-optional)
│   └── tab.module.css   # MODIFY: styles for the preview block and the link list
├── explain/
│   └── content.ts       # MODIFY: curated multi-link references per tab (US2)
└── (tests)
    tests/unit/preview.test.ts  # NEW: maskApiKey never leaks the key; preview matches buildSearchRequest/buildStyleUrl output
```

**Structure Decision**: No structural change beyond one new pure module (`als/preview.ts`)
that sits alongside the existing ALS seams. Preview logic is pure and testable; the tabs only
render its output and subscribe to the store for live updates. Honors the 001/002 layout.

## Complexity Tracking

No constitution violations; no justifications required.
