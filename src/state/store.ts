// The single source of truth that both the HTML inputs and the editable code
// write to. Changing one path updates the store, which notifies subscribers so
// the other path re-renders - this is how FR-004 (input <-> code convergence) is met.

import type { MapView, Poi, PoiQuery } from '../types';
import { DEFAULT_MAP_VIEW, DEFAULT_POI_QUERY } from '../config';

type Listener = (store: SettingsStore) => void;

export class SettingsStore {
  mapView: MapView = { ...DEFAULT_MAP_VIEW };
  poiQuery: PoiQuery = { ...DEFAULT_POI_QUERY };
  poiResults: Poi[] = [];

  private readonly listeners = new Set<Listener>();

  /** Subscribe to any store change. Returns an unsubscribe function. */
  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  setMapView(patch: Partial<MapView>): void {
    this.mapView = { ...this.mapView, ...patch };
    this.emit();
  }

  setPoiQuery(patch: Partial<PoiQuery>): void {
    this.poiQuery = { ...this.poiQuery, ...patch };
    this.emit();
  }

  setPoiResults(results: Poi[]): void {
    this.poiResults = results;
    this.emit();
  }

  private emit(): void {
    for (const fn of this.listeners) fn(this);
  }
}
