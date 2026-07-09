# Contract: ALS Maps v2 (consumed) - basemap style

The app consumes this ALS interface; it does not expose it. This documents the
exact request MapLibre makes so the basemap code and its explanation stay accurate.

## Style descriptor URL (what MapLibre `style` points at)

```
GET https://maps.geo.{region}.amazonaws.com/v2/styles/{Style}/descriptor?key={API_KEY}[&color-scheme={Light|Dark}][&terrain=Terrain3D][&buildings=Buildings3D][&contour-density={...}]
```

- `{region}` - AWS region of the ALS resources (e.g. `eu-central-1`).
- `{Style}` - one of `Standard` | `Monochrome` | `Hybrid` | `Satellite`.
- `key` - the ALS API key (query param). Required for API-key auth.
- `color-scheme` - `Light` | `Dark` (Standard/Monochrome). Optional.
- `terrain=Terrain3D` - enable 3D terrain (elevation surface). Optional.
- `buildings=Buildings3D` - enable 3D buildings (height/volume). Optional.
- `contour-density` - elevation precision, pairs with terrain. Optional.

Backing operation: `GetStyleDescriptor`. MapLibre then auto-requests tiles
(`GetTiles`), glyphs, and sprites referenced by the descriptor; the key
propagates automatically.

## 3D features (two control mechanisms - FR-013)

**Style-request (rebuild URL + `map.setStyle(url)`):** `terrain`, `buildings`,
`contour-density`. Changing these reloads the style.

**Runtime (MapLibre map settings, no style rebuild):**
- Globe view: **on by default** in ALS v2 styles. `map.setProjection({})` flattens
  to mercator; `map.setProjection({ type: 'globe' })` re-enables.
- Camera tilt: `map.setPitch(deg)`, `deg` ∈ [0, 85]. Needed (> 0) for terrain/
  buildings to be visible; AWS examples use `pitch: 60`.

Re-apply runtime settings on the `style.load` that follows a `setStyle`, since a
restyle resets projection/pitch. Set `validateStyle: false` on the `Map` for
faster loads (per AWS example).

## Usage

```ts
const styleUrl =
  `https://maps.geo.${region}.amazonaws.com/v2/styles/${styleName}/descriptor` +
  `?key=${apiKey}&color-scheme=${colorScheme}`;
const map = new maplibregl.Map({ container: 'map', style: styleUrl, center, zoom });
```

## Error modes the app must handle (SC-006, Edge Cases)

| Condition | Symptom | App behavior |
|-----------|---------|--------------|
| Missing/invalid API key | 403 on style/tiles; blank map | Show clear "check API key / region" message; do not leave blank |
| Wrong region | 403/404 | Same as above |
| Referer not allowed | 403 | Message noting referer restriction |
| Network failure | style load error event | Surface readable error, keep prior map if any |

Detection: listen for MapLibre `error` events and failed style fetch.

Ref: https://docs.aws.amazon.com/location/latest/APIReference/API_geomaps_GetStyleDescriptor.html
