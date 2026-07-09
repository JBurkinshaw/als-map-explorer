// Shared domain types. See specs/001-als-map-explorer/data-model.md.

export type MapStyleName = 'Standard' | 'Monochrome' | 'Hybrid' | 'Satellite';
export type ColorScheme = 'Light' | 'Dark';

/** The current visual state of the map (basemap + 3D features). */
export interface MapView {
  styleName: MapStyleName;
  colorScheme: ColorScheme;
  center: [number, number];
  zoom: number;
  // 3D features enabled via the ALS style request (rebuild the style URL):
  terrain3d: boolean;
  buildings3d: boolean;
  // 3D features controlled at runtime (MapLibre map settings):
  globe: boolean;
  pitch: number;
}

export type PoiSearchMode = 'nearby' | 'text';

/** The learner's current POI search parameters. */
export interface PoiQuery {
  mode: PoiSearchMode;
  queryText: string;
  radiusMeters: number;
  includeCategories: string[];
  maxResults: number;
}

export interface PoiCategory {
  id: string;
  name: string;
  primary: boolean;
}

/** A place returned by ALS Places, rendered as a marker. */
export interface Poi {
  placeId: string;
  title: string;
  position: [number, number];
  categories: PoiCategory[];
  address?: string;
}

/** Plain-language description of a capability plus its reference link. */
export interface Explanation {
  summary: string;
  referenceLabel: string;
  referenceUrl: string;
}
