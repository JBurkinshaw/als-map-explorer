# Phase 0 Research: ALS Map Explorer

All unknowns from the Technical Context are resolved below. Format per decision:
what was chosen, why, and what else was considered. Sources are current as of
2026-07-08 (AWS `/location/latest/` docs and the live npm registry).

---

## D1 - How to render an Amazon basemap in MapLibre with an API key

**Decision**: Use the standalone ALS **Maps v2** service. Hand MapLibre a single
style-descriptor URL with the API key as a query param; no AWS SDK, no auth
helper, no SigV4.

```
style: https://maps.geo.<region>.amazonaws.com/v2/styles/<Style>/descriptor?key=<APIKEY>&color-scheme=<Light|Dark>
```

- Styles (`<Style>`): `Standard`, `Monochrome`, `Hybrid`, `Satellite`.
- Color schemes: `Light`, `Dark` (Standard/Monochrome).
- MapLibre fetches tiles/glyphs/sprites automatically; the `?key=` propagates via
  the descriptor. Backing operation: `GetStyleDescriptor` (`GET /v2/styles/{Style}/descriptor`).

**Rationale**: Zero-dependency, matches AWS's documented browser example, and
keeps the "code that makes the map" a single readable line - ideal for the
learning goal (Principle I/III). The basemap style is a natural first editable
region (swap style + color scheme).

**Alternatives considered**:
- *Legacy Map Resources* (`aws location create-map` + `maps/v0/maps/{MapName}/style-descriptor`): deprecated previous generation. Rejected - more setup, provider-style knobs, and not the current API.
- *`@aws-sdk/client-geo-maps` + auth helper*: adds typed clients but is unnecessary for rendering; AWS docs state the auth helper is not required for API-key maps. Rejected to keep deps minimal.

