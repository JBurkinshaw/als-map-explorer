# ALS Map Explorer

An interactive learning tool for seeing how **AWS Location Service (ALS)** and
**MapLibre GL JS** fit together. It renders an Amazon basemap and lets you explore
three capabilities - the basemap, POI search/filter, and the ALS 3D features -
through a dual-control model: change a setting with an HTML input **or** edit the
live code that drives the map, and watch both stay in sync. Each capability has a
plain-language explanation and a link to the authoritative reference.

## Prerequisites

- Node.js 20+ and npm
- An **AWS Location Service API key** and the AWS region it belongs to

### Provisioning an API key

Create a key scoped to the Maps and Places services (read-only by nature). Using
the AWS CLI:

```sh
aws location create-key --key-name als-map-explorer \
  --restrictions '{"AllowActions":["geo-maps:*","geo-places:*"],"AllowResources":["arn:aws:geo-maps:<region>::provider/default","arn:aws:geo-places:<region>::provider/default"]}' \
  --no-expiry
```

For anything beyond a local demo, add a referer restriction and an expiry. The key
is sent from the browser, so treat it as low-privilege and public.

## Setup

```sh
npm install
cp .env.example .env.local   # then fill in VITE_ALS_API_KEY and VITE_AWS_REGION
```

`.env.local` is git-ignored - never commit your key.

## Commands

```sh
npm run dev        # start the dev server (opens the app)
npm run build      # type-check + production build
npm run preview    # preview the production build
npm run test       # run the unit tests
npm run typecheck  # type-check only
```

## How ALS + MapLibre integrate (the short version)

- **Basemap** - ALS serves the map as a MapLibre *style* URL:
  `https://maps.geo.<region>.amazonaws.com/v2/styles/<Style>/descriptor?key=<KEY>&color-scheme=<Light|Dark>`.
  You hand that URL to MapLibre and it fetches the tiles, glyphs, and sprites itself.
  See `src/als/basemap.ts`.
- **POI search** - the ALS Places service is called as raw REST: a `fetch` POST to
  `/v2/search-nearby` (or `/v2/search-text`) with a JSON body, filtered by category
  IDs via `Filter.IncludeCategories`. See `src/als/places.ts`.
- **3D features** - controlled two ways, which is the key lesson:
  - *Style-request* features (**terrain**, **buildings**) are query params on the
    basemap URL (`&terrain=Terrain3D`, `&buildings=Buildings3D`), so the map reloads
    its style.
  - *Runtime* features (**globe view**, **camera tilt**) are MapLibre calls
    (`map.setProjection(...)`, `map.setPitch(...)`) that change the live map with no
    reload. You need pitch > 0 to actually see terrain relief and building height.

  See `src/map/threeD.ts`.

The editable code regions run in a sandboxed scope (`src/panels/sandbox.ts`) using
`new Function(...)` with an explicitly injected set of helpers, so a bad edit shows
an error instead of blanking the map.

## Project layout

```
src/
  config.ts        # central ALS/MapLibre config (region, key, endpoints, defaults)
  als/             # raw ALS calls: basemap style URL, Places search
  map/             # MapLibre map controller + 3D orchestration
  panels/          # tabbed code panel, locked editor, sandbox, per-capability tabs
  explain/         # plain-language explanations + reference links
  state/           # shared settings store (keeps inputs and code in sync)
  ui/              # non-fatal notice banner
```

See `specs/001-als-map-explorer/` for the full spec, plan, and design docs.
