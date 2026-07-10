# Quickstart / Validation: Topographic Contours & Deeper Learning Context

Manual validation that feature 002 works end-to-end. Assumes the 001 app runs (see
`specs/001-als-map-explorer/quickstart.md`) with a valid `VITE_ALS_API_KEY` and
`VITE_AWS_REGION` in `.env.local`.

## Setup

```bash
npm install
npm run dev      # open the printed localhost URL
```

Optional checks:

```bash
npm run build    # tsc typecheck + vite build
npm run test     # vitest (includes the contour URL-builder test)
```

## US1 - Topographic contours (P1)

1. Open the **3D features** tab.
2. Confirm a **contours** control appears alongside terrain and buildings.
3. Turn contours **on** → the basemap reloads and topographic contour lines appear.
   - Expected outcome: **SC-001** - the map visibly changes on toggle; the setting is not a dead control.
4. Turn contours **off** → contour lines disappear; the map is never blank/frozen (**SC-002**).
5. In the code region, change the contours value and click **Apply code** → the map matches the HTML control, and the two stay in sync (**SC-003**, FR-006).
6. Enable contours together with terrain and/or buildings → all requested style features render together (single combined style request).
7. Read the tab: a plain-language explanation and a reference link describe contours as an ALS style-request feature (FR-005).

Failure-path check: temporarily use an invalid key (or offline) and toggle contours →
the last working map stays visible and a notice is shown (FR-007).

## US2 - Richer code context (P2)

For each tab (basemap, POI, 3D):

1. Confirm the code region shows the editable line **inside its enclosing call** and
   nearby real context, not a single bare line (**SC-004**, FR-008).
2. Try to edit the surrounding scaffold → edits are blocked; only the intended region is
   editable (FR-009).
3. Apply a valid edit → behaviour is identical to before the context expansion (FR-010).

## US3 - Deeper ALS + MapLibre explanations (P3)

For each tab:

1. Confirm the explanation describes **both** the AWS Location Service request/response
   and how **MapLibre** consumes the result (FR-011).
2. Confirm it renders as **more than one paragraph/block** (not one run-on line) and a
   working reference link is present (**SC-005**, FR-012).

## Done when

- All three user stories pass their checks above.
- `npm run build` and `npm run test` are green.
- No console errors on toggle/apply; the map never blanks or freezes.
