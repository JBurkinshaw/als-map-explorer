# Feature Specification: Maki POI Icons

**Feature Branch**: `004-maki-poi-icons`

**Created**: 2026-07-10

**Status**: Draft

**Input**: User description: "Replace the current POI markers with category-appropriate icons from Mapbox's open-source Maki icon set (https://github.com/mapbox/maki). Today every point of interest returned from the ALS Places search renders as the same generic marker, so a coffee shop, a hospital and a fuel station all look identical on the map. Instead, each POI should display the Maki icon that matches its type - a cup for coffee shops, a fuel pump for fuel stations, a bed for hotels, and so on - so the map is readable at a glance and the learner can see how a POI's category drives its visual representation. Each POI result from ALS carries category information; the app should map that category to the most appropriate Maki icon and render it as the POI's marker. When a POI's category has no sensible Maki equivalent, fall back to a clear generic marker rather than showing nothing. The category-to-icon mapping should be visible and understandable to the learner, in keeping with the project's Learning-First principle - ideally editable and explained like the other capabilities, with a reference link to the Maki icon set. Selecting a marker should still show the POI's details as it does now. This is a self-contained enhancement layered on the existing POI capability (User Story 2 of feature 001); it depends on POI search already working and should not change how the ALS Places request itself is made."

## Overview

Today every point of interest returned by the ALS Places search is drawn with the same
generic marker, so the map reads as a field of identical pins regardless of what each
place actually is. This feature gives each POI a marker whose icon reflects its category -
a cup for coffee shops, a fuel pump for fuel stations, a bed for hotels - using the
open-source Maki icon set. The result is a map that is readable at a glance, and, in line
with the project's Learning-First principle, a visible, editable, explained mapping from
ALS category to icon so the learner can see how a place's category drives what they see.

This is a self-contained enhancement layered on the existing POI capability (feature 001,
User Story 2). It depends on POI search already working and does not change how the ALS
Places request is made; it only changes how returned results are represented on the map
and adds a small learning surface around that representation.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read the map at a glance by POI type (Priority: P1)

A learner runs a POI search and sees each result drawn with an icon that matches what the
place is: coffee shops show a cup, fuel stations show a fuel pump, hotels show a bed,
hospitals show a medical symbol, and so on. Places whose category has no sensible icon
match still appear, drawn with a clear generic marker, so nothing is ever missing. The map
becomes readable without clicking anything.

**Why this priority**: This is the core value of the feature - turning an undifferentiated
field of identical pins into a map you can read at a glance. It is a complete, demonstrable
improvement on its own and does not depend on the learning surface in User Story 2.

**Independent Test**: With POI search working, run a search that returns a mix of place
types; confirm that different types render with visibly different, type-appropriate icons,
that a place with an unmapped or missing category still renders with a generic marker, and
that selecting any marker still shows that place's details.

**Acceptance Scenarios**:

1. **Given** a POI search returns results of several different types, **When** the results
   render, **Then** each POI's marker shows an icon appropriate to its category, and
   different categories are visibly distinguishable from one another.
2. **Given** a returned POI whose category has no suitable icon match (or no category at
   all), **When** it renders, **Then** it shows a clear generic fallback marker rather than
   a blank space or no marker.
3. **Given** POI markers are shown, **When** the learner selects one, **Then** that POI's
   details are displayed exactly as before this feature.
4. **Given** results are shown at a typical city zoom level, **When** the learner looks at
   the map, **Then** the icons are legible and identifiable without zooming in further.

---

### User Story 2 - See and change how categories map to icons (Priority: P2)

The learner can see the mapping that decides which icon represents which POI category,
understand it in plain language, and edit it - just like the other capabilities in the
app. Changing the mapping (for example, pointing a category at a different Maki icon)
updates the markers on the map. A reference link points to the Maki icon set so the learner
can browse the available icons.

**Why this priority**: This is what makes the feature serve the project's Learning-First
principle rather than being a purely cosmetic change. It depends on the icons rendering
(User Story 1) but adds the "see it, change it, watch the map respond" learning loop that
defines the rest of the app.

**Independent Test**: With icons rendering (User Story 1), locate the category-to-icon
mapping in the app, read its explanation, change one category's icon, apply the change, and
confirm the corresponding markers update; confirm the Maki reference link resolves.

**Acceptance Scenarios**:

1. **Given** the POI capability is visible, **When** the learner looks at it, **Then** the
   category-to-icon mapping is shown in a readable form alongside a plain-language
   explanation of how a category becomes an icon.
