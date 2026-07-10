// Read-only previews of the actual ALS requests, for the teaching panels.
//
// These reuse the SAME builders that send the real requests (buildSearchRequest /
// buildStyleUrl), so a preview can never drift from what is actually sent. The API key is
// masked when the preview string is composed - the real key is never placed into rendered
// text (see specs/003-request-preview-doc-links/contracts/request-preview.md).

import { buildSearchRequest } from './places';
import { buildStyleUrl } from './basemap';
import type { MapView, PoiQuery } from '../types';

/** Replace the `key` query-param value with *** so the secret never appears in a preview. */
export function maskApiKey(url: string): string {
  return url.replace(/([?&]key=)[^&]*/i, '$1***');
}

export interface PoiRequestPreview {
  method: 'POST';
  url: string;
  body: string;
}

/** The exact POST the POI tab will send, with the key masked and the body pretty-printed. */
export function poiRequestPreview(query: PoiQuery, center: [number, number]): PoiRequestPreview {
  const { url, body } = buildSearchRequest(query, center);
  return {
    method: 'POST',
    url: maskApiKey(url),
    body: JSON.stringify(body, null, 2),
  };
}

/** The exact Maps style-descriptor URL the map will load, with the key masked. */
export function styleRequestPreview(view: MapView): string {
  return maskApiKey(buildStyleUrl(view));
}
