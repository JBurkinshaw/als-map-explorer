// US3 - the 3D features tab. Inputs and editable code both drive one set3D() helper,
// which routes settings to the right mechanism via apply3D (style-request vs runtime).

import { createTabShell } from './tabShell';
import { LockedEditor } from './editor';
import { runSnippet } from './sandbox';
import { sliderControl, switchControl } from './controls';
import { explanations } from '../explain/content';
import { apply3D } from '../map/threeD';
import type { ThreeDPatch } from '../map/threeD';
import type { MapController } from '../map/mapController';
import type { SettingsStore } from '../state/store';
import type { Notice } from '../ui/notice';
import type { MapView } from '../types';

const PREFIX = `// ALS 3D features use two different mechanisms. set3D(opts) routes each setting:
//
//   // STYLE request - rebuild the descriptor URL and reload the style:
//   map.setStyle(buildStyleUrl({ ...view, terrain3d, buildings3d, contourDensity }));
//   //   -> &terrain=Terrain3D   &buildings=Buildings3D   &contour-density=Medium
//
//   // RUNTIME - change the live map, no reload:
//   map.setProjection(globe ? { type: 'globe' } : { type: 'mercator' });
//   map.setPitch(pitch);   // needs pitch > 0 to see terrain relief / building height
//
// Contours draw topographic elevation lines, with or without 3D terrain ("contours: true" = Medium).
set3D(`;

const SUFFIX = `)`;

function codeFor(view: MapView): string {
  return `{ terrain: ${view.terrain3d}, buildings: ${view.buildings3d}, contours: ${view.contourDensity !== 'Off'}, globe: ${view.globe}, pitch: ${view.pitch} }`;
}

interface ThreeDInput {
  terrain?: boolean;
  buildings?: boolean;
  contours?: boolean;
  globe?: boolean;
  pitch?: number;
}

export function createThreeDTab(map: MapController, store: SettingsStore, notice: Notice): HTMLElement {
  const shell = createTabShell(explanations.threeD);
  let syncing = false;

  const terrain = switchControl('3D terrain (style request)', store.mapView.terrain3d);
  const buildings = switchControl('3D buildings (style request)', store.mapView.buildings3d);
  const contours = switchControl('Contour lines (style request)', store.mapView.contourDensity !== 'Off');
  const globe = switchControl('Globe view (runtime)', store.mapView.globe);
  const pitch = sliderControl('Camera tilt / pitch (runtime)', store.mapView.pitch, 0, 85);
  shell.controls.append(terrain.el, buildings.el, contours.el, globe.el, pitch.el);

  const editor = new LockedEditor(shell.editorMount, {
    prefix: PREFIX,
    editable: codeFor(store.mapView),
    suffix: SUFFIX,
  });

  // The single path both inputs and the injected set3D() helper go through.
  const set3D = (input: ThreeDInput): void => {
    const patch: ThreeDPatch = {};
    if (input.terrain !== undefined) patch.terrain3d = input.terrain;
    if (input.buildings !== undefined) patch.buildings3d = input.buildings;
    // On/off control maps to a fixed default density ('Medium'); 'Off' omits contours.
    if (input.contours !== undefined) patch.contourDensity = input.contours ? 'Medium' : 'Off';
    if (input.globe !== undefined) patch.globe = input.globe;
    if (input.pitch !== undefined) patch.pitch = input.pitch;
    apply3D(map, store, patch);
  };

  terrain.onChange((on) => {
    if (!syncing) set3D({ terrain: on });
  });
  buildings.onChange((on) => {
    if (!syncing) set3D({ buildings: on });
  });
  contours.onChange((on) => {
    if (!syncing) set3D({ contours: on });
  });
  globe.onChange((on) => {
    if (!syncing) set3D({ globe: on });
  });
  pitch.onChange((value) => {
    if (!syncing) set3D({ pitch: value });
  });

  shell.onApply(() => {
    const result = runSnippet(editor.getFullText(), { set3D });
    if (result.ok) notice.clear();
    else notice.show(`Code error: ${result.error}`);
  });
  shell.onReset(() => editor.reset());

  store.subscribe(() => {
    syncing = true;
    const view = store.mapView;
    terrain.set(view.terrain3d);
    buildings.set(view.buildings3d);
    contours.set(view.contourDensity !== 'Off');
    globe.set(view.globe);
    pitch.set(view.pitch);
    editor.setEditableText(codeFor(view));
    syncing = false;
  });

  return shell.element;
}
