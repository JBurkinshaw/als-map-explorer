# Feature Specification: Topographic Contours & Deeper Learning Context

**Feature Branch**: `002-contours-learning-depth`

**Created**: 2026-07-09

**Status**: Draft

**Input**: User description: "Enhance the ALS Map Explorer with topographic contour lines plus two learning-experience improvements: (1) expose AWS Location Service contour lines as a control in the 3D features tab, wired end-to-end so the setting reaches the style request; (2) show more surrounding real code around each tab's editable region, not just one line; (3) expand each tab's explanation to describe how the AWS Location Service REST API and MapLibre integrate for that capability."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Learn topographic contours as a 3D style feature (Priority: P1)

A learner opens the 3D features tab and finds a contours control alongside the
existing terrain and buildings controls. Turning contours on redraws the basemap
with topographic contour lines. The learner can see, in the editable code and the
explanation, that contours are requested the same way terrain and buildings are:
by adding a parameter to the AWS Location Service style request and reloading the
style. Turning it back off returns the basemap to its previous state.

**Why this priority**: This is the one net-new capability in this feature. It is a
self-contained, independently demonstrable slice that reinforces the core lesson
(style-request 3D features) already taught by terrain and buildings, and it is the
capability the learner explicitly asked to add.

**Independent Test**: Enable the contours control in the 3D tab and confirm the map
redraws with contour lines and the code/explanation reflect the change; disable it
and confirm the map returns to its prior appearance. Requires none of the other
user stories to be present.

**Acceptance Scenarios**:

1. **Given** the 3D features tab is open with contours off, **When** the learner turns contours on, **Then** the basemap reloads showing topographic contour lines and the editable code updates to reflect the enabled setting.
2. **Given** contours are on, **When** the learner turns contours off, **Then** the basemap reloads without contour lines and the last working map is preserved (no blank/frozen map).
3. **Given** the contours control is present, **When** the learner reads the tab, **Then** a plain-language explanation and a reference link describe contours as an AWS Location Service style-request feature.
4. **Given** the learner edits the contours setting in the code region and applies it, **When** the code runs, **Then** the map reflects the edited value, matching the behaviour of the HTML control.

---

### User Story 2 - See each capability in fuller code context (Priority: P2)

A learner viewing any tab sees more of the real surrounding code than a single
editable line, so the one editable expression is framed by the request/response
context it lives in. The learner can still only edit the intended region; the
surrounding scaffold remains locked and readable.

**Why this priority**: A single editable line teaches the parameter but hides how it
fits into the actual call. More visible context raises comprehension (Learning-First)
without adding a new capability, so it ranks below the new contours feature but above
prose-only changes.

**Independent Test**: Open each tab and confirm the code region shows meaningful
surrounding code (not just one line), that the intended region is still editable, and
that the surrounding scaffold cannot be edited. Works whether or not contours exist.

**Acceptance Scenarios**:

1. **Given** any capability tab, **When** the learner views the code region, **Then** the editable line is shown within enough surrounding real code to understand the call it belongs to.
2. **Given** the expanded code context, **When** the learner attempts to edit the locked scaffold, **Then** the edit is prevented and only the intended region accepts changes.
3. **Given** the expanded code context, **When** the learner applies a valid edit, **Then** the capability behaves exactly as before the context was expanded.

---

### User Story 3 - Understand how ALS and MapLibre integrate per capability (Priority: P3)

A learner reads a richer, multi-paragraph explanation in each tab that describes how
the AWS Location Service REST API and MapLibre work together for that capability -
what request is made, what comes back, and how MapLibre consumes it - rather than a
single short summary.

**Why this priority**: This deepens the teaching value that the constitution treats as
non-negotiable, but it is prose that layers on top of already-working capabilities, so
it is the safest to defer and the least likely to block the others.

**Independent Test**: Open each tab and confirm the explanation covers the ALS request
and the MapLibre consumption of the result, in more than a single short paragraph, with
at least one reference link. Independent of the other stories.

**Acceptance Scenarios**:

1. **Given** any capability tab, **When** the learner reads the explanation, **Then** it describes both the AWS Location Service request/response and how MapLibre uses the result for that capability.
2. **Given** a richer explanation, **When** it is displayed, **Then** multi-paragraph or otherwise structured formatting renders correctly (not as one undifferentiated block) and reference links remain present and working.

---

### Edge Cases

- What happens when the contour style request fails or returns no contour data (for example, an unsupported region or a transient error)? The last working map MUST be preserved and an informative notice shown, consistent with existing error handling.
- How does contours interact with basemap styles that do not render contours meaningfully? The control still applies the request; if no contours appear, the map remains usable and the behaviour is explained.
- What happens when a learner enables contours together with terrain and/or buildings? All enabled style-request features are combined into a single style request and applied together.
- How is the expanded code context kept in sync with the HTML controls, so editing one does not desynchronise the other?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The 3D features tab MUST present a topographic contours control positioned and styled consistently with the existing terrain and buildings controls.
- **FR-002**: Enabling or disabling contours MUST reload the basemap so contour lines appear or disappear accordingly, using the same style-request mechanism as terrain and buildings.
- **FR-003**: The contours setting MUST be carried end-to-end from the control through application state to the style request, so the setting actually takes effect (no dead control).
- **FR-004**: The contours setting MUST persist across basemap and other 3D changes for the duration of a session, and MUST be re-applied when the style reloads.
- **FR-005**: The 3D tab MUST pair contours with editable code, an HTML input, a plain-language explanation, and a reference link, matching the existing capability pattern.
- **FR-006**: Editing the contours value in the code region and applying it MUST change the map identically to using the HTML control, and the two MUST stay in sync.
- **FR-007**: A failed or empty contour request MUST NOT blank or freeze the map; the last working map MUST be preserved and a notice shown.
- **FR-008**: Each capability tab MUST display the editable region within additional surrounding real code that shows the call it belongs to.
- **FR-009**: Only the intended region MUST remain editable; the expanded surrounding scaffold MUST stay locked.
- **FR-010**: Expanding code context MUST NOT change any capability's runtime behaviour for a given valid edit.
- **FR-011**: Each capability tab's explanation MUST describe both the AWS Location Service request/response and how MapLibre consumes the result for that capability.
- **FR-012**: Explanations MUST support multi-paragraph or otherwise structured formatting that renders as distinct blocks, and MUST retain at least one working reference link per tab.

### Key Entities *(include if feature involves data)*

- **Contours setting**: A per-session map-view attribute for topographic contour lines, alongside the existing terrain, buildings, globe, and pitch attributes. Modeled as a density level (off, or one of the density levels the service supports); the on/off control resolves "on" to a sensible default density and "off" to no contours. The level-based model is retained so a future density selector is additive. Feeds the style request.
- **Capability explanation**: The per-tab teaching content, extended from a single summary to structured, multi-paragraph content plus reference link(s).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A learner can toggle contours on and off from the 3D tab and see the basemap change accordingly on every toggle, with no case where the setting has no effect.
- **SC-002**: Enabling contours never results in a blank or frozen map; in 100% of failure cases the previous working map remains visible with a notice.
- **SC-003**: Editing the contours value in code and applying it produces the same map result as the HTML control in 100% of matching cases.
- **SC-004**: In every capability tab, the code region shows the editable line within at least its enclosing call, and the learner can identify the request the edit belongs to without leaving the tab.
- **SC-005**: In every capability tab, the explanation names both the AWS Location Service request and the MapLibre consumption step, and renders as more than one paragraph/block with a working reference link.

## Assumptions

- Contours are exposed as a simple on/off control (matching terrain and buildings) rather than a graduated density selector; if a density value is required by the style request, a sensible fixed default is used and noted. A density selector is out of scope for this feature.
- Topographic contours are treated as a style-request 3D feature (reload the style), consistent with how terrain and buildings already work, not as a runtime-only setting.
- The existing hybrid editable/locked code-region model and the existing notice/error-handling behaviour (preserve the last working map) are reused, not redesigned.
- These enhancements extend the existing single feature (ALS Map Explorer) and its three tabs (basemap, POI, 3D); no new tab or new AWS Location Service API is introduced.
- The API key and region continue to come from existing configuration; no changes to credential handling.
