# Feature Specification: ALS Map Explorer

**Feature Branch**: `001-als-map-explorer`

**Created**: 2026-07-08

**Status**: Draft

**Input**: User description: "Build a web map application which builds on AWS location services and maplibre. It should display a 2d map with an Amazon basemap. It allow the user to experiment with AWS' POI service, filtering different POI types, and it will allow the user to switch between 2d and 3d (global) map modes. The aim of this to let the user see what is changing in the relevant parts of the code. There should be editable code window(s) for the relevant parts which update the map, and there should be HTML inputs to control the same settings. Lean heavily on the ALS and maplibre documentation (look up online as necessary), and expose the relevant parts to the user in simplified, plain language form, with a link the the relevant reference. Some of this may overlap with the constitution so refactor accordingly."

## Overview

An interactive, browser-based learning tool that renders an AWS Location Service
(ALS) basemap with MapLibre and lets the learner explore three capabilities:
viewing the basemap, searching and filtering points of interest (POIs), and
switching between a flat 2D map and a 3D globe. Its distinguishing feature is a
dual-control model: every setting can be changed either through simple HTML
inputs or by editing the live code that drives the map, and each relevant piece
is explained in plain language alongside a link to the authoritative ALS or
MapLibre reference.

The intended user is a developer learning how ALS and MapLibre fit together. This
directly serves the project's Learning-First principle (see the project
constitution); this spec does not restate those governance rules but assumes them.

## Clarifications

### Session 2026-07-08

- Q: What does "editing the code" in the code panels actually mean? → A: Hybrid - each panel shows a real code snippet, but only a small marked editable region (genuine ALS/MapLibre code) is applied; the surrounding scaffold is locked and read-only. The editable region runs in a controlled/sandboxed scope with access to the map.
- Q: Does the browser talk to AWS Location Service directly, or via a backend? → A: Pure client-side (static site, no backend); the browser calls ALS directly using an ALS API key.
- Q: How are the code panels structured? → A: A single tabbed code panel with one tab per capability (basemap, POI, 3D features); one capability's snippet is visible at a time, each with its own editable region, HTML inputs, explanation, and reference link.
- Q: What does the "3D" capability cover? → A: The full set of AWS Location Service 3D map features - 3D terrain, 3D buildings, globe view, and camera tilt (pitch) - not just a globe toggle. Terrain and buildings are enabled via the basemap style request; globe view (on by default in ALS styles) and tilt are runtime MapLibre settings. Reference: https://docs.aws.amazon.com/location/latest/developerguide/maps-3d-map.html

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the basemap and the code behind it (Priority: P1)

A learner opens the application and immediately sees a 2D map using an Amazon
(ALS) basemap. Beside the map is an editable code panel showing the exact
snippet that creates and styles the map, a set of HTML inputs for the same
settings (for example basemap style and starting location/zoom), and a
plain-language explanation with a link to the relevant ALS/MapLibre reference.
Changing an input updates both the map and the code snippet; editing the code and
applying it updates the map.

**Why this priority**: This is the core learning loop - "see the map, see the
code that makes it, change one, watch the other respond." Without it there is no
product. It is a complete, demonstrable MVP on its own.

**Independent Test**: Load the app with no other features enabled; confirm a 2D
Amazon basemap renders, the code panel shows the map-creation snippet, editing an
input changes the map and reflects in the code, editing and applying the code
changes the map, and the explanation links resolve to real reference pages.

**Acceptance Scenarios**:

1. **Given** the app is loaded, **When** the page finishes loading, **Then** a 2D
   map with an Amazon basemap is visible and centered at a sensible default
   location and zoom.
2. **Given** the basemap controls are visible, **When** the learner changes a
   basemap setting via an HTML input, **Then** the map updates and the code panel
   reflects the new value.
3. **Given** the code panel shows the map snippet, **When** the learner edits a
   supported value and applies the change, **Then** the map updates to match.
4. **Given** the code panel contains invalid code, **When** the learner applies
   it, **Then** the app shows a clear, non-fatal error and the last working map
   remains visible.
5. **Given** an explanation is shown for the basemap, **When** the learner clicks
   its reference link, **Then** the relevant ALS or MapLibre documentation page
   opens.

---

### User Story 2 - Explore and filter points of interest (Priority: P2)

