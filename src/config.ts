// Central integration config. Per the project constitution (Principle V), every
// piece of ALS/MapLibre configuration - region, API key, endpoints, defaults -
// lives here so the integration seams are easy to find and reason about.

import type { MapStyleName, MapView, PoiIconMap, PoiQuery } from './types';

const apiKey = import.meta.env.VITE_ALS_API_KEY ?? '';
const region = import.meta.env.VITE_AWS_REGION ?? 'us-east-1';

export const config = {
  apiKey,
  region,
  /** True when an API key is present. When false, the app shows a setup notice. */
  hasCredentials: apiKey.trim().length > 0,
  /** ALS standalone Maps v2 host (basemap styles/tiles). */
  mapsHost: `https://maps.geo.${region}.amazonaws.com`,
  /** ALS standalone Places v2 host (POI search). */
  placesHost: `https://places.geo.${region}.amazonaws.com`,
} as const;

/** Basemap styles ALS offers. */
export const MAP_STYLES: MapStyleName[] = ['Standard', 'Monochrome', 'Hybrid', 'Satellite'];

/** A curated subset of ALS POI category IDs, shown as filter checkboxes. */
export const POI_CATEGORIES: { id: string; label: string }[] = [
  { id: 'restaurant', label: 'Restaurants' },
  { id: 'coffee_shop', label: 'Coffee shops' },
  { id: 'hotel', label: 'Hotels' },
  { id: 'petrol-gasoline_station', label: 'Fuel stations' },
  { id: 'grocery', label: 'Supermarkets' },
  { id: 'hospital', label: 'Hospitals' },
  { id: 'atm', label: 'ATMs' },
  { id: 'parking_lot', label: 'Parking' },
];

// POI marker icons come from Mapbox's open-source Maki set. Rather than add a
// dependency, we fetch each icon's SVG by name from the jsDelivr CDN (pinned for
// reproducibility) and cache it; see specs/004-maki-poi-icons/research.md.
export const MAKI_CDN_BASE = 'https://cdn.jsdelivr.net/npm/@mapbox/maki@8.2.0/icons';

/**
 * ALS place-category ID -> Maki icon name. Keys use the category IDs ALS actually
 * returns/accepts (e.g. `petrol-gasoline_station`, `grocery`). Maki has no `atm`
 * icon, so ATMs use the closest match, `bank`. Edit this at runtime from the POI
 * tab via setPoiIcons(); unmapped categories fall back to FALLBACK_ICON.
 */
export const POI_ICON_MAP: PoiIconMap = {
  restaurant: 'restaurant',
  coffee_shop: 'cafe',
  hotel: 'lodging',
  'petrol-gasoline_station': 'fuel',
  grocery: 'grocery',
  hospital: 'hospital',
  atm: 'bank',
  parking_lot: 'parking',
};

/** Maki icon used when none of a POI's categories are in POI_ICON_MAP. */
export const FALLBACK_ICON = 'marker';

export const DEFAULT_MAP_VIEW: MapView = {
  styleName: 'Standard',
  colorScheme: 'Light',
  center: [-123.1207, 49.2827], // Vancouver, BC
  zoom: 11,
  terrain3d: false,
  buildings3d: false,
  contourDensity: 'Off',
  globe: false,
  pitch: 0,
};

export const DEFAULT_POI_QUERY: PoiQuery = {
  mode: 'nearby',
  queryText: 'coffee',
  radiusMeters: 2000,
  includeCategories: [],
  maxResults: 50,
};