2. **Given** the mapping is shown, **When** the learner changes which icon a category uses
   and applies the change, **Then** the markers for that category update to the new icon.
3. **Given** the explanation is shown, **When** the learner follows the reference link,
   **Then** the Maki icon set opens so they can see the available icons.
4. **Given** the learner enters an icon name that does not exist in the set, **When** they
   apply the change, **Then** the app shows a clear, non-fatal indication and falls back to
   the generic marker rather than breaking the map.

---

### Edge Cases

- **POI with multiple categories**: the marker uses the icon for the highest-priority
  matching category (a single, deterministic choice), not several overlapping icons.
- **POI with no category information**: renders with the generic fallback marker.
- **Category present but no icon mapping exists**: renders with the generic fallback marker.
- **An icon fails to load or is named incorrectly**: the marker falls back to the generic
  marker; the map keeps working and is never left blank or frozen.
- **Dense results with overlapping markers**: icons remain individually recognisable where
  they do not overlap; de-cluttering overlapping markers is out of scope for this feature.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each POI drawn on the map MUST display an icon that corresponds to its
  category, so that different types of place are visually distinguishable.
- **FR-002**: The system MUST map each ALS POI category to the most appropriate icon from
  the Maki icon set.
- **FR-003**: When a POI has no category, or its category has no suitable icon match, the
  system MUST display a clear generic fallback marker - never a blank or missing marker.
- **FR-004**: When a POI has more than one category, the system MUST choose a single icon
  deterministically (by category priority), not render multiple icons for one POI.
- **FR-005**: Icons MUST be legible and identifiable at typical city-level zoom.
- **FR-006**: Selecting a POI marker MUST continue to show that POI's details, unchanged
  from the existing behaviour.
- **FR-007**: The category-to-icon mapping MUST be visible to the learner in a readable
  form, accompanied by a plain-language explanation of how a category becomes an icon.
- **FR-008**: The learner MUST be able to edit the category-to-icon mapping and see the
  markers on the map update to reflect the change, consistent with the app's existing
  editable-code model.
- **FR-009**: The feature MUST provide a reference link to the Maki icon set.
- **FR-010**: The feature MUST NOT change how the ALS Places request is constructed or
  sent; it only affects how returned results are represented and explained.
- **FR-011**: At minimum, every category exposed by the app's existing POI category filters
  (restaurants, coffee shops, hotels, fuel stations, supermarkets, hospitals, ATMs,
  parking) MUST have a distinct, type-appropriate icon.

### Key Entities

- **Point of Interest (existing)**: a place returned by ALS Places search, carrying a
  position, one or more categories, and display details. This feature reads its category to
  decide its icon; it does not change how the POI is fetched.
- **Category-to-icon mapping**: the association between an ALS place category and a Maki
  icon, plus a single designated generic fallback icon used when no mapping applies. This
  is the entity the learner can view and edit.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Given a search returning a mix of place types, a viewer can correctly
  identify the major categories (for example food, fuel, lodging, health) from the icons
  alone, without selecting any marker.
- **SC-002**: 100% of returned POIs display a marker - a matching icon where one exists,
  otherwise the generic fallback - with no blank or missing markers.
- **SC-003**: All eight categories offered by the app's existing POI filters render with a
  distinct, type-appropriate icon.
- **SC-004**: A learner can locate the category-to-icon mapping, change one category's icon,
  and see the corresponding markers update on the map in under 2 minutes, without outside
  help.
- **SC-005**: The Maki reference link resolves to the Maki icon set.
- **SC-006**: Entering an invalid icon name never blanks or freezes the map; the affected
  markers fall back to the generic marker and the app remains usable.

## Assumptions

- POI results from ALS Places include category information usable to select an icon; where
  a result lacks it, the generic fallback applies (FR-003).
- The Maki icon set is an acceptable addition to the project as the source of POI icons;
  its selection is a given from the feature request, not an open question.
- The existing POI search capability (feature 001, User Story 2) is working and remains
  unchanged; this feature builds on it.
- A curated mapping covering at least the app's existing filter categories is sufficient for
  the first version; broader category coverage is best-effort, always backed by the generic
  fallback.
- The existing marker-selection / POI-details behaviour is reused as-is.
- Marker styling (size, colour treatment) follows a single consistent style across icons;
  per-category colour theming is not required for this feature.
