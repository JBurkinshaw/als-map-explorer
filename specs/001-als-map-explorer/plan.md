# Implementation Plan: ALS Map Explorer

**Branch**: `001-als-map-explorer` | **Date**: 2026-07-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-als-map-explorer/spec.md`

## Summary

A pure client-side, static web app (vanilla TypeScript + Vite) that renders an
Amazon (AWS Location Service) basemap with MapLibre GL JS and teaches how ALS and
MapLibre integrate. The learner explores three capabilities - basemap, POI
search/filter, and the ALS 3D feature set (3D terrain, 3D buildings, globe view,
camera tilt) - through a dual-control model: HTML inputs and a tabbed code panel
whose small editable regions run genuine ALS/MapLibre code in a sandboxed scope.
Each capability is paired with a plain-language explanation and a link to the
authoritative reference.

Technical approach: talk to ALS directly from the browser with an **API key** and
**no AWS SDK** - the basemap is a v2 style URL (`?key=`) handed straight to
MapLibre, and POIs come from plain `fetch` POSTs to the Places v2 REST endpoints.
Keeping the calls as raw requests is deliberate: it makes the ALS surface visible,
which is the whole point of the tool.

## Technical Context

**Language/Version**: TypeScript 5.x (ES2022 modules), targeting modern evergreen browsers

**Primary Dependencies**:
- `maplibre-gl` ^5.24 - map rendering + globe projection (only hard runtime dep for the map)
- `codemirror` ^6 + `@codemirror/state`, `@codemirror/view`, `@codemirror/lang-javascript` - editable code regions
- `@awesome.me/webawesome` (Web Awesome) - UI components (tabs, split-panel, slider, select, switch)
- Dev: `vite` ^6, `typescript`, `vitest` (light unit tests)
- AWS: **none required**. ALS is consumed via the style URL + `fetch`. (Optional future: `@aws-sdk/client-geo-places` + `@aws/amazon-location-utilities-datatypes` for typed calls / GeoJSON conversion.)

**Storage**: N/A. Session-only, in-memory state. API key supplied via a Vite env var (`VITE_ALS_API_KEY`) from `.env.local` (git-ignored); nothing persisted.

**Testing**: Vitest for pure logic only (sandbox runner, POI category/filter mapping, ALS URL/body builders). Broader validation is manual via `quickstart.md`. Tests are OPTIONAL per the constitution; kept minimal and targeted at fragile seams.

**Target Platform**: Modern desktop browsers (latest Chrome, Edge, Firefox, Safari). Mobile layout out of scope for v1.

**Project Type**: Single-project, client-side static web application (no backend).

**Performance Goals** (from spec Success Criteria): basemap visible < 5s on broadband (SC-001); HTML input → map + code reflected < 1s (SC-002); valid code apply → map update < 2s (SC-003).

**Constraints**: Pure client-side, no server. API key is exposed to the client and MUST be treated as low-privilege (scoped to `geo-maps` + `geo-places` default providers, referer-restricted, expiring). Minimal dependencies. Invalid code / failed / empty ALS requests must never blank or freeze the app (SC-006).

**Scale/Scope**: Single user, single page, three capability tabs. POI results capped to a display limit (~50) to stay responsive.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Status |
|-----------|------------|--------|
| I. Learning-First (NON-NEGOTIABLE) | Every capability ships a plain-language explanation + reference link (FR-008/009); raw ALS requests are visible by design; teaching notes accompany each ALS/MapLibre seam. | PASS |
| II. Fast Iteration Over Perfection | Static site, no backend, no AWS SDK; minimal deps; sliced by the three prioritized user stories so an MVP (US1) ships first. | PASS |
| III. AWS Location Service as the Backbone | Basemap (Maps v2) and POI (Places v2) delivered through ALS APIs, called as raw REST so the learner sees the actual operations (`GetStyleDescriptor`, `SearchNearby`/`SearchText`). | PASS |
| IV. MapLibre for Rendering | MapLibre GL JS is the sole renderer (incl. ALS 3D); ALS wired via standard `style` URL; 3D via style-request params (terrain/buildings) + runtime `setProjection`/`setPitch`. | PASS |
| V. Readable, Documented Integration Points | All ALS/MapLibre config centralized in `src/config.ts`; integration seams (`als/`, `map/`) commented with intent; no scattered credentials. | PASS |

**Result**: PASS - no violations. Complexity Tracking not required.

*Post-design re-check (after Phase 1): still PASS. The design keeps ALS calls as
raw, readable fetches; the one meaningful dependency judgment (Web Awesome, a
shadow-DOM component library) is documented in research.md with a zero-dep
fallback (Pico CSS) so the "minimal dependencies" value is honored by choice, not
by accident.*

## Project Structure

### Documentation (this feature)

```text
specs/001-als-map-explorer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── als-maps.md      # ALS Maps v2 style-URL contract (consumed)
│   ├── als-places.md    # ALS Places v2 request/response contract (consumed)
│   └── sandbox-scope.md # Internal contract: what an editable snippet receives
└── tasks.md             # Phase 2 output (/speckit-tasks - NOT created here)
```

### Source Code (repository root)

```text
index.html                 # Vite entry; map container + app root
vite.config.ts
tsconfig.json
package.json
.env.example               # VITE_ALS_API_KEY, VITE_AWS_REGION (copy to .env.local)

src/
├── main.ts                # bootstrap: build config, create map, mount panels
├── config.ts              # CENTRAL integration config: region, API key, endpoints, defaults
├── als/
│   ├── basemap.ts         # build the ALS Maps v2 style URL (raw, commented)
│   └── places.ts          # POI search via fetch to Places v2 (search-nearby/search-text)
├── map/
│   ├── mapController.ts    # create/own the MapLibre map; add/clear POI markers
│   └── threeD.ts           # ALS 3D features: style-request (terrain/buildings) + runtime (globe/pitch)
├── panels/
│   ├── codePanel.ts        # tabbed panel shell (Web Awesome tab-group)
│   ├── editor.ts           # CodeMirror wrapper: locked scaffold + editable region
│   ├── sandbox.ts          # run the edited region via new Function(injected scope)
│   ├── basemapTab.ts       # US1: inputs + snippet + explanation for the basemap
│   ├── poiTab.ts           # US2: inputs + snippet + explanation for POI search/filter
│   └── threeDTab.ts        # US3: inputs + snippet + explanation for 3D features (terrain/buildings/globe/tilt)
├── explain/
│   └── content.ts          # plain-language copy + reference links per capability
├── state/
│   └── store.ts            # tiny shared settings store (input↔code convergence)
└── styles/
    ├── app.module.css
    └── layout.module.css

tests/
└── unit/
    ├── sandbox.test.ts     # snippet runner: success, error isolation, scope
    └── places.test.ts      # request-body + category-filter builders
```

**Structure Decision**: Single client-side project rooted at the repo. Code is
grouped by concern so the ALS/MapLibre integration seams are isolated and
readable (`als/`, `map/`), the learning UI is one area (`panels/`, `explain/`),
and all configuration lives in one place (`config.ts`) per Constitution Principle
V. There is no backend, so no `backend/`+`frontend/` split.

## Complexity Tracking

No constitution violations; no justifications required.
