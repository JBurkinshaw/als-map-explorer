# Feature Specification: Live Request Preview & Complete Documentation Links

**Feature Branch**: `003-request-preview-doc-links`

**Created**: 2026-07-09

**Status**: Draft

**Input**: User description: "Deepen the teaching notes with (1) a curated list of specific, direct documentation links per capability tab (replacing the single link), and (2) a live, read-only preview of the actual API request that will be sent, on the POI and 3D tabs, updating as controls/code change, with the API key always masked."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the actual request that will be sent (Priority: P1)

A learner adjusting the POI or 3D controls (or editing the code) sees a read-only
preview of the exact request the app will send to AWS Location Service, updating live
as they change inputs. For POI, the preview shows the HTTP method, the endpoint URL, and
the JSON request body. For 3D, it shows the Maps style-descriptor URL with its current
query parameters. The API key is always masked, never shown. This lets the learner
connect the controls they touch to the real ALS request, which is the core teaching goal.

**Why this priority**: Seeing the real request as it changes is the single most direct way
to teach how the controls map to the ALS API - it is the project's learning-first purpose
made literal. It is a self-contained, independently demonstrable capability.

**Independent Test**: On the POI tab, change the radius/categories/mode and confirm the
previewed method, URL, and body update to match; on the 3D tab, toggle terrain/contours
and confirm the previewed style URL's parameters update. Confirm the key is masked in
every state. Requires neither the documentation-links story nor anything else.

**Acceptance Scenarios**:

1. **Given** the POI tab in nearby mode, **When** the learner changes the radius or selected categories, **Then** the request preview updates live to show the method, the search-nearby endpoint URL, and a JSON body reflecting the new values.
2. **Given** the POI tab, **When** the learner switches from nearby to text mode, **Then** the preview switches to the search-text endpoint and a body appropriate to that mode.
3. **Given** the 3D tab, **When** the learner toggles terrain, buildings, or contours, **Then** the preview shows the style-descriptor URL with the corresponding query parameters added or removed.
4. **Given** any preview state on any tab, **When** the preview is displayed, **Then** the API key is masked (never rendered in full) while the rest of the request is shown.
5. **Given** a valid code edit applied via the code region, **When** it changes the request, **Then** the preview reflects the applied change (the preview matches what will actually be sent).
6. **Given** the preview, **When** the learner interacts with it, **Then** it is read-only (informational) and does not act as an additional control.

---

### User Story 2 - Reach the exact documentation for each capability (Priority: P2)

A learner reading any tab finds a curated set of direct links to the specific AWS Location
Service and MapLibre documentation for that capability, rather than a single general link.
Each link is clearly labelled and opens in a new tab so the learner keeps their place in
the app.

**Why this priority**: Deepens the teaching value, but it is additive reference material
layered on the existing explanation; it does not deliver a new interactive capability, so
it ranks below the live preview.

**Independent Test**: Open each tab and confirm it shows multiple clearly-labelled links to
the relevant ALS/MapLibre docs, each opening in a new tab. Independent of the preview story.

**Acceptance Scenarios**:

1. **Given** any capability tab, **When** the learner views the teaching note, **Then** it shows a curated list of multiple direct documentation links (not just one), each clearly labelled for what it covers.
2. **Given** the 3D tab, **When** the learner views its links, **Then** they include the relevant deep links (e.g. the 3D map guide, the topographic/contours guide, the style-descriptor parameter reference, and the MapLibre camera/projection docs).
3. **Given** the POI tab, **When** the learner views its links, **Then** they include the relevant deep links (e.g. search-nearby, search-text, the Places API reference, and the category list).
4. **Given** any documentation link, **When** the learner activates it, **Then** it opens in a new tab/window and does not navigate away from the app.

---

### Edge Cases

