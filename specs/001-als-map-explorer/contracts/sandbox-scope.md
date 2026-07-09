# Contract: Sandbox scope (internal) - what an editable snippet receives

Defines the controlled scope in which a code panel's editable region runs when the
learner clicks "Apply". This is the internal contract between `sandbox.ts` and the
editable snippets. Stable so snippet copy and explanations stay accurate.

## Execution model

The editable region text is compiled with `new Function(...injectedNames, code)`
and invoked with the corresponding values. It runs in global scope (not the app
module closure), so the only things it can touch are the injected arguments below.

## Injected scope

| Name | Type | Purpose |
|------|------|---------|
| `map` | `maplibregl.Map` | The live map instance (setProjection, flyTo, addSource/Layer, markers) |
| `maplibregl` | MapLibre module | Constructors (`Marker`, `Popup`, `LngLatBounds`) |
| `config` | `{ region, apiKey, ...defaults }` | Central config (read-only intent) |
| `helpers` | `{ log, setPoiResults, buildStyleUrl, searchPlaces }` | Curated helpers so snippets stay short and safe |
| `settings` | current `MapView` / `POIQuery` values | So a snippet can read/patch shared settings |

Exact per-tab injections are a subset chosen to keep each editable region minimal
(e.g. the basemap tab gets `map`, `config`, `buildStyleUrl`; the POI tab gets
`map`, `searchPlaces`, `setPoiResults`; the mode tab gets `map`).

## Return / effect

- A snippet applies its effect by calling into `map`/`helpers` (side effects).
- `apply()` returns `{ ok: true }` on success, or `{ ok: false, error }` if the
  snippet throws. Errors are caught, shown to the learner, and the previous
  working state is preserved (SC-006). The app never blanks or freezes.

## Constraints

- Synchronous execution expected; long-running/async snippets are out of scope for v1.
- No access to app internals beyond injected names (that is the "sandbox").
- Escalation path if snippets ever become untrusted: iframe `sandbox` or Web
  Worker (documented in research.md D6, not built for v1).