Refs: [Use an API key (web)](https://docs.aws.amazon.com/location/latest/developerguide/using-apikeys.html) · [GetStyleDescriptor](https://docs.aws.amazon.com/location/latest/APIReference/API_geomaps_GetStyleDescriptor.html) · [Add an interactive map](https://docs.aws.amazon.com/location/latest/developerguide/qs-add-map.html)

---

## D2 - POI search & category filtering via ALS Places

**Decision**: Use the standalone ALS **Places v2** service over plain `fetch`
(POST, JSON body, `?key=<APIKEY>`). No SDK.

- Host: `https://places.geo.<region>.amazonaws.com`
- Primary operation: **SearchNearby** (`POST /v2/search-nearby`) for
  category-driven "what's around here" discovery; **SearchText**
  (`POST /v2/search-text`) for free-text queries.
- Filter by POI type with `Filter.IncludeCategories` (array of category string IDs
  like `"restaurant"`, `"coffee_shop"`, `"fuel_station"`, `"hotel"`). Each result
  also returns `Categories: [{Id, Name, Primary}]` for labeling.
- Cap with `MaxResults` (~50). Every operation accepts the API key as a query
  param - no SigV4/Cognito needed.

Example body (SearchNearby):
```json
{ "QueryPosition": [-123.06, 49.24], "QueryRadius": 2000,
  "Filter": { "IncludeCategories": ["coffee_shop"] }, "MaxResults": 50 }
```

**Rationale**: Raw `fetch` keeps the ALS request/response visible in the editable
snippet (Principle III), needs no dependency, and maps cleanly onto the POI tab's
inputs (query text, radius, category checkboxes). Response `ResultItems[].Position`
drop straight into MapLibre markers.

**Alternatives considered**:
- *`@aws-sdk/client-geo-places`*: typed `SearchNearbyCommand`/`SearchTextCommand`, nicer DX, but a large-ish dependency and it hides the raw request. Rejected for v1; noted as an optional later upgrade.
- *`@aws/amazon-location-for-maplibre-gl-geocoder`*: prebuilt search control - too much magic; it would hide the very code we want to teach. Rejected.
- *Legacy `SearchPlaceIndexForText` + PlaceIndex resource*: previous generation. Rejected.

Refs: [Places API overview](https://docs.aws.amazon.com/location/latest/developerguide/places-choose-api.html) · [SearchNearby](https://docs.aws.amazon.com/location/latest/APIReference/API_geoplaces_SearchNearby.html) · [SearchText](https://docs.aws.amazon.com/location/latest/APIReference/API_geoplaces_SearchText.html) · [Category filtering](https://docs.aws.amazon.com/location/latest/developerguide/category-filtering.html)

---

## D3 - API key scope & client exposure

**Decision**: Provision one ALS API key scoped to `geo-maps:*` + `geo-places:*`
on the default providers, with a referer restriction and an expiry. Supply it to
the app via `VITE_ALS_API_KEY` (in git-ignored `.env.local`).

**Rationale**: API keys are designed for public browser use; blast radius is
limited to read-only geo usage. Scoping + referer + expiry are the AWS-recommended
mitigations and are sufficient for a single-user learning demo (spec Assumptions).

**Alternatives considered**: Cognito Identity Pool (temporary creds, no key in
client) - more secure but more setup and out of proportion for a demo; rejected
per fast-iteration, consistent with the clarified topology.

Refs: [Using API keys](https://docs.aws.amazon.com/location/latest/developerguide/using-apikeys.html) · [API key best practices](https://docs.aws.amazon.com/location/latest/developerguide/api-keys-best-practices.html)

---

## D4 - ALS 3D map features (terrain, buildings, globe, tilt)

**Decision**: Render everything with MapLibre GL JS ^5.x (unchanged renderer) and
expose AWS Location Service's full 3D feature set. Crucially, the features are
controlled two different ways - a key teaching point (FR-013):

**(a) Style-request features** - rebuild the style-descriptor URL and call
`map.setStyle(url)`:
- 3D terrain: add `&terrain=Terrain3D` (optionally `&contour-density=<...>` for
  elevation precision).
- 3D buildings: add `&buildings=Buildings3D`.
```ts
const url = `https://maps.geo.${region}.amazonaws.com/v2/styles/${style}/descriptor`
  + `?key=${apiKey}&color-scheme=${scheme}`
  + (terrain ? `&terrain=Terrain3D` : ``)
  + (buildings ? `&buildings=Buildings3D` : ``);
map.setStyle(url);
```

**(b) Runtime features** - MapLibre map settings, no style rebuild:
- Globe view: **enabled by default** in ALS v2 styles. Disable (flatten) with
  `map.setProjection({})`; re-enable with `map.setProjection({ type: 'globe' })`.
- Camera tilt: `map.setPitch(deg)` where `deg` ∈ [0, 85]. A pitch > 0 (docs use 60)
  is needed for terrain relief and building height to actually be visible.

```ts
map.on('style.load', () => { if (!globe) map.setProjection({}); map.setPitch(pitch); });
```

**Rationale**: Matches the official AWS "Create a 3D map" guide exactly (terrain
and buildings are style-descriptor parameters; globe is default-on and toggled via
`setProjection`; `pitch` tilts the camera). Keeping the two control mechanisms
distinct - and visible in the code - is itself the lesson.

**Gotchas to encode**:
- ALS v2 styles default to **globe ON**. To honor the spec's "2D on load" the app
  disables globe (`setProjection({})`) and sets pitch 0 at startup, exposing globe
  as a toggle in the 3D tab.
- Terrain/buildings changes require `setStyle` (a style reload); re-apply runtime
  settings (projection, pitch) on the subsequent `style.load` since a restyle
  resets them.
- Terrain/buildings are only meaningful with a tilted camera - the terrain and
  buildings controls should nudge pitch up if it is 0.
- Use `validateStyle: false` on the `Map` for faster loads (per AWS example).
- Globe landed in MapLibre 5.0 (Jan 2025) and is production-ready in 5.x; current
  ^5.24.

Refs: [ALS 3D features](https://docs.aws.amazon.com/location/latest/developerguide/maps-3d-map.html) · [ALS Create a 3D map](https://docs.aws.amazon.com/location/latest/developerguide/how-to-create-a-3d-map.html) · [MapLibre globe guide](https://github.com/maplibre/maplibre-gl-js/blob/main/developer-guides/globe.md) · [npm maplibre-gl](https://www.npmjs.com/package/maplibre-gl)

---

## D5 - In-browser editor with a locked scaffold + editable region

**Decision**: CodeMirror 6. Lock everything outside the editable window with an
`EditorState.changeFilter` (track the region in a `StateField` so it maps through
edits). Syntax via `@codemirror/lang-javascript` (`{ typescript: true }`).

**Rationale**: ~50 KB tree-shakeable vs Monaco's multi-MB VS Code engine;
first-class support for suppressing edits outside a range (Monaco has no native
protected-range API and needs a Vite worker plugin). Matches the "small editable
region" clarification and the minimal-deps constraint.

**Alternatives considered**: Monaco Editor - superior IntelliSense but far heavier
and awkward for locked ranges + Vite workers; overkill here. Rejected.

Refs: [CM6 read-only example](https://codemirror.net/examples/readonly/) · [changeFilter ref](https://codemirror.net/docs/ref/) · [readonly-ranges forum](https://discuss.codemirror.net/t/how-to-make-certain-ranges-readonly-in-codemirror6/3400)

---

## D6 - Executing the edited snippet safely

**Decision**: Run the edited region with `new Function(...args, code)` and
explicitly injected arguments (`map`, `maplibregl`, `config`, `helpers`).
Synchronous; catch errors and surface them without blanking the map.

**Rationale**: Single-user local demo where the user edits their own code - a
heavy sandbox buys little. `new Function` runs in global scope (not the module
closure), so the surface is controlled purely by injected args - exactly the
"controlled/sandboxed scope" from the clarification. Zero async plumbing, direct
stack traces, trivial hot re-run on "Apply" (fast iteration).

**Escalation path (documented, not built)**: iframe `sandbox="allow-scripts"` or a
Web Worker if snippets ever become untrusted or need runaway-loop termination.

Refs: [Sandboxed code in browsers](https://formsort.com/article/sandboxed-code-in-browsers/) · [JS sandboxing deep dive](https://leapcell.io/blog/deep-dive-into-javascript-sandboxing)

---

## D7 - UI component library (Mantine-like, framework-agnostic, not Tailwind)

**Decision**: **Web Awesome** (the actively-developed, MIT-licensed successor to
Shoelace, by the Font Awesome team; built on Lit web components). Use `wa-tab-group`
for the tabbed code panel, `wa-split-panel` for the resizable map/editor layout,
and `wa-slider` / `wa-select` / `wa-switch` / `wa-input` for controls.

**Rationale**: Closest thing to "Mantine but framework-agnostic" - one dependency
supplies every interactive control the UX needs (tabs, split-panel, slider,
select, switch), polished and accessible, working out of the box with vanilla TS +
Vite. Those interactive pieces (tabs, resizable split) are genuinely needed by the
design, so this satisfies "minimal dependencies unless necessary" with a single,
well-scoped dep.

**Important caveats (encoded into the plan)**:
- Web Awesome renders in **shadow DOM**, so `*.module.css` will **not** style
  component internals. Theme via exposed CSS custom properties on `:root`/a wrapper
  and `::part(...)` in *global* CSS; reserve CSS Modules for our own markup/layout.
- Call `setBasePath()` (or use the loader) so icons/assets resolve under Vite.
- Manage stacking/`pointer-events` so overlays (select, tooltip, dialog) sit above
  the MapLibre canvas and aren't swallowed by map event handling.
- Import `maplibre-gl/dist/maplibre-gl.css` globally (not a module).

**Alternatives considered**:
- *Pico CSS (+ Open Props)*: near-zero-dependency, classless CSS, works perfectly
  with CSS Modules (no shadow DOM). But no JS slider / tabs behavior / resizable
  split - we'd hand-build them. **This is the recommended fallback** if you prefer
  absolute-minimal deps and are happy to build the few interactive widgets by hand.
- *Shoelace (`@shoelace-style/shoelace`)*: now frozen/redirected to Web Awesome. Rejected.
- *Material Web (MWC)*: in maintenance mode since 2024. Rejected.
- *Spectrum (Adobe) / Carbon (IBM) / Fluent (MS) web components*: complete and
  accessible but strongly branded and heavier to neutralize. Rejected for a neutral
  learning tool.

Refs: [Web Awesome](https://webawesome.com/) · [Migrating from Shoelace](https://webawesome.com/docs/resources/migrating-from-shoelace/) · [Material Web maintenance mode](https://github.com/material-components/material-web/discussions/5642) · [Pico CSS](https://picocss.com/)

---

## Consolidated dependency list

| Package | Version | Role | Necessary? |
|---------|---------|------|------------|
| `maplibre-gl` | ^5.24 | Map rendering + globe | Required |
| `codemirror` + `@codemirror/{state,view,lang-javascript}` | ^6 | Editable code regions | Required |
| `@awesome.me/webawesome` | latest | UI controls (tabs, split, slider, inputs) | Chosen (fallback: Pico CSS) |
| `vite`, `typescript` | ^6 / ^5 | Build/tooling | Required (dev) |
| `vitest` | ^3 | Light unit tests | Optional |
| AWS SDK (`@aws-sdk/client-geo-*`, auth-helper, datatypes) | - | Typed ALS calls | **Not used** in v1 (raw fetch instead) |

**Decision (confirmed 2026-07-08)**: **Web Awesome**. Pico CSS remains the
documented fallback; switching would affect only the `panels/` and `ui/` layer,
not the ALS/MapLibre integration.