The learner searches for POIs in the current map area using AWS's POI/places
capability and filters the results by POI type (for example food, lodging,
fuel). Matching POIs appear as markers on the map. As with the basemap, a code
panel shows the snippet that performs the POI request and rendering, HTML inputs
control the same query and filter settings, and a plain-language explanation with
a reference link accompanies it.

**Why this priority**: POI exploration is the primary "AWS Location Service"
learning payload beyond the basemap, but it depends on a working map (US1) to be
meaningful, so it is second.

**Independent Test**: With the basemap present, enter a POI query and/or select
POI type filters via inputs; confirm matching markers appear, changing filters
changes the visible markers, the code panel reflects the query, editing the code
changes the results, and the explanation link resolves.

**Acceptance Scenarios**:

1. **Given** a rendered map, **When** the learner runs a POI search, **Then**
   matching POIs are shown as markers on the map.
2. **Given** POI results are shown, **When** the learner selects or deselects a
   POI type filter, **Then** only POIs of the selected type(s) remain visible.
3. **Given** the POI code panel is visible, **When** the learner edits a supported
   query value and applies it, **Then** the POI results update accordingly.
4. **Given** a POI search returns no results, **When** the results render, **Then**
   the learner sees a clear "no results" indication rather than an error.
5. **Given** a POI marker is shown, **When** the learner selects it, **Then** basic
   details about that POI are displayed.

---

### User Story 3 - Control the map's 3D features (Priority: P3)

The learner enables and adjusts AWS Location Service's 3D map features: 3D
terrain, 3D buildings, globe view, and camera tilt (pitch). Controls toggle each
feature, the code panel shows the snippet responsible, and a plain-language
explanation with reference links explains what each feature does - and,
importantly, that terrain and buildings are turned on through the basemap style
request while globe view and tilt are runtime map settings.

**Why this priority**: This is a valuable but self-contained set of enhancements
layered on the working map; it is the least essential of the three to demonstrate
core value, so it is third. It is also the richest 3D learning payload.

**Independent Test**: With the basemap present, enable each 3D feature via its
input; confirm terrain and buildings render in 3D (with the camera tilted so
relief/height is visible), globe view toggles the projection, changing tilt
updates the viewing angle, the code panel reflects each setting, and editing the
code changes the map.

**Acceptance Scenarios**:

1. **Given** a 2D map, **When** the learner enables 3D terrain, **Then** elevation
   is rendered as a 3D surface (with the camera tilted so relief is visible) while
   preserving the current basemap and any POIs.
2. **Given** a map, **When** the learner enables 3D buildings, **Then** building
   footprints render with height and volume.
3. **Given** a map, **When** the learner toggles globe view, **Then** the map
   switches between a 3D globe and a flat projection.
4. **Given** a map, **When** the learner changes the camera tilt (pitch), **Then**
   the viewing angle updates accordingly.
5. **Given** the 3D code panel is visible, **When** the learner edits a supported
   value (e.g. terrain on/off or pitch) and applies it, **Then** the map updates
   and the corresponding control reflects the change.

---

### Edge Cases

- What happens when ALS credentials/configuration are missing or invalid? The app
  MUST show a clear, actionable message rather than a blank map.
- How does the app handle an ALS request that fails or times out (network error,
  throttling)? It MUST surface a readable error and keep the last working state.
- What happens when the learner enters code that is syntactically valid but
  produces no visible change or an unsupported operation? The app MUST avoid
  crashing and indicate that nothing changed or that the operation is unsupported.
- How does an HTML input change stay consistent with a conflicting manual code
  edit? The two controls MUST represent one shared setting so the last applied
  change wins and both views converge.
- What happens on a POI search over an area with a very large number of results?
  The app MUST remain responsive (for example by capping displayed results) and
  indicate when results were limited.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST render a 2D map using an Amazon (AWS Location Service)
  basemap on load, centered at a sensible default location and zoom.
- **FR-002**: The app MUST provide HTML inputs that let the learner change map
  settings (at minimum basemap style and view position/zoom) and reflect those
  changes on the map.
- **FR-003**: The app MUST provide a single tabbed code panel with one tab per
  exposed capability (basemap, POI, 3D features), showing that capability's
  relevant snippet. Within each snippet, a small marked region MUST be editable
  while the surrounding scaffold is locked (read-only); applying the edited region
  MUST run it in a controlled/sandboxed scope with access to the map and update
  the map accordingly.
