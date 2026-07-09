// Plain-language explanations shown under each capability tab, each with a link to
// the authoritative ALS/MapLibre reference (FR-008, FR-009).

import type { Explanation } from '../types';

export const explanations = {
  basemap: {
    summary:
      'The basemap is just a MapLibre "style" URL served by AWS Location Service. ' +
      'You pick a style (Standard, Monochrome, Hybrid, Satellite) and a colour scheme, ' +
      'and your API key goes on the URL as ?key=. MapLibre fetches the tiles, glyphs, and ' +
      'sprites from that descriptor automatically.',
    referenceLabel: 'ALS: Add an interactive map',
    referenceUrl: 'https://docs.aws.amazon.com/location/latest/developerguide/qs-add-map.html',
  },
  poi: {
    summary:
      'Points of interest come from the ALS Places service. This calls the raw REST ' +
      'endpoint /v2/search-nearby (or /v2/search-text) with a POST body describing where ' +
      'to look and which categories to include. Each result has a position and one or more ' +
      'category tags, which we drop onto the map as markers.',
    referenceLabel: 'ALS: Search for points of interest',
    referenceUrl: 'https://docs.aws.amazon.com/location/latest/developerguide/search-poi.html',
  },
  threeD: {
    summary:
      'ALS 3D features are controlled two different ways. Terrain and buildings are ' +
      'STYLE-request features: you add &terrain=Terrain3D or &buildings=Buildings3D to the ' +
      'basemap URL, so the map re-loads its style. Globe view and camera tilt are RUNTIME ' +
      'settings: map.setProjection(...) and map.setPitch(...) change the live map without ' +
      'reloading. You need some tilt (pitch > 0) to actually see terrain relief and building height.',
    referenceLabel: 'ALS: 3D features',
    referenceUrl: 'https://docs.aws.amazon.com/location/latest/developerguide/maps-3d-map.html',
  },
} satisfies Record<string, Explanation>;
