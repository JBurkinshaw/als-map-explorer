// Plain-language explanations shown under each capability tab. Each is a set of
// paragraphs describing the ALS request/response AND how MapLibre consumes it, plus a
// link to the authoritative reference (FR-011, FR-012).

import type { Explanation } from '../types';

export const explanations = {
  basemap: {
    paragraphs: [
      'The basemap is an AWS Location Service Maps style descriptor. You ask ALS for one with a ' +
        'GET to https://maps.geo.<region>.amazonaws.com/v2/styles/<Style>/descriptor, with your API ' +
        'key on the URL (?key=) and &color-scheme set to Light or Dark. The response is a MapLibre ' +
        'style document (JSON) describing sources, layers, glyphs, and sprites.',
      'MapLibre consumes that descriptor directly: you hand the URL to the map as its `style`, and ' +
        'MapLibre fetches the vector tiles, glyphs (fonts), and sprites (icons) the descriptor points ' +
        'at, then renders them. Switching style or colour scheme simply rebuilds the URL and calls ' +
        'map.setStyle(url) - no other code changes.',
    ],
    referenceLabel: 'ALS: Add an interactive map',
    referenceUrl: 'https://docs.aws.amazon.com/location/latest/developerguide/qs-add-map.html',
  },
  poi: {
    paragraphs: [
      'Points of interest come from the ALS Places service, called as a raw REST request: a POST to ' +
        '/v2/search-nearby (or /v2/search-text) with a JSON body describing where to look ' +
        '(QueryPosition, QueryRadius) and which categories to include (Filter.IncludeCategories), plus ' +
        'MaxResults. ALS returns a list of result items, each with a position and category tags.',
      'MapLibre is not part of the request - that is a plain fetch. MapLibre comes in on the response: ' +
        'for each result we create a maplibregl.Marker at its position, attach a popup with the title ' +
        'and category, and add it to the map. Changing the search reruns the fetch and replaces the ' +
        'markers.',
    ],
    referenceLabel: 'ALS: Search for points of interest',
    referenceUrl: 'https://docs.aws.amazon.com/location/latest/developerguide/search-poi.html',
  },
  threeD: {
    paragraphs: [
      'ALS 3D and topographic features split into two mechanisms. Terrain, buildings, and contour ' +
        'lines are STYLE-request features: you add &terrain=Terrain3D, &buildings=Buildings3D, or ' +
        '&contour-density=Low|Medium|High to the style descriptor URL, so ALS returns a different ' +
        'style. Contours draw topographic elevation lines and work with or without 3D terrain; this ' +
        'tab sends Medium when contours are switched on.',
      'Because those are baked into the style, MapLibre applies them the same way as the basemap - ' +
        'map.setStyle(url), which reloads the style. Globe view and camera tilt are the other ' +
        'mechanism: RUNTIME MapLibre settings. map.setProjection({ type: "globe" | "mercator" }) and ' +
        'map.setPitch(deg) change the live map with no reload. A restyle resets those, so we re-apply ' +
        'globe and pitch on MapLibre’s style.load event. You need pitch > 0 to actually see ' +
        'terrain relief and building height.',
    ],
    referenceLabel: 'ALS: 3D features',
    referenceUrl: 'https://docs.aws.amazon.com/location/latest/developerguide/maps-3d-map.html',
  },
} satisfies Record<string, Explanation>;
