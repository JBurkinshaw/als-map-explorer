# Contract: ALS style-request for contour lines (consumed)

This is the external contract feature 002 consumes for topographic contours. It is the
same ALS Maps v2 style-descriptor request already used for the basemap and for
terrain/buildings; contours add one parameter.

## Request

```
GET https://maps.geo.{region}.amazonaws.com/v2/styles/{Style}/descriptor
    ?key={API_KEY}
    [&color-scheme={Light|Dark}]
    [&terrain=Terrain3D]
    [&buildings=Buildings3D]
    [&contour-density={Low|Medium|High}]
```

- `contour-density` - renders topographic elevation contour lines. Optional. Accepts
  exactly `Low`, `Medium`, or `High`. Omit the parameter entirely to show no contours.
- Independent of `terrain`: contours render with or without `terrain=Terrain3D`, and
  combine with it for added elevation context.
- Changing this parameter reloads the style (same as terrain/buildings): the app rebuilds
  the URL and calls `map.setStyle(url, { validateStyle: false })`, then re-applies runtime
  settings (globe/pitch) on the next `style.load`.

## Response

A MapLibre style descriptor (JSON) whose layers include contour lines at the requested
density. Handed directly to MapLibre via `setStyle`. No client-side parsing of contours
is required.

## App mapping

- Built by `src/als/basemap.ts` → `buildStyleUrl(opts)`; emits `contour-density` when
  `opts.contourDensity` is a density level, omits it when contours are off.
- Driven by `MapView.contourDensity` (see data-model.md).
- UI: 3D features tab, on/off control where "on" = `Medium` (fixed default).

## Error behaviour

A failed or empty style response MUST NOT blank/freeze the map. The MapController `error`
handler routes the message to the notice and the last working style remains (reuses the
001 error path, SC-002 / FR-007).

## Reference

- Topography (contour density levels): https://docs.aws.amazon.com/location/latest/developerguide/maps-topographic-map.html
- GetStyleDescriptor API (URI parameters): https://docs.aws.amazon.com/location/latest/APIReference/API_geomaps_GetStyleDescriptor.html
