# Contract: ALS Places v2 (consumed) - POI search & filter

The app consumes these ALS endpoints via `fetch`. Documents the request/response
shape the POI code depends on.

## SearchNearby (primary - category-driven discovery)

```
POST https://places.geo.{region}.amazonaws.com/v2/search-nearby?key={API_KEY}
Content-Type: application/json
```

Request body:
```json
{
  "QueryPosition": [lng, lat],
  "QueryRadius": 2000,
  "Filter": { "IncludeCategories": ["coffee_shop", "restaurant"] },
  "MaxResults": 50
}
```

## SearchText (free-text query)

```
POST https://places.geo.{region}.amazonaws.com/v2/search-text?key={API_KEY}
```
```json
{
  "QueryText": "coffee",
  "BiasPosition": [lng, lat],
  "Filter": { "IncludeCategories": ["coffee_shop"] },
  "MaxResults": 50
}
```

## Response (fields the app uses)

```json
{
  "ResultItems": [
    {
      "PlaceId": "…",
      "Title": "Blue Bottle Coffee",
      "Position": [lng, lat],
      "Categories": [{ "Id": "coffee_shop", "Name": "Coffee Shop", "Primary": true }],
      "Address": { "Label": "…" }
    }
  ]
}
```

Map each `ResultItem` → a `POI` entity (see data-model.md): `PlaceId`→`placeId`,
`Title`→`title`, `Position`→`position`, `Categories`→`categories`,
`Address.Label`→`address`.

## Category filtering (FR-006)

- `Filter.IncludeCategories`: array of ALS category **string IDs** (lowercase
  snake_case, e.g. `restaurant`, `coffee_shop`, `fuel_station`, `hotel`,
  `supermarket`). Empty/omitted = no category filter.
- The app presents a curated set of common categories as checkboxes; the selected
  IDs populate `IncludeCategories`.

## Error / empty modes (SC-006, Edge Cases)

| Condition | App behavior |
|-----------|--------------|
| Empty `ResultItems` | Show "no results" indication, clear markers (not an error) |
| 4xx/5xx or network error | Surface readable error; keep last working markers/map |
| Result count at cap | Show markers up to `MaxResults`; indicate results were limited |

Auth: API key as query param; no SigV4/Cognito required.

Refs: https://docs.aws.amazon.com/location/latest/APIReference/API_geoplaces_SearchNearby.html · https://docs.aws.amazon.com/location/latest/developerguide/category-filtering.html