- **FR-004**: HTML inputs and code panels MUST control the same underlying
  settings so that changing one is reflected in the other.
- **FR-005**: The app MUST let the learner search for POIs using AWS's POI/places
  capability and display matching results as markers on the map.
- **FR-006**: The app MUST let the learner filter POI results by POI type, showing
  only the selected type(s).
- **FR-007**: The app MUST let the learner control AWS Location Service 3D map
  features - 3D terrain, 3D buildings, globe view, and camera tilt (pitch) -
  while preserving the active basemap and POIs. Terrain and buildings are enabled
  via the basemap style request; globe view and tilt are runtime map settings.
- **FR-008**: For each exposed capability, the app MUST display a plain-language
  explanation of what the relevant code does, in simplified terms.
- **FR-009**: Each explanation MUST include a working link to the authoritative
  ALS or MapLibre reference for that capability.
- **FR-010**: The app MUST handle invalid code edits and failed/empty ALS requests
  gracefully, showing a clear message and preserving the last working map state.
- **FR-011**: The app MUST provide a way to reset any code panel to its original
  working snippet.
- **FR-012**: Selecting a POI marker MUST display basic details for that POI.
- **FR-013**: For the 3D features, the app MUST make clear - in both the code and
  the explanation - which features are set through the basemap style request
  (terrain, buildings) versus at runtime (globe view, tilt), since that
  distinction is a key learning point.

### Key Entities *(include if feature involves data)*

- **Map View**: The current visual state of the map - basemap style, center,
  zoom, and mode (2D or 3D globe).
- **POI (Point of Interest)**: A place returned by the AWS POI/places capability,
  with attributes such as name, type/category, and location; rendered as a marker.
- **POI Query**: The learner's current search parameters - search text and/or map
  area plus the set of selected POI type filters.
- **Code Snippet**: The editable text for a capability, its current (possibly
  edited) value, its original reset value, and the mapping to the setting it
  controls.
- **Explanation**: The plain-language description tied to a capability, including
  its reference documentation link.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On first load, a 2D Amazon basemap is visible within 5 seconds on a
  standard broadband connection.
- **SC-002**: A change made through an HTML input is reflected on the map and in
  the corresponding code panel within 1 second.
- **SC-003**: A valid code edit, once applied, updates the map within 2 seconds.
- **SC-004**: A learner unfamiliar with ALS can, using only the on-screen
  explanations and controls, complete each of the three core tasks (view basemap,
  filter POIs, switch to 3D) on the first attempt without external help.
- **SC-005**: 100% of on-screen reference links resolve to a live ALS or MapLibre
  documentation page.
- **SC-006**: Invalid code or a failed POI request never leaves the app blank or
  frozen; the last working map remains visible in 100% of such cases.
- **SC-007**: For each exposed capability, the learner can identify the specific
  code responsible and see it change when they change the equivalent HTML input.

## Assumptions

- The intended users are developers learning ALS and MapLibre; the tool is a
  learning aid, not a production mapping product.
- "3D" covers AWS Location Service's full 3D map feature set - 3D terrain, 3D
  buildings, globe view, and camera tilt - not just a globe projection. Terrain
  and buildings are enabled via the basemap style request; globe view (enabled by
  default in ALS styles) and tilt are MapLibre runtime settings. The app's default
  load is a flat 2D view with these 3D features off.
- Code edits and settings are session-scoped; they need not persist across page
  reloads, and reloading (or using reset) restores the original snippets.
- A single-user, single-session experience is sufficient; no accounts,
  multi-user, or saved-state features are required for this feature.
- Required AWS Location Service resources and an ALS API key are available to the
  app; provisioning them is a prerequisite handled outside this feature's scope.
- The app is a pure client-side static site with no backend; the browser calls
  ALS directly using an ALS API key (consistent with the constitution's
  allowance for API-key auth). The API key is therefore visible to the client and
  is assumed to be a low-privilege, usage-scoped key acceptable for a learning
  demo; production-grade credential protection is out of scope.
- Exact ALS resource names remain an implementation detail deferred to planning.
- Modern desktop browser support is sufficient for v1; mobile layout optimization
  is out of scope.
- POI result counts are capped to a reasonable display limit to keep the map
  responsive; the exact limit is an implementation detail.
