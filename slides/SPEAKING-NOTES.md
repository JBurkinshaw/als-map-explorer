# Speaking notes - Spec-Driven Development with Spec Kit

Target: **~5 minutes** (lightning). Two live screen-shares (app + repo). The deck is
deliberately light so the demos carry the detail. Presenter notes are also embedded in
`talk.md` as HTML comments, so Marp's presenter view shows them per slide.

As written the notes below add up to roughly **6:30-7:00** - the two demos eat most of it.
For a hard 5 minutes: drop the two slides marked **(cut first)** and keep the demos to a
brisk sub-40s each. If you've got 8-10 minutes, leave it all in and let the demos breathe.

---

### 1 · Title - 0:15
Open flat, no drum-roll:
> "I wanted to get a feel for spec-driven development, and to actually learn how AWS
> Location Service and MapLibre fit together. So I built a small app with Spec Kit to do
> both - and it's the workflow, not the app, that turned out to be worth talking about."

Mention it's a lightning talk and you'll jump into the app and the repo a couple of times.
Optional dry aside, don't lead with it: "I barely wrote any of the code myself - impressive
and slightly unsettling in equal measure."

### 2 · Why I did this - 0:30
Frame it as a learning exercise with three goals: (1) get a feel for Spec Kit's workflow,
(2) actually learn how ALS wires into MapLibre, (3) prove out a vanilla TS + Vite stack
with a framework-agnostic UI kit. The app itself is nothing special - decent, works, not a
showpiece - and that's fine. Building it was a genuinely good way to learn all three; the
learning was the point.

### 3 · DEMO: the app - 0:45  *(screen-share)*
Quick tour, don't linger:
- Switch basemap style / colour scheme.
- Run a POI search, toggle a category filter.
- Tilt into 3D, turn on terrain + contours.
- Show the **editable code region** changing the map, and the **live request preview**
  (the real ALS request, API key masked).
Land the learning-first idea: you see the *actual* requests, not an SDK's output.

### 4 · Prompt-and-pray vs SDD - 0:30
One breath: instead of prompt → code and hope, you write the reviewable stuff first and
let it build the code. The line that matters: **you catch a wrong assumption in a
markdown file, not in a 10-file diff.** Don't oversell it - just state it.

### 5 · The pipeline - 0:45
Walk the flow left to right: `constitution → specify → (clarify) → plan → tasks →
(analyze) → implement`. The one thing to stress: **you actually read and sign off each
file before moving on**. Note that `specify` has no tech in it yet (no stack named); the
stack decisions land in `plan`.

