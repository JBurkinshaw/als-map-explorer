# Research: Topographic Contours & Deeper Learning Context

Phase 0 research for feature 002. The only genuine unknown was how ALS exposes
contour lines; US2/US3 reuse existing mechanisms and needed no external research.

## R1. ALS `contour-density` parameter: values and dependencies

**Decision**: Model contours as a style-request feature using the ALS style-descriptor
parameter `contour-density`, with valid values **`Low` | `Medium` | `High`**. Expose it
in the UI as an on/off control where "on" sends a fixed default of **`Medium`** and
"off" omits the parameter entirely. Contours do **not** require `terrain=Terrain3D`;
they render independently and simply combine well with 3D terrain.

**Rationale**:
- AWS documents `contour-density` as its own style-descriptor URI parameter (alongside
  `terrain`, `buildings`, `color-scheme`, `traffic`, `political-view`, `travel-modes`),
  accepting three density levels: Low, Medium, High.
- The Topography guide describes contour density as a standalone feature ("The contour
  density feature visualizes contour lines to represent terrain steepness and elevation
  variation") and notes 3D terrain can be *combined* with it "for enhanced elevation
  precision and visual context" - i.e. combination is optional, not required.
- This makes contours a drop-in sibling of the existing `terrain`/`buildings` style
  toggles: same mechanism (rebuild style URL + `setStyle`), same re-apply-on-`style.load`
  behaviour, same error path.
- `src/als/basemap.ts` already declares `contourDensity?: string` and emits
  `params.set('contour-density', opts.contourDensity)` when present. So the builder is
  ready; only the state wiring is missing. This is a "finish the wiring" change, not a
  new abstraction.

**On/off vs density selector**: The spec scopes the control to on/off with a fixed
default (Assumptions). Research confirms a Low/Medium/High selector would be a small,
genuinely educational extension (it directly surfaces the ALS density levels). It is
deliberately deferred to keep this slice minimal (Constitution II, YAGNI). Because "on"
already sends a real density value, upgrading to a selector later is additive and does
not change the wiring being built now.

**Alternatives considered**:
- *Runtime-only contour rendering in MapLibre* (custom layer): rejected - contours are a
  first-class ALS style feature; reimplementing them client-side would violate
  Constitution III (ALS as the backbone) and hide the lesson.
- *Requiring terrain to be on before contours*: rejected - the docs show contours render
  independently; coupling them would be an artificial constraint and reduce the teaching
  clarity of "one style parameter, one visible effect".

**References**:
- Topography (contour density: Low/Medium/High): https://docs.aws.amazon.com/location/latest/developerguide/maps-topographic-map.html
- How to create topographic maps: https://docs.aws.amazon.com/location/latest/developerguide/how-to-create-topographic-maps.html
- Enhanced map styling announcement (Apr 2026): https://aws.amazon.com/about-aws/whats-new/2026/04/amazon-location-enhanced-map-styling/

## R2. Showing richer code context (US2)

**Decision**: Grow the locked scaffold (prefix/suffix) shown around each tab's editable
region so the editable expression appears inside its enclosing call and nearby context.
Keep the same single editable region per tab.

**Rationale**: `panels/editor.ts` already computes the editable window as
`[prefixLen, docLen - suffixLen]` and recomputes `editableEnd` on every change, so a
longer prefix/suffix "just works" with no editor engine change. The lock boundaries are
purely string lengths. This satisfies US2 by editing the per-tab `PREFIX`/`SUFFIX`
constants, not the editor.

**Alternatives considered**: Multiple editable regions per tab - rejected as scope creep;
one editable region with more visible context meets the requirement (FR-008/009).

## R3. Structured, multi-paragraph explanations (US3)

**Decision**: Extend the `Explanation` type to carry structured content (multiple
paragraphs) rather than a single `summary` string, and update `renderExplanation` in
`panels/tabShell.ts` to render each paragraph as its own block while preserving the
reference link.

**Rationale**: Today `renderExplanation` injects `summary` via `textContent` into a
single `<p>`, so newlines/markup are lost (confirmed in 001 code). Supporting distinct
blocks requires a type + render change, which is small and localized. Content stays as
data (no raw HTML injection), keeping rendering safe.

**Alternatives considered**: Rendering a markdown string - rejected to avoid pulling in a
markdown dependency (Constitution II, minimal deps) for what is a handful of paragraphs;
an array of paragraph strings is sufficient and safe.

## Open questions

None. All spec assumptions are consistent with these findings; no `[NEEDS CLARIFICATION]`
markers remain.
