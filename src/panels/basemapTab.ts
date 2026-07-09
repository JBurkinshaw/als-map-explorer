// US1 - the basemap tab. HTML inputs (style + colour scheme) and an editable code
// region both funnel into one `apply()` function, so the two stay in sync (FR-004).

import { createTabShell } from './tabShell';
import { LockedEditor } from './editor';
import { runSnippet } from './sandbox';
import { selectControl, switchControl } from './controls';
import { MAP_STYLES } from '../config';
import { explanations } from '../explain/content';
import type { MapController } from '../map/mapController';
import type { SettingsStore } from '../state/store';
import type { Notice } from '../ui/notice';
import type { ColorScheme, MapStyleName } from '../types';

const PREFIX = `// AWS Location Service serves the basemap as a MapLibre "style" URL:
//   https://maps.geo.<region>.amazonaws.com/v2/styles/<Style>/descriptor?key=<KEY>&color-scheme=<Light|Dark>
// Styles: Standard | Monochrome | Hybrid | Satellite
// Edit the call below, then click "Apply code".
setBasemap(`;

const SUFFIX = `)`;

function codeFor(styleName: string, colorScheme: string): string {
  return `'${styleName}', '${colorScheme}'`;
}

export function createBasemapTab(map: MapController, store: SettingsStore, notice: Notice): HTMLElement {
  const shell = createTabShell(explanations.basemap);
  let syncing = false;

  const style = selectControl(
    'Map style',
    MAP_STYLES.map((s) => ({ value: s, label: s })),
    store.mapView.styleName,
  );
  const dark = switchControl('Dark colour scheme', store.mapView.colorScheme === 'Dark');
  shell.controls.append(style.el, dark.el);

  const editor = new LockedEditor(shell.editorMount, {
    prefix: PREFIX,
    editable: codeFor(store.mapView.styleName, store.mapView.colorScheme),
    suffix: SUFFIX,
  });

  // The single path both inputs and the injected setBasemap() helper go through.
  const apply = (styleName: MapStyleName, colorScheme: ColorScheme): void => {
    store.setMapView({ styleName, colorScheme });
    map.applyBasemap(store.mapView);
  };

  style.onChange((value) => {
    if (!syncing) apply(value as MapStyleName, store.mapView.colorScheme);
  });
  dark.onChange((on) => {
    if (!syncing) apply(store.mapView.styleName, on ? 'Dark' : 'Light');
  });

  shell.onApply(() => {
    const result = runSnippet(editor.getEditableText(), { setBasemap: apply });
    if (result.ok) notice.clear();
    else notice.show(`Code error: ${result.error}`);
  });
  shell.onReset(() => editor.reset());

  // Keep inputs and code in sync whenever the basemap changes from any source.
  store.subscribe(() => {
    syncing = true;
    const { styleName, colorScheme } = store.mapView;
    style.set(styleName);
    dark.set(colorScheme === 'Dark');
    editor.setEditableText(codeFor(styleName, colorScheme));
    syncing = false;
  });

  return shell.element;
}
