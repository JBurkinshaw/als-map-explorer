# Quickstart / Validation: Live Request Preview & Complete Documentation Links

Manual validation for feature 003. Assumes the app runs (see 001 quickstart) with a valid
`VITE_ALS_API_KEY` and `VITE_AWS_REGION` in `.env.local`.

## Setup

```bash
npm install
npm run dev      # open the printed localhost URL
```

Checks:

```bash
npm run build    # tsc typecheck + vite build
npm run test     # vitest (includes preview + masking tests)
```

## US1 - Live request preview (P1)

**POI tab**
1. Confirm a read-only request preview is shown (method, endpoint URL, JSON body).
2. Change radius / categories / max results → the preview updates live to match (**SC-001**).
3. Switch nearby ↔ text mode → the endpoint and body shape change accordingly (FR-003).
4. Apply a change via the code region → the preview reflects it (FR-002, preview == what is sent).
5. Confirm the URL shows `key=***` - the real key never appears (**SC-002**, FR-005).

**3D tab**
1. Confirm a read-only preview of the style-descriptor URL is shown.
2. Toggle terrain / buildings / contours and change colour scheme → the URL's query params
   update to match (FR-004).
3. Confirm `key=***` in every state (**SC-002**).

**Fidelity**: for a given input, the previewed request equals what the app sends (compare the
network request in devtools to the preview, ignoring the masked key) (**SC-003**, FR-007).

## US2 - Complete documentation links (P2)

For each tab (basemap, POI, 3D):
1. Confirm at least three clearly-labelled documentation links are shown (**SC-004**, FR-008).
2. Confirm each opens in a new tab and does not navigate away from the app (FR-009).
3. Spot-check the 3D tab includes the 3D-map, topographic/contours, GetStyleDescriptor, and
   MapLibre camera links; the POI tab includes search-nearby, search-text, the API reference,
   and the category doc (FR-010).

## Done when

- Both user stories pass their checks.
- `npm run build` and `npm run test` are green (including the key-masking test).
- The API key never appears in any preview, in any state.
