# Quickstart & Validation: ALS Map Explorer

How to set up, run, and validate the feature end-to-end. Implementation details
live in `tasks.md`; this is a run/validation guide. See `data-model.md` and
`contracts/` for shapes.

## Prerequisites

- Node.js 20+ and npm.
- An AWS account with AWS Location Service available in your region.
- An **ALS API key** scoped to `geo-maps:*` and `geo-places:*` on the default
  providers, ideally with a referer restriction and an expiry. Create via console
  or CLI:
  ```bash
  aws location create-key --key-name als-demo-key \
    --restrictions '{"AllowActions":["geo-maps:*","geo-places:*"],"AllowResources":["arn:aws:geo-maps:<region>::provider/default","arn:aws:geo-places:<region>::provider/default"]}' \
    --no-expiry
  ```

## Setup

```bash
npm install
cp .env.example .env.local
# edit .env.local:
#   VITE_ALS_API_KEY=v1.public.<your-key>
#   VITE_AWS_REGION=<your-region>   e.g. eu-central-1
```

## Run

```bash
npm run dev      # Vite dev server, open the printed localhost URL
npm run build    # production static build to dist/
npm run test     # optional: Vitest unit tests
```

## Validation scenarios

Each maps to a user story in `spec.md`. Run them in order; each is independently
demonstrable.

### US1 - Basemap + editable code (P1, MVP)
1. Load the app → a 2D Amazon basemap renders within ~5s at the default
   center/zoom. **(SC-001, FR-001)**
2. On the **Basemap** tab, change the style select (e.g. Standard → Monochrome)
   and color scheme → the map updates and the editable code region reflects the
   new value within ~1s. **(SC-002, FR-002/004)**
3. Edit the editable region in the code panel (e.g. change the style name) and
   click Apply → the map updates within ~2s. **(SC-003, FR-003)**
4. Put invalid code in the editable region and Apply → a clear error appears and
   the last working map stays visible. **(SC-006, FR-010)**
5. Click Reset → the editable region returns to its original snippet. **(FR-011)**
6. Click the reference link → the ALS Maps doc page opens. **(SC-005, FR-009)**

### US2 - POI search & filter (P2)
1. On the **POI** tab, run a search near the current view → matching POIs appear
   as markers. **(FR-005)**
2. Toggle category filters (e.g. only "coffee_shop") → only matching POIs remain.
   **(FR-006)**
3. Edit the POI editable region (e.g. change radius or category) and Apply →
   results update. **(FR-003)**
4. Search an area with no matches → a clear "no results" indication (no error).
   **(Edge case)**
5. Click a marker → basic POI details show (name, category, address). **(FR-012)**
6. Reference link opens the ALS Places doc. **(SC-005)**

### US3 - ALS 3D features (P3)
1. On the **3D** tab, enable **3D terrain** → elevation renders as a 3D surface
   with the camera tilted so relief is visible; basemap and POIs preserved.
   **(FR-007)**
2. Enable **3D buildings** → building footprints render with height/volume.
   **(FR-007)**
3. Toggle **globe view** → the map switches between a 3D globe and a flat map.
   **(FR-007)**
4. Change the **tilt (pitch)** slider → the viewing angle updates. **(FR-007)**
5. Note the explanation distinguishes style-request features (terrain, buildings)
   from runtime features (globe, tilt). **(FR-013)**
6. Edit the 3D editable region (e.g. terrain on/off, or pitch) and Apply → the map
   updates and controls reflect it. **(FR-003/004)**
7. Reference links open the ALS 3D and MapLibre docs. **(SC-005)**

### Cross-cutting
- Remove/blank the API key in `.env.local`, reload → a clear, actionable message
  appears instead of a blank map. **(SC-006, Edge case)**
- Every on-screen reference link resolves to a live ALS/MapLibre page. **(SC-005)**

## Done / acceptance

The feature is validated when all US1-US3 scenarios pass and no scenario leaves
the app blank or frozen.
