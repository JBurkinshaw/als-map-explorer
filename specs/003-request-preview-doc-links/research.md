# Research: Live Request Preview & Complete Documentation Links

Phase 0 for feature 003. Two research items: how to build the preview with fidelity + key
masking (US1), and the curated documentation-link inventory (US2).

## R1. Preview fidelity and API-key masking (US1)

**Decision**: Do not re-derive request strings in the tabs. Add a pure module
`src/als/preview.ts` that reuses the existing builders and masks the key:
- `maskApiKey(url: string): string` - parse the URL, replace the `key` query-param value with
  `***`, return the string. Masking happens while composing the preview string, so the
  preview text never contains the real key (FR-005).
- `poiRequestPreview(query, center): { method: 'POST'; url: string; body: string }` - calls
  `buildSearchRequest(query, center)`, masks the URL, and pretty-prints the body as JSON. The
  body carries no key, so only the URL needs masking.
- `styleRequestPreview(view): string` - calls `buildStyleUrl(view)` and masks the URL.

**Rationale**:
- `buildSearchRequest` (als/places.ts) already returns a pure `{ url, body }` and is the same
  function `searchPlaces` uses to send the real request - so a preview built from it cannot
  drift from what is sent (FR-007, SC-003). `buildStyleUrl` (als/basemap.ts) is likewise the
  exact URL handed to `map.setStyle`.
- Centralising masking in one pure function makes the "never render the key" rule auditable and
  unit-testable in one place (SC-002), rather than relying on each tab to remember to mask.
- Live updates need no new machinery: the tabs already subscribe to `store` changes; the
  preview element re-renders in that same subscription (SC-001).

**Alternatives considered**:
- *Format the request text by hand in each tab*: rejected - duplicates the builders and invites
  drift between preview and reality, and risks forgetting to mask the key in one path.
- *Hide the key with CSS / a masked input*: rejected - the secret would still be present in the
  DOM text; FR-005 requires masking at composition.

## R2. Curated documentation-link inventory (US2)

**Decision**: Each tab carries a short curated list of direct links. Verified targets:

**Basemap tab**
- ALS - Add an interactive map (quickstart): https://docs.aws.amazon.com/location/latest/developerguide/qs-add-map.html
- ALS - Style dynamic maps: https://docs.aws.amazon.com/location/latest/developerguide/styling-dynamic-maps.html
- ALS - GetStyleDescriptor (API, URI parameters): https://docs.aws.amazon.com/location/latest/APIReference/API_geomaps_GetStyleDescriptor.html

**POI tab**
- ALS - Search Nearby (developer guide): https://docs.aws.amazon.com/location/latest/developerguide/search-nearby.html
- ALS - Search Text (developer guide): https://docs.aws.amazon.com/location/latest/developerguide/search-text.html
- ALS - SearchNearby (API reference): https://docs.aws.amazon.com/location/latest/APIReference/API_geoplaces_SearchNearby.html
- ALS - Search nearby by category (categories/filtering): https://docs.aws.amazon.com/location/latest/developerguide/how-to-search-nearby-category.html

**3D features tab**
- ALS - 3D map: https://docs.aws.amazon.com/location/latest/developerguide/maps-3d-map.html
- ALS - Topography (terrain & contour density): https://docs.aws.amazon.com/location/latest/developerguide/maps-topographic-map.html
- ALS - GetStyleDescriptor (terrain/buildings/contour-density params): https://docs.aws.amazon.com/location/latest/APIReference/API_geomaps_GetStyleDescriptor.html
- MapLibre - Map API (setProjection / setPitch): https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/

**Rationale**: These are the authoritative, capability-specific pages a learner needs. Mixing
ALS developer-guide, ALS API-reference, and MapLibre API links gives both the "how to use it"
and the "what the parameters are" views. All open in a new tab (FR-009).

**Alternatives considered**: Auto-scraping doc links - rejected as over-engineering; a curated,
hand-verified list is more accurate and is exactly what "complete and direct" asks for.
Maintenance (link rot) is a documented authoring-time task, not a runtime feature.

## Open questions

None. The one security-sensitive choice (masking) is resolved above; no `[NEEDS CLARIFICATION]`
markers remain.