Point at the **loop-back arrow**: you don't run this once. After the first build you loop
back to `specify` for the next feature (that's how 002, 003 and 004 got added), and it
flows downstream again. This is the segue into "iterating after v1".

**The two optional steps (dashed) - expand on these:**

- **clarify** (runs between specify and plan): it reads your spec and asks a handful of
  targeted questions (up to ~5) about the bits that are ambiguous or could be read two ways,
  then writes your answers straight back into `spec.md` under a "Clarifications" section. It's
  how you kill "wait, did we mean X or Y?" *before* it becomes a wrong design. In this project
  it asked things like "what does editing the code actually mean?" and "client-side or a
  backend?" - and those three answers shaped the whole architecture. Skip it when the spec has
  no real ambiguity (I skipped it for the Maki-icons feature because the spec was already tight).
- **analyze** (runs after tasks, before implement): a read-only cross-check of the three
  documents against **each other** - spec vs plan vs tasks - looking for contradictions, gaps,
  and things in one doc that never made it into another. It does **not** read your code and
  won't find runtime bugs. It's a cheap "do these three still agree?" gate before you spend
  tokens building. Real catch on an earlier feature: it flagged a spec that described contours
  as on/off while the data model had a four-value enum - a one-line fix before any code.
  (Its cousin `converge`, which I mention on the iteration slide, is the opposite: it reads the
  actual code against the docs.)

### 6 · DEMO: the repo - 0:40  *(screen-share)*
Open `specs/` and show the shape: `spec.md`, `plan.md`, `research.md`, `tasks.md`,
`contracts/`. Skim one user story with its acceptance scenarios, and the `tasks.md`
checkbox format (each task has a file path, grouped by user story). Then the git log:
for 001-003 each feature is a **docs commit then a feat commit** - the writing and the
code kept separate.
Honest aside if the log is on screen: the newest feature (004, the Maki icons) I committed
in a single `feat:` - spec, code and slides together. Classic discipline slip: the tooling
nudges you toward separating them but doesn't enforce it. Which is, neatly, the point of the
closing slide - the process only works if the people keep it up.

### 7 · The prompts I typed - 0:30  **(cut first)**
Point: the inputs are tiny and in plain English; the structure is the tool's job.
Constitution from a one-liner; spec from a paragraph; and the delegation prompt -
*"I like Mantine, find something framework-agnostic, research the options."*

### 8 · Pin vs delegate - 0:50
The richest slide. Left = the non-negotiables I pinned (MapLibre, ALS raw REST/no SDK,
vanilla TS, not Tailwind). Right = what I handed to the agent to research, all captured
in `research.md`. Three concrete stories:
- **Web Awesome**: I asked for "Mantine but framework-agnostic"; it compared Shoelace /
  Material (rejected: maintenance mode) / Pico and recorded a Pico fallback, so
  "minimal dependencies" stayed a *decision*.
- **"isolines"**: research found ALS isolines = the Routes `CalculateIsolines` API
  (isochrones), not contour lines - so it split into "contours now, isochrones later."
  Research stopped me building the wrong thing.
- **Maki icons** (the newest feature): I said "use Maki, find the simplest way to get
  them". Plan-phase research chose fetching from a CDN over adding the npm package or
  vendoring SVGs, and by checking the live set found there is no `atm` icon - so ATMs map
  to `bank`. Both decisions came from checking, not guessing. Freshest example, and the
  one I can show end-to-end in the repo (spec → research.md → the config map).
Close: **pin what defines the project, hand off the rest - and make it write down why.**

### 9 · Iterating after v1 - 0:50
Be honest that this confused me at first: Spec Kit has **no "fix the bugs" stage.**
- **Bug** → fix directly (I got Claude to read the code in parallel and work out what was
  actually wrong first); fold back into
  `spec.md` only if it revealed a spec gap.
- **New capability** → back through the loop as a new `00N` spec.
- `analyze` reads only the three docs (contradictions/gaps); `converge` reads the actual
  code (drift / half-built work). Concrete win: `analyze` caught a "contours = boolean"
  vs 4-value-enum mismatch - a one-line fix *before* any code.

Real bugs I hit, all fixed directly (good, honest examples):
- **Map didn't resize** properly - it only sorted itself out when you resized the window.
- **Attribution control rendered wrong** - duplicated / oddly styled.
- **AWS rejected a POI category ID** - the filter sent `fuel_station`, which isn't a valid
  ALS category; cross-checking the docs showed the right ID is `petrol-gasoline_station`
  (and `supermarket` was wrong too - should be `grocery`). A defect, not a spec change, so
  it never went near the workflow.

### 10 · Cost / honesty - 0:25  **(cut first)**
The shape of it is the story: the first `/implement` was token-hungry (built the whole
app at once); bug fixes and small later features were much cheaper because the ground
rules were already there. Tests kept minimal on purpose (19, on the fiddly bits). Full
verification still needs a browser and a real API key. Dry aside if it lands: "nice of
it to build the whole thing before I could object to any of it."

### 11 · Takeaways - 0:20
Fast recap, four lines, don't linger - the real closer is the next slide. Main line to
say out loud: **the docs are the product; the code just comes out of them.**

### 12 · None of this is new - 0:35
The note to end on. Three beats, building:
1. This isn't a new religion - it's old discipline (spec, design, build, review) that the
   tooling now nudges you into actually doing.
2. Name the tension: it leans a bit **waterfall**, and we spent years learning not to do
   that; the job is **balance**, not swinging back to big-design-up-front.
3. The one that matters, and be honest about the uncertainty: **the software lifecycle
   already had these stages, for good reasons, long before AI.** Done with real expertise,
   AI can genuinely speed up *all* of them - spec, design, build, review - not just the
   typing. Done without that expertise, it doesn't remove the work; it just kicks the cost
   down the road: bugs, rework, spec drift you pay for later. And be straight about it -
   even when we think we're doing it well, the long-term cost is still to be determined.
   So **value the process, and value the people with the expertise to run each stage** -
   that's what decides whether AI actually saves you anything or just defers the bill.

End there - it's an honest, slightly provocative note that opens the room for questions.
Then point people at the repo (spec + slides live inside it).

---

## Facts you can rely on (checked against the repo)
- 4 features under `specs/`: `001-als-map-explorer`, `002-contours-learning-depth`,
  `003-request-preview-doc-links`, `004-maki-poi-icons`. All committed.
- Task counts: **001 = 38, 002 = 18, 003 = 14, 004 = 13.**
- 001 phases: Setup → Foundational → US1 (P1/MVP) → US2 → US3 → Polish.
- Constitution: 5 principles, Learning-First is NON-NEGOTIABLE.
- `contour-density` values: **Low / Medium / High** (from `002/research.md`).
- Maki: icons fetched from a pinned CDN (`@mapbox/maki@8.2.0`), no `atm` icon so ATMs
  use `bank`; map in `src/config.ts` (`POI_ICON_MAP`), resolver in `src/map/poiIcons.ts`.
- Stack: maplibre-gl ^5.24, CodeMirror 6, Web Awesome ^3.10, Vite 6, Vitest 3 -
  no AWS SDK. **24 unit tests** (5 for the Maki resolver).
- Commit rhythm: `docs:` then `feat:` per feature for 001-003; 004 I committed in one
  `feat:` (see `git log`) - the discipline-slip honesty beat.

## If Q&A / you have extra time
- Clarify step recorded 3 answers straight back into `spec.md` (hybrid editable region,
  pure client-side + API key, single tabbed panel).
- The request-preview reuses the **same request-builder functions** that send real
  requests, so the preview can't drift from reality - a design decision made at spec time.
