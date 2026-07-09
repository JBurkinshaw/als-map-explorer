// Calls the AWS Location Service Places v2 REST API directly with fetch - no SDK,
// so the learner sees the actual request. Two operations are exposed:
//
//   POST https://places.geo.<region>.amazonaws.com/v2/search-nearby?key=<KEY>
//   POST https://places.geo.<region>.amazonaws.com/v2/search-text?key=<KEY>
//
// Category filtering uses Filter.IncludeCategories (an array of category IDs).

import { config } from '../config';
import type { Poi, PoiCategory, PoiQuery } from '../types';

interface AlsCategory {
  Id: string;
  Name: string;
  Primary?: boolean;
}

interface AlsResultItem {
  PlaceId: string;
  Title: string;
  Position: [number, number];
  Categories?: AlsCategory[];
  Address?: { Label?: string };
}

interface SearchRequest {
  url: string;
  body: Record<string, unknown>;
}

/** Build the endpoint URL and JSON body for a POI query. Pure - easy to test. */
export function buildSearchRequest(query: PoiQuery, center: [number, number]): SearchRequest {
  const endpoint = query.mode === 'text' ? 'search-text' : 'search-nearby';
  const url = `${config.placesHost}/v2/${endpoint}?key=${encodeURIComponent(config.apiKey)}`;

  const filter = query.includeCategories.length > 0 ? { IncludeCategories: query.includeCategories } : undefined;

  const body: Record<string, unknown> =
    query.mode === 'text'
      ? { QueryText: query.queryText, BiasPosition: center, Filter: filter, MaxResults: query.maxResults }
      : { QueryPosition: center, QueryRadius: query.radiusMeters, Filter: filter, MaxResults: query.maxResults };

  return { url, body };
}

/** Map a raw ALS result item to our Poi shape. Pure - easy to test. */
export function toPoi(item: AlsResultItem): Poi {
  const categories: PoiCategory[] = (item.Categories ?? []).map((c) => ({
    id: c.Id,
    name: c.Name,
    primary: c.Primary ?? false,
  }));

  return {
    placeId: item.PlaceId,
    title: item.Title,
    position: item.Position,
    categories,
    address: item.Address?.Label,
  };
}

/** Run the search and return mapped POIs. Throws on HTTP/network failure. */
export async function searchPlaces(query: PoiQuery, center: [number, number]): Promise<Poi[]> {
  const { url, body } = buildSearchRequest(query, center);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`ALS Places request failed (HTTP ${response.status})`);
  }

  const data = (await response.json()) as { ResultItems?: AlsResultItem[] };
  return (data.ResultItems ?? []).map(toPoi);
}
