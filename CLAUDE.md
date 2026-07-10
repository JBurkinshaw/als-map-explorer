# ALS Map Explorer - Agent Context

A learning tool that teaches how AWS Location Service (ALS) and MapLibre integrate.
See `.specify/memory/constitution.md` (Learning-First, fast iteration) and
`specs/001-als-map-explorer/` for the full spec/plan.

## Stack

- Vanilla **TypeScript** + **Vite**, plain HTML/CSS with **CSS Modules**. No frontend framework.
- **maplibre-gl** ^5.24 - rendering + globe (`setProjection`).
- **CodeMirror 6** - editable code regions (lock scaffold via `changeFilter`).
- **Web Awesome** (`@awesome.me/webawesome`) - UI components (tabs, split-panel, slider, inputs). Fallback option: Pico CSS.
- **No AWS SDK** - ALS is called as raw REST.

## ALS integration (pure client-side, API key)

- Basemap: MapLibre `style` = `https://maps.geo.{region}.amazonaws.com/v2/styles/{Standard|Monochrome|Hybrid|Satellite}/descriptor?key={KEY}&color-scheme={Light|Dark}`.
- POI: `fetch` POST to `https://places.geo.{region}.amazonaws.com/v2/search-nearby` (or `search-text`) `?key={KEY}`, body `{QueryPosition, QueryRadius, Filter:{IncludeCategories:[...]}, MaxResults}`. Valid category IDs matter (e.g. `petrol-gasoline_station`, `grocery` - not `fuel_station`/`supermarket`); cross-check the ALS place-categories doc.
- POI marker icons: category-appropriate icons from Mapbox **Maki**, fetched by name from the jsDelivr CDN (pinned `@mapbox/maki@8.2.0`), cached in-memory, with an inline generic fallback so the map is never blank. The ALS-category→Maki-name mapping is centralized in `src/config.ts` (`POI_ICON_MAP`); resolver + fetch live in `src/map/poiIcons.ts`. See `specs/004-maki-poi-icons/`.
- 3D features (two mechanisms - keep both visible in code):
  - **Style-request** (rebuild URL + `map.setStyle`): `&terrain=Terrain3D`, `&buildings=Buildings3D`, `&contour-density=...`.
  - **Runtime** (MapLibre): globe is ON by default in ALS styles - `map.setProjection({})` flattens, `{type:'globe'}` re-enables; `map.setPitch(0-85)` tilts (need >0 to see terrain/buildings). Re-apply runtime settings after `setStyle` on `style.load`. Use `validateStyle:false`.
  - Ref: https://docs.aws.amazon.com/location/latest/developerguide/maps-3d-map.html
- API key + region via `VITE_ALS_API_KEY` / `VITE_AWS_REGION` in git-ignored `.env.local`. Never commit the key.
- All ALS/MapLibre config is centralized in `src/config.ts`.

## Conventions

- Keep ALS calls raw and readable - the learner is meant to see the actual requests.
- Every capability (basemap, POI, mode) pairs code + HTML inputs + a plain-language explanation + a reference link.
- Edited snippets run via `new Function(...)` with an injected scope (see `specs/001-als-map-explorer/contracts/sandbox-scope.md`). Errors must never blank/freeze the map.
- Tests optional (Vitest) - reserve for fragile seams (sandbox runner, ALS request builders).
- Explain proposed changes before editing code; surface tips/lessons as you go.

## Commands

`npm run dev` · `npm run build` · `npm run test`
