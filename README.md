# ALS Map Explorer

An interactive learning tool for seeing how **AWS Location Service (ALS)** and
**MapLibre GL JS** fit together. It renders an Amazon basemap and lets you explore
three capabilities - the basemap, POI search/filter, and the ALS 3D features -
through a dual-control model: change a setting with an HTML input **or** edit the
live code that drives the map, and watch both stay in sync. Each capability has a
plain-language explanation and a link to the authoritative reference.

## Why this exists

This is a personal learning exercise. I built it with [GitHub Spec Kit](https://github.com/github/spec-kit)
to get hands-on with three things at once: the spec-driven-development workflow,
**AWS Location Service**, and how it integrates with **MapLibre**. It also doubles as
the running example for a short **lightning talk** on spec-driven development. The app
itself is the vehicle - the learning was the point.

The talk deck and speaking notes are in `slides/`, and the spec-driven artifacts
(spec, plan, research, tasks) for each feature are in `specs/`.

## Prerequisites

- Node.js 20+ and npm
- An **AWS Location Service API key** and the AWS region it belongs to

### Provisioning an API key

You need a key scoped to the Maps and Places services (read-only by nature). Do it
whichever way you prefer.

#### Via the AWS Management Console

1. Sign in and open the **Amazon Location Service** console. Pick your **region**
   (top-right) - remember it; it goes in `VITE_AWS_REGION`.
2. In the left nav choose **API keys**, then **Create API key**.
3. Give it a name (e.g. `als-map-explorer`).
4. Under resource restrictions, allow the **Maps** and **Places** actions
   (`geo-maps:*` and `geo-places:*`) for the region's default provider.
5. (Optional but recommended for anything public) add an **allowed referer** URL and
   an **expiry**.
6. **Create** the key, then copy its value - this is your `VITE_ALS_API_KEY`.

#### Via the AWS CLI

```sh
aws location create-key --key-name als-map-explorer \
  --restrictions '{"AllowActions":["geo-maps:*","geo-places:*"],"AllowResources":["arn:aws:geo-maps:<region>::provider/default","arn:aws:geo-places:<region>::provider/default"]}' \
  --no-expiry
```

Either way: for anything beyond a local demo, add a referer restriction and an expiry.
The key is sent from the browser, so treat it as low-privilege and public.

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
