# Implementation Plan: Topographic Contours & Deeper Learning Context

**Branch**: `002-contours-learning-depth` | **Date**: 2026-07-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-contours-learning-depth/spec.md`

## Summary

Extend the existing ALS Map Explorer (feature 001) with one net-new capability and
two learning-experience improvements, without adding a new tab or a new AWS Location
Service API:

1. **Topographic contours (US1, P1)** - expose ALS contour lines as a control in the
   existing 3D features tab. Contours are a **style-request** feature: the
   `contour-density` parameter is added to the ALS style-descriptor URL and the style
   is reloaded via `map.setStyle`, exactly like the existing `terrain` and `buildings`
   controls. The `als/basemap.ts` URL builder already accepts `contourDensity`; the gap
   is purely the wiring from control → `MapView` state → the builder, which this plan
   closes end-to-end.
2. **Richer code context (US2, P2)** - grow each tab's locked scaffold so the single
   editable region is shown inside its enclosing call, using the existing
   prefix/editable/suffix model in `panels/editor.ts` (offsets already recompute, so no
   editor engine changes are needed).
3. **Deeper explanations (US3, P3)** - extend the per-tab explanation from a single
   plain-text summary to structured, multi-paragraph content that names both the ALS
   request and how MapLibre consumes it, by extending the `Explanation` type and
   `renderExplanation`.

Technical approach: reuse every existing seam. No new dependencies, no new API, no new
tab. The contour control follows the established capability pattern (HTML input +
editable code + explanation + reference link) and the established style-request path.

## Technical Context

**Language/Version**: TypeScript 5.x (ES2022 modules), modern evergreen browsers - unchanged from 001.

**Primary Dependencies**: `maplibre-gl` ^5.24, `codemirror` ^6 (+ state/view/lang-javascript), `@awesome.me/webawesome`; dev: `vite` ^6, `typescript`, `vitest`. No new dependency introduced by this feature.

**Storage**: N/A. Session-only in-memory state (the `SettingsStore`). API key/region via existing `VITE_ALS_API_KEY` / `VITE_AWS_REGION`.

**Testing**: Vitest for fragile seams only. This feature adds one small, high-value unit test: the style-URL builder emits `contour-density` when (and only when) contours are set. Tests remain OPTIONAL per the constitution.

**Target Platform**: Modern desktop browsers - unchanged.

**Project Type**: Single-project, client-side static web application - unchanged.

**Performance Goals**: Unchanged from 001 (basemap < 5s; input→map/code < 1s; valid code apply → map < 2s). Enabling contours triggers a `setStyle` reload comparable to the existing terrain/buildings reload.

**Constraints**: Pure client-side. A failed/empty contour style request MUST preserve the last working map and route to the notice (reuses the 001 error path). Contour density is applied as a style-request feature and re-applied on `style.load` alongside the existing runtime settings.

**Scale/Scope**: Same single page, same three tabs. This feature touches state (`MapView`), the 3D tab, the explanation content/render layer, and the code-context scaffolding in all three tabs.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Status |
|-----------|------------|--------|
| I. Learning-First (NON-NEGOTIABLE) | Contours ship with a plain-language explanation + reference link (FR-005); US2/US3 exist specifically to deepen comprehension (more visible code, richer ALS↔MapLibre prose). | PASS |
| II. Fast Iteration Over Perfection | Reuses all existing seams; no new dep/API/tab; contours scoped to on/off (density selector deferred). Sliced by priority so US1 ships as an MVP on its own. | PASS |
| III. AWS Location Service as the Backbone | Contours are an ALS style-descriptor feature (`contour-density`), applied by rebuilding the raw ALS style URL - the request stays visible to the learner. | PASS |
| IV. MapLibre for Rendering | Contours applied through MapLibre `setStyle` (same mechanism as terrain/buildings); no custom rendering. | PASS |
| V. Readable, Documented Integration Points | `contourDensity` flows through the centralized `config.ts` default and the single style-URL builder; the new seam is commented with intent. | PASS |

**Result**: PASS - no violations. Complexity Tracking not required.

*Post-design re-check (after Phase 1): still PASS. The design adds no abstraction - it
finishes an already-half-built wiring (`contourDensity` existed in the URL builder but
never reached it) and extends two presentation seams. The one judgment call (on/off
control with a fixed `Medium` density default rather than exposing Low/Medium/High) is
recorded in research.md with the density-selector noted as a future enhancement, so the
YAGNI/fast-iteration value is honored by choice.*

## Project Structure

### Documentation (this feature)

```text
specs/002-contours-learning-depth/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── contour-style.md # ALS style-request contract for contour-density (consumed)
├── checklists/
│   └── requirements.md  # Spec quality checklist (from /speckit-specify)
└── tasks.md             # Phase 2 output (/speckit-tasks - NOT created here)
```

### Source Code (repository root) - files touched by this feature

```text
src/
├── types.ts             # MODIFY: add `contourDensity` to MapView; extend `Explanation` for structured content
├── config.ts            # MODIFY: add `contourDensity` to DEFAULT_MAP_VIEW
├── als/
│   └── basemap.ts       # VERIFY/COMMENT: already sets `contour-density` from opts.contourDensity (no logic change)
├── map/
│   ├── threeD.ts        # MODIFY: add contourDensity to ThreeDPatch; treat as style-request (styleChanged) in apply3D
│   └── mapController.ts  # (no change expected: applyBasemap already rebuilds the URL from the full MapView)
├── panels/
│   ├── threeDTab.ts     # MODIFY: add contours control + codeFor + ThreeDInput; expand code context
│   ├── basemapTab.ts    # MODIFY: expand code context (US2)
│   ├── poiTab.ts        # MODIFY: expand code context (US2)
│   ├── editor.ts        # (no engine change: prefix/editable/suffix offsets already recompute)
│   └── tabShell.ts      # MODIFY: renderExplanation supports structured multi-paragraph content (US3)
├── explain/
│   └── content.ts       # MODIFY: richer, structured explanations naming ALS request + MapLibre consumption (US3); add contours entry
└── (tests)
    tests/unit/basemap.test.ts  # MODIFY/ADD: assert contour-density appears when contourDensity set, absent otherwise
```

**Structure Decision**: No structural change. This feature edits existing files in
place, honoring the 001 layout (integration seams in `als/`/`map/`, learning UI in
`panels/`/`explain/`, config centralized in `config.ts`). No new directories, no new
top-level modules.

## Complexity Tracking

No constitution violations; no justifications required.
