// App bootstrap. Wires the shared shell (notice + split-panel + tabs), creates the
// map, and registers one tab per capability.

import '@awesome.me/webawesome/dist/styles/webawesome.css';
import './styles/global.css';

import { config } from './config';
import { SettingsStore } from './state/store';
import { Notice } from './ui/notice';
import { CodePanel } from './panels/codePanel';
import { MapController } from './map/mapController';
import { createBasemapTab } from './panels/basemapTab';
import { createPoiTab } from './panels/poiTab';
import { createThreeDTab } from './panels/threeDTab';

const app = document.getElementById('app');
if (!app) throw new Error('Missing #app root element');

const notice = new Notice(app);

// Missing-credentials guard: show an actionable message rather than a blank map (SC-006).
if (!config.hasCredentials) {
  notice.show(
    'No ALS API key found. Copy .env.example to .env.local, set VITE_ALS_API_KEY and ' +
      'VITE_AWS_REGION, then restart the dev server.',
  );
}

const store = new SettingsStore();
const panel = new CodePanel(app);
const map = new MapController(panel.mapContainer, store.mapView, notice);

panel.registerTab({ id: 'basemap', label: 'Basemap', content: createBasemapTab(map, store, notice) });
panel.registerTab({ id: 'poi', label: 'POI search', content: createPoiTab(map, store, notice) });
panel.registerTab({ id: '3d', label: '3D features', content: createThreeDTab(map, store, notice) });