- How is the API key masked so it never appears in the preview, even though the real request includes it? (The preview must substitute a placeholder for the key value.)
- What does the POI preview show before any search has run, or when required inputs are empty? (It shows the request that *would* be sent for the current inputs, or a clear "nothing to send yet" state.)
- How does the preview stay accurate when the request is changed via the code region rather than the HTML controls? (Both paths must drive the same preview.)
- What happens if a documentation link's target moves or 404s? (Links are curated and checked at authoring time; a dead link degrades gracefully to still opening in a new tab.)
- Does the preview reflect a masked key without ever holding the unmasked key in the previewed text? (Masking must happen when building the preview string, not by hiding an element that still contains the secret.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The POI and 3D features tabs MUST each display a read-only preview of the actual request that will be sent to AWS Location Service for the current inputs.
- **FR-002**: The request preview MUST update live as the learner changes the tab's controls or applies an edit in the code region.
- **FR-003**: The POI preview MUST show the HTTP method, the endpoint URL, and the JSON request body, and MUST reflect the current search mode (nearby vs text) with the correct endpoint and body shape.
- **FR-004**: The 3D preview MUST show the Maps style-descriptor URL including its current query parameters (colour scheme, terrain, buildings, contour density).
- **FR-005**: The API key MUST be masked in every preview state and MUST never be rendered in full; masking MUST occur when composing the preview content, not merely by visually hiding text that still contains the key.
- **FR-006**: The preview MUST be read-only and MUST NOT function as an additional input control.
- **FR-007**: The preview MUST accurately match the request the app actually sends for the same inputs (fidelity between preview and real request).
- **FR-008**: Each capability tab MUST display a curated list of multiple, directly-labelled documentation links relevant to that capability, replacing the previous single link.
- **FR-009**: Documentation links MUST open in a new tab/window and MUST NOT navigate the learner away from the app.
- **FR-010**: The 3D tab's links MUST include direct references to the relevant ALS 3D/topographic guidance, the style-descriptor parameter reference, and the relevant MapLibre camera/projection documentation; the POI tab's links MUST include direct references to the nearby and text search operations, the Places API reference, and the category list.
- **FR-011**: The basemap tab MAY show a style-URL preview and MUST include curated documentation links; the preview for basemap is a nice-to-have and not required for this feature to be complete.

### Key Entities *(include if feature involves data)*

- **Reference link**: A labelled documentation pointer (display label + destination) belonging to a capability. A capability now has a list of these rather than one.
- **Request preview**: A derived, read-only representation of the pending request for a capability - for POI: method, endpoint URL, and JSON body; for 3D/basemap: the style-descriptor URL with query parameters. Always produced with the API key masked. Derived from the same session state that drives the real request, so the two cannot diverge.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Changing any control on the POI or 3D tab updates the request preview to match within about one second, in 100% of control changes.
- **SC-002**: The API key is masked in 100% of preview states across both tabs and all control combinations; the unmasked key never appears in the preview.
- **SC-003**: For any given set of inputs, the previewed request matches the request the app actually sends (same method, URL sans key, and body/parameters).
- **SC-004**: Every capability tab shows at least three directly-labelled documentation links, each opening in a new tab, covering the capability's ALS and (where relevant) MapLibre docs.
- **SC-005**: A learner can, without leaving the app, identify from the preview exactly which ALS request a given control drives.

## Assumptions

- The API key is masked with a fixed placeholder (e.g. `key=***`); the exact placeholder is an implementation detail. No partial reveal of the key is shown.
- The preview is informational/read-only; editing the request is still done through the existing code region and HTML controls, not the preview.
- Documentation links are curated and validated at authoring time; keeping them current is a maintenance task, not a runtime feature.
- The preview reuses the same request-construction logic that builds the real requests, so preview and reality stay in sync by construction rather than by duplicated formatting.
- This feature extends the existing single application and its three tabs; no new AWS Location Service API or new tab is introduced.
- Basemap request preview is optional for this feature; POI and 3D previews are required.
