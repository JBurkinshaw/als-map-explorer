// Central integration config. Per the project constitution (Principle V), every
// piece of ALS/MapLibre configuration - region, API key, endpoints, defaults -
// lives here so the integration seams are easy to find and reason about.

import type { MapStyleName, MapView, PoiQuery } from './types';

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
  { id: 'fuel_station', label: 'Fuel stations' },
  { id: 'supermarket', label: 'Supermarkets' },
  { id: 'hospital', label: 'Hospitals' },
  { id: 'atm', label: 'ATMs' },
  { id: 'parking_lot', label: 'Parking' },
];

export const DEFAULT_MAP_VIEW: MapView = {
  styleName: 'Standard',
  colorScheme: 'Light',
  center: [-74.006, 40.7128], // New York City
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
