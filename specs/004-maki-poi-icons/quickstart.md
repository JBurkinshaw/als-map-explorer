# Quickstart: Maki POI Icons

Validation steps that prove the feature works end-to-end. Full interactive checks need a
browser and a real ALS API key.

## Prerequisites

- `.env.local` with `VITE_ALS_API_KEY` and `VITE_AWS_REGION` set (as for the rest of the app).
- Network access (ALS + the jsDelivr CDN for icons).
- Dependencies installed: `npm install`.

## Automated checks

```bash
npm run test        # includes tests/unit/poiIcons.test.ts (iconNameFor selection + fallback)
npx tsc --noEmit    # typecheck
npm run build       # production build succeeds
```

Expected: unit tests green (including the new `poiIcons` suite), 0 type errors, clean build.

## In-browser validation (US1 - icons on the map)

```bash
npm run dev
```

1. Run a POI search that returns mixed types (e.g. nearby search around the default Vancouver
   centre, or select several category filters). → Markers render with **type-appropriate
   icons**: coffee shops show a cup, fuel stations a pump, hotels a bed, hospitals a medical
   icon, etc. Different categories are visibly distinguishable (SC-001, FR-001).
2. Confirm every returned POI has a marker - anything unmapped shows the **generic fallback
   marker**, never a blank (FR-003, SC-002).
3. Click a marker. → Its **details popup is unchanged** from before (FR-006).
4. Toggle each of the eight category filters in turn and confirm each renders a distinct icon
   (SC-003, FR-011).

## In-browser validation (US2 - see and edit the mapping)

1. In the POI tab, confirm the **category-to-icon mapping is shown** with a plain-language
   explanation and a **Maki reference link** that opens the icon gallery (FR-007, FR-009, SC-005).
2. In the editable icon snippet, change a mapping - e.g. `setPoiIcons({ hotel: 'castle' })` -
   and Apply. → Hotel markers switch to the new icon (FR-008).
3. Apply an **invalid** name - e.g. `setPoiIcons({ hotel: 'not-a-real-icon' })`. → Affected
   markers fall back to the generic marker with a non-fatal notice; the map keeps working
   (SC-006, US2 scenario 4).

## Success criteria coverage

| Criterion | Where verified |
|-----------|----------------|
| SC-001 distinguish major types by icon | US1 step 1 |
| SC-002 100% of POIs show a marker      | US1 step 2 |
| SC-003 eight filter categories distinct| US1 step 4 / unit test |
| SC-004 edit mapping, see update <2 min | US2 step 2 |
| SC-005 Maki reference link resolves    | US2 step 1 |
| SC-006 invalid name never blanks map   | US2 step 3 / unit fallback |
