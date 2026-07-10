// Applies the ALS 3D feature set, routing each setting to the right mechanism:
//   - terrain3d / buildings3d -> STYLE request (rebuild the URL via applyBasemap)
//   - globe / pitch           -> RUNTIME map settings
// This split is the key learning point (FR-013).

import type { MapController } from './mapController';
import type { SettingsStore } from '../state/store';
import type { MapView } from '../types';

export type ThreeDPatch = Partial<
  Pick<MapView, 'terrain3d' | 'buildings3d' | 'contourDensity' | 'globe' | 'pitch'>
>;

export function apply3D(map: MapController, store: SettingsStore, patch: ThreeDPatch): void {
  const before = store.mapView;

  // Terrain/buildings need a tilted camera to be visible - nudge pitch up if flat.
  const enablingRelief =
    (patch.terrain3d && !before.terrain3d) || (patch.buildings3d && !before.buildings3d);
  const pitch = patch.pitch ?? (enablingRelief && before.pitch === 0 ? 60 : before.pitch);

  store.setMapView({ ...patch, pitch });
  const view = store.mapView;

  // Did a style-request feature change? If so, rebuild the style URL. Contours are
  // a style-request feature too (like terrain/buildings), so a contour change reloads.
  const styleChanged =
    view.terrain3d !== before.terrain3d ||
    view.buildings3d !== before.buildings3d ||
    view.contourDensity !== before.contourDensity;
  if (styleChanged) {
    map.applyBasemap(view); // 'style.load' re-applies globe + pitch afterwards
  } else {
    if (view.globe !== before.globe) map.setGlobe(view.globe);
    if (view.pitch !== before.pitch) map.setPitch(view.pitch);
  }

  // When only the projection/pitch changed alongside a style change, the style.load
  // handler already re-applies them from the stored view, so nothing more to do.
  if (styleChanged) {
    map.setGlobe(view.globe);
    map.setPitch(view.pitch);
  }
}
