# Contract: Request preview (internal)

Internal contract for the read-only request preview. Not an external API - it describes the
shape the preview module produces and the invariants it must uphold.

## Module: `src/als/preview.ts` (pure)

```
maskApiKey(url: string): string
poiRequestPreview(query: PoiQuery, center: [number, number]): PoiPreview
styleRequestPreview(view: MapView): string
```

```
interface PoiPreview {
  method: 'POST';
  url: string;    // key masked
  body: string;   // pretty-printed JSON; contains no key
}
```

## Invariants

1. **Key never leaks.** The returned strings MUST NOT contain the real API key. `maskApiKey`
   replaces the `key` query-parameter value with `***`. Verified by test: given a non-empty
   `config.apiKey`, no preview output contains it.
2. **Fidelity.** `poiRequestPreview` MUST derive from `buildSearchRequest(query, center)` and
   `styleRequestPreview` from `buildStyleUrl(view)` - the same builders used to send real
   requests - so preview == real request minus the key. Verified by test comparing the
   preview URL (unmasked) / body to the builder output.
3. **Mode fidelity (POI).** Nearby mode → `.../v2/search-nearby` with a QueryPosition/QueryRadius
   body; text mode → `.../v2/search-text` with a QueryText/BiasPosition body.
4. **Parameter fidelity (3D/basemap).** The style URL reflects the current `color-scheme`,
   `terrain`, `buildings`, and `contour-density` parameters (present/absent per state).
5. **Read-only.** The rendered preview is display text only; it emits no events and is not an input.

## Rendering contract (tabs)

- The POI and 3D tabs render the preview into a read-only block and refresh it inside their
  existing `store.subscribe(...)` callback (live updates).
- Links: `renderExplanation` renders `Explanation.references` as a list of anchors, each with
  `target="_blank"` and `rel="noreferrer"` (open in a new tab, no app navigation).

## References

- ALS Places (SearchNearby/SearchText): https://docs.aws.amazon.com/location/latest/APIReference/API_geoplaces_SearchNearby.html
- ALS GetStyleDescriptor: https://docs.aws.amazon.com/location/latest/APIReference/API_geomaps_GetStyleDescriptor.html
