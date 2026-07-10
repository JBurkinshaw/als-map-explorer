// US2 - the POI tab. Inputs and the editable code both drive a single searchPois()
// helper, which updates the query in the store and runs the ALS Places request.

import { createTabShell } from './tabShell';
import { LockedEditor } from './editor';
import { runSnippet } from './sandbox';
import { inputControl, selectControl, switchControl } from './controls';
import { POI_CATEGORIES } from '../config';
import { explanations } from '../explain/content';
import { searchPlaces } from '../als/places';
import { poiRequestPreview } from '../als/preview';
import type { MapController } from '../map/mapController';
import type { SettingsStore } from '../state/store';
import type { Notice } from '../ui/notice';
import type { PoiQuery, PoiSearchMode } from '../types';

const PREFIX = `// POIs come from ALS Places v2, called as a raw REST request. Under the hood,
// searchPois(query) POSTs to the Places endpoint and turns each result into a marker:
//
//   const res = await fetch(
//     'https://places.geo.<region>.amazonaws.com/v2/search-nearby?key=<KEY>',
//     { method: 'POST', body: JSON.stringify({
//         QueryPosition: [lng, lat],
//         QueryRadius: query.radiusMeters,
//         Filter: { IncludeCategories: query.includeCategories },
//         MaxResults: query.maxResults,
//     }) },
//   );
//   const { ResultItems } = await res.json();   // each item -> a map marker
//
// Edit the search below, then click "Apply code":
searchPois(`;

const SUFFIX = `)`;

function codeFor(query: PoiQuery): string {
  const cats = query.includeCategories.map((c) => `'${c}'`).join(', ');
  if (query.mode === 'text') {
    return `{ mode: 'text', queryText: '${query.queryText}', includeCategories: [${cats}], maxResults: ${query.maxResults} }`;
  }
  return `{ radiusMeters: ${query.radiusMeters}, includeCategories: [${cats}], maxResults: ${query.maxResults} }`;
}

export function createPoiTab(map: MapController, store: SettingsStore, notice: Notice): HTMLElement {
  const shell = createTabShell(explanations.poi);
  let syncing = false;

  const mode = selectControl(
    'Search mode',
    [
      { value: 'nearby', label: 'Nearby (radius)' },
      { value: 'text', label: 'Text query' },
    ],
    store.poiQuery.mode,
  );
  const queryText = inputControl('Query text', store.poiQuery.queryText);
  const radius = inputControl('Radius (m)', String(store.poiQuery.radiusMeters), 'number');
  const maxResults = inputControl('Max results', String(store.poiQuery.maxResults), 'number');

  const categoryControls = POI_CATEGORIES.map((category) => ({
    id: category.id,
    control: switchControl(category.label, store.poiQuery.includeCategories.includes(category.id)),
  }));

  const categoryBox = document.createElement('div');
  for (const { control } of categoryControls) categoryBox.appendChild(control.el);

  shell.controls.append(mode.el, queryText.el, radius.el, maxResults.el, categoryBox);

  const editor = new LockedEditor(shell.editorMount, {
    prefix: PREFIX,
    editable: codeFor(store.poiQuery),
    suffix: SUFFIX,
  });

  // Read-only preview of the exact ALS Places request for the current query (key masked).
  const renderPreview = (): void => {
    const p = poiRequestPreview(store.poiQuery, map.getCenter());
    shell.preview.textContent = `Request that will be sent (key hidden):\n${p.method} ${p.url}\n\n${p.body}`;
  };
  renderPreview();

  // Run the ALS Places request for the query currently in the store.
  const runSearch = async (): Promise<void> => {
    try {
      const pois = await searchPlaces(store.poiQuery, map.getCenter());
      store.setPoiResults(pois);
      map.showPois(pois);
      if (pois.length === 0) notice.show('No POIs found for this search.', 'info');
      else notice.clear();
    } catch (error) {
      notice.show(`POI search failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // The single path both inputs and the injected searchPois() helper go through.
  const searchPois = (patch: Partial<PoiQuery>): void => {
    store.setPoiQuery(patch);
    void runSearch();
  };

  const selectedCategories = (): string[] =>
    categoryControls.filter(({ control }) => control.get()).map(({ id }) => id);

  mode.onChange((value) => {
    if (!syncing) searchPois({ mode: value as PoiSearchMode });
  });
  queryText.onChange((value) => {
    if (!syncing) searchPois({ queryText: value });
  });
  radius.onChange((value) => {
    if (!syncing) searchPois({ radiusMeters: Number(value) });
  });
  maxResults.onChange((value) => {
    if (!syncing) searchPois({ maxResults: Number(value) });
  });
  for (const { control } of categoryControls) {
    control.onChange(() => {
      if (!syncing) searchPois({ includeCategories: selectedCategories() });
    });
  }

  shell.onApply(() => {
    const result = runSnippet(editor.getFullText(), { searchPois });
    if (result.ok) notice.clear();
    else notice.show(`Code error: ${result.error}`);
  });
  shell.onReset(() => editor.reset());

  store.subscribe(() => {
    syncing = true;
    const query = store.poiQuery;
    mode.set(query.mode);
    queryText.set(query.queryText);
    radius.set(String(query.radiusMeters));
    maxResults.set(String(query.maxResults));
    for (const { id, control } of categoryControls) control.set(query.includeCategories.includes(id));
    editor.setEditableText(codeFor(query));
    syncing = false;
    renderPreview();
  });

  return shell.element;
}
