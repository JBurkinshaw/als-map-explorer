// Owns the single MapLibre map instance and all direct MapLibre calls.
//
// Two things worth understanding here:
//  1. Basemap style and the style-request 3D features (terrain, buildings) are
//     applied by rebuilding the ALS style URL and calling map.setStyle(). A restyle
//     resets runtime settings, so we re-apply globe + pitch on every 'style.load'.
//  2. Globe view and pitch are runtime settings (setProjection / setPitch) that do
//     not need a restyle.

import maplibregl from 'maplibre-gl';
import type { Map as MlMap, Marker as MlMarker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { buildStyleUrl } from '../als/basemap';
import type { MapView, Poi } from '../types';
import type { Notice } from '../ui/notice';
import { escapeHtml } from '../util/dom';

export class MapController {
  readonly map: MlMap;
  private view: MapView;
  private markers: MlMarker[] = [];

  constructor(container: HTMLElement, view: MapView, private readonly notice: Notice) {
    this.view = { ...view };

    this.map = new maplibregl.Map({
      container,
      style: buildStyleUrl(view),
      center: view.center,
      zoom: view.zoom,
      validateStyle: false, // faster loads, per the ALS examples
    });

    this.map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));

    // A restyle drops runtime state, so re-apply globe + pitch each time a style loads.
    this.map.on('style.load', () => this.applyRuntime());

    // Surface load/tile errors without blanking the map (SC-006).
    this.map.on('error', (event) => {
      const message = event.error?.message ?? 'the basemap failed to load - check your API key and region.';
      this.notice.show(`Map error: ${message}`);
    });
  }

  /** Rebuild the ALS style URL from the given view and swap it in (basemap + terrain/buildings). */
  applyBasemap(view: MapView): void {
    this.view = { ...this.view, ...view };
    this.map.setStyle(buildStyleUrl(this.view));
  }

  /** Globe view is a runtime projection: {} / mercator = flat, globe = 3D sphere. */
  setGlobe(on: boolean): void {
    this.view.globe = on;
    this.map.setProjection(on ? { type: 'globe' } : { type: 'mercator' });
  }

  /** Camera tilt in degrees (0-85). Needs to be > 0 to see terrain relief / building height. */
  setPitch(degrees: number): void {
    this.view.pitch = degrees;
    this.map.setPitch(degrees);
  }

  /** Render POIs as markers, replacing any previous ones. */
  showPois(pois: Poi[]): void {
    this.clearPois();
    for (const poi of pois) {
      const marker = new maplibregl.Marker()
        .setLngLat(poi.position)
        .setPopup(new maplibregl.Popup({ offset: 24 }).setHTML(this.popupHtml(poi)))
        .addTo(this.map);
      this.markers.push(marker);
    }
  }

  clearPois(): void {
    for (const marker of this.markers) marker.remove();
    this.markers = [];
  }

  getView(): MapView {
    return { ...this.view };
  }

  getCenter(): [number, number] {
    const { lng, lat } = this.map.getCenter();
    return [lng, lat];
  }

  private applyRuntime(): void {
    this.setGlobe(this.view.globe);
    this.setPitch(this.view.pitch);
  }

  private popupHtml(poi: Poi): string {
    const category = poi.categories.find((c) => c.primary)?.name ?? poi.categories[0]?.name ?? '';
    const parts = [`<strong>${escapeHtml(poi.title)}</strong>`];
    if (category) parts.push(`<br />${escapeHtml(category)}`);
    if (poi.address) parts.push(`<br /><small>${escapeHtml(poi.address)}</small>`);
    return parts.join('');
  }
}
