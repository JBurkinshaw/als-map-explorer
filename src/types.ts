// Shared domain types. See specs/001-als-map-explorer/data-model.md.

export type MapStyleName = 'Standard' | 'Monochrome' | 'Hybrid' | 'Satellite';
export type ColorScheme = 'Light' | 'Dark';

/**
 * Topographic contour density. 'Off' omits the ALS `contour-density` param;
 * the other levels are the values the service accepts. The 3D tab's on/off
 * control maps "on" to 'Medium'; the level model is kept so a future density
 * selector is additive.
 */
export type ContourDensity = 'Off' | 'Low' | 'Medium' | 'High';

/** The current visual state of the map (basemap + 3D features). */
export interface MapView {
  styleName: MapStyleName;
  colorScheme: ColorScheme;
  center: [number, number];
  zoom: number;
  // 3D features enabled via the ALS style request (rebuild the style URL):
  terrain3d: boolean;
  buildings3d: boolean;
  contourDensity: ContourDensity;
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

/** A labelled documentation link shown in a capability's teaching note. */
export interface ReferenceLink {
  label: string;
  url: string;
}

/** Plain-language description of a capability plus its reference links. */
export interface Explanation {
  /** One or more paragraphs; each rendered as its own block. */
  paragraphs: string[];
  /** Curated list of direct documentation links; each opens in a new tab. */
  references: ReferenceLink[];
}
