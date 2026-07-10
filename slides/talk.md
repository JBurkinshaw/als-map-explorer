---
marp: true
paginate: true
theme: default
title: Spec-Driven Development with Spec Kit
author: Joe Burkinshaw
style: |
  :root {
    --ink: #17211d;
    --muted: #6b7280;
    --accent: #0d9488;
    --accent-soft: #ccfbf1;
    --line: #e5e7eb;
    --bg: #ffffff;
  }
  section {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    color: var(--ink);
    background: var(--bg);
    font-size: 26px;
    padding: 64px 72px;
    justify-content: flex-start;
  }
  h1 { font-size: 52px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 8px; }
  h2 { font-size: 34px; font-weight: 650; letter-spacing: -0.01em; color: var(--ink); margin: 0 0 24px; }
  h2::after { content: ""; display: block; width: 56px; height: 4px; background: var(--accent); margin-top: 14px; border-radius: 2px; }
  strong { color: var(--accent); font-weight: 650; }
  a { color: var(--accent); }
  code { background: #f3f4f6; padding: 1px 7px; border-radius: 5px; font-size: 0.86em; }
  ul { line-height: 1.5; }
  li { margin: 6px 0; }
  section.lead { justify-content: center; text-align: left; }
  section.lead h1 { font-size: 60px; }
  .sub { color: var(--muted); font-size: 30px; font-weight: 400; margin-top: 6px; }
  .kicker { color: var(--accent); font-weight: 650; text-transform: uppercase; letter-spacing: 0.12em; font-size: 18px; margin-bottom: 10px; }
  .foot { position: absolute; bottom: 28px; left: 72px; color: var(--muted); font-size: 18px; }
  .demo { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; }
  .demo .badge { font-size: 22px; font-weight: 650; letter-spacing: 0.18em; text-transform: uppercase; color: #fff; background: var(--accent); padding: 10px 26px; border-radius: 999px; }
  .demo h2 { border: 0; margin-top: 26px; }
  .demo h2::after { display: none; }
  .demo ul { color: var(--muted); font-size: 24px; }
  .cols { display: flex; gap: 40px; }
  .cols > div { flex: 1; }
  .card { border: 1px solid var(--line); border-radius: 14px; padding: 20px 24px; }
  .card h3 { margin: 0 0 10px; font-size: 24px; }
  .pin h3 { color: var(--ink); }
  .del h3 { color: var(--accent); }
  /* flow diagram */
  .flow { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 6px; margin-top: 20px; }
  .node { border: 1.5px solid var(--ink); border-radius: 10px; padding: 10px 16px; font-size: 21px; font-weight: 600; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .node.hl { background: var(--accent); color: #fff; border-color: var(--accent); }
  .node.opt { border-style: dashed; color: var(--muted); border-color: var(--muted); font-weight: 500; }
  .arw { color: var(--accent); font-size: 24px; font-weight: 700; }
  /* feedback loop shown as its own small line: implement loops back to specify */
  .loopback { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 22px; }
  .loopback .node { font-size: 18px; padding: 7px 13px; }
  .loop-lead { color: var(--muted); font-size: 18px; }
  .arw.loop { font-size: 27px; }
  .legend { color: var(--muted); font-size: 19px; margin-top: 22px; line-height: 1.7; }
  .branch { display: flex; gap: 28px; margin-top: 18px; }
  .branch .card { flex: 1; }
  .big { font-size: 30px; line-height: 1.45; }
  blockquote { border-left: 4px solid var(--accent); margin: 24px 0 0; padding: 6px 0 6px 22px; color: var(--ink); font-size: 30px; }
---

<!-- _class: lead -->

<div class="kicker">Lightning talk</div>

# Spec-Driven Development
# with Spec Kit

<p class="sub">I wanted to try the workflow, and learn how AWS Location Service and MapLibre fit together.<br>So I built a small app to do both.</p>

<div class="foot">Joe Burkinshaw · Sparkgeo</div>

<!--
Open honest and low-key: this was a learning exercise, not a product launch. Two things I
wanted to learn - the spec-driven workflow, and how ALS + MapLibre fit - and building a
small app was how I did it. Don't oversell the app.
Set expectation: I'll flip to the running app and the repo a couple of times.
Optional dry aside (only if it feels right): "I barely wrote any of the code myself - which
is impressive and slightly unsettling in equal measure." Don't make it the headline.
-->

---

## Why I did this

Three things I wanted to get out of it:

- **Try Spec Kit** - get a feel for the spec-driven workflow with an AI agent
- **Learn ALS + MapLibre** - how AWS Location Service actually wires into MapLibre
- **Vanilla stack** - plain TypeScript + Vite + a *framework-agnostic* UI kit

<div class="legend">The app's nothing special - but building it was a good way to learn all three.</div>

<!--
Frame honestly: a learning exercise on three fronts. Keep it to ~30s. The app's fine,
nothing special - but it's real and it works, which is what makes the workflow worth
talking about. The learning was the point, not the app.
-->

---

<!-- _class: demo -->

<div class="badge">Demo</div>

## ALS Map Explorer

<ul>
<li>Basemap style + colour scheme</li>
<li>POI search &amp; category filters (ALS Places)</li>
<li>3D terrain, buildings, globe, tilt + topographic contours</li>
<li>Every tab: live map · HTML inputs · <b>editable code</b> · plain-language explainer · live request preview</li>
</ul>

<!--
SCREEN SHARE the app (~45s). Quick tour: switch basemap, run a POI search, tilt into 3D + contours.
Then show the editable code region updating the map, and the live request preview (real ALS request, key masked).
Land the learning-first idea: you see the actual requests, not an SDK wrapper.
-->

---

## Prompt and pray, or write it down first

Usual loop: **prompt → code**, and hope. Docs are an afterthought.

Spec-driven: write the reviewable stuff *first*, then let it build the code.

> The spec is the source of truth. The code falls out of it.

- Intent is written down **before** any code exists
- You catch a wrong assumption in a markdown file, not a 10-file diff
- It all stays in the repo - still there, and easy to search, long after the chat's gone

<!--
~30s. The one contrast that matters: catch mistakes in markdown, not in a diff.
"Byproduct" is a deliberate provocation - lean into it.
-->

---

## The Spec Kit pipeline

Each step is a `/speckit-*` command. It writes a markdown file, and **you read it before moving on**.

<div class="flow">
  <span class="node">constitution</span><span class="arw">→</span>
  <span class="node">specify</span><span class="arw">→</span>
  <span class="node opt">clarify</span><span class="arw">→</span>
  <span class="node">plan</span><span class="arw">→</span>
  <span class="node">tasks</span><span class="arw">→</span>
  <span class="node opt">analyze</span><span class="arw">→</span>
  <span class="node hl">implement</span>
</div>

<div class="loopback">
  <span class="loop-lead">after v1:</span>
  <span class="node hl">implement</span>
  <span class="arw loop">⟲</span>
  <span class="node">specify</span>
  <span class="loop-lead">for the next feature</span>
</div>

<div class="legend">
constitution = ground rules · specify = <b>what &amp; why</b> · clarify = kill ambiguity · plan = <b>how</b><br>
tasks = ordered checklist · analyze = cross-check the docs · implement = build it · <span style="color:#6b7280">dashed = optional</span>
</div>

<!--
~45s. Walk left to right. Emphasise: you read and sign off each file before moving on.
constitution once; specify has no tech in it yet; plan is where the tech decisions land; tasks are ordered and grouped by user story. clarify and analyze are optional (dashed) - see the fuller notes for what each does.
Point at the loop-back arrow: after the first build you don't start over - you loop back to specify for the next feature, and everything downstream flows from there again. That's the segue into the "iterating after v1" slide.
-->

---

## What it produces

<div class="cols">
<div>

```
specs/001-als-map-explorer/
  spec.md          what & why
  plan.md          how
  research.md      decisions + rationale
  data-model.md
  contracts/       ALS + sandbox
  tasks.md         38 ordered tasks
  checklists/
```

</div>
<div>

- 3 features, same shape:
  `001` app · `002` contours · `003` request preview
- Committed as **docs → feat** pairs
- User stories are **prioritised & independently testable** (P1 = shippable MVP)

</div>
</div>

<div class="legend">Setup → Foundational → US1 → US2 → US3 → Polish</div>

<!--
SCREEN SHARE the repo here (~40s): open specs/ and skim spec.md (a user story + acceptance scenarios) and tasks.md (checkbox tasks with file paths, grouped by story).
Point at the git log: each feature is a docs commit then a feat commit.
-->

---

## The prompts I actually typed

- **constitution:** a one-line aim → 5 principles (Learning-First is *non-negotiable*)
- **specify:** one paragraph describing the app → 3 user stories, 12+ requirements, success criteria with no tech in them
- **plan:** where I pinned tech *and* delegated research
- **delegate:** *"I like React's Mantine - find something framework-agnostic, research the options."*

<div class="legend">You type a bit of English. It writes the paperwork.</div>

<!--
~30s. The point: the inputs are tiny and in plain English. The structure is the tool's job.
This teed up the next slide: pin vs delegate.
-->

---

## Pin vs delegate

<div class="cols">
<div class="card pin">
<h3>I pinned (the non-negotiables)</h3>

- MapLibre as the only renderer
- ALS as **raw REST, no AWS SDK**
- Vanilla TS + Vite + CSS Modules
- Not Tailwind · client-side API key

</div>
<div class="card del">
<h3>I delegated → research.md</h3>

- **Web Awesome** (vs Shoelace / Material / Pico)
- ALS v2 REST params + auth
- `contour-density` = **Low / Med / High**
- "isolines" ≠ contours (it's the Routes API)
- CodeMirror vs Monaco

</div>
</div>

> Pin the things that define the project. Let it research the rest - and make it write down *why*.

<!--
~50s - this is the richest slide. Two real examples:
1. Web Awesome: I said "Mantine but framework-agnostic"; the agent compared options and recorded a Pico CSS fallback so "minimal deps" stayed a decision, not an accident.
2. "isolines": research showed ALS isolines = CalculateIsolines (isochrones), NOT contour lines - so it split into "contours now, isochrones later". Research stopped me building the wrong thing.
-->

---

## Iterating after v1

I shipped the app - then had bugs *and* feature ideas. What goes through the pipeline?

<div class="branch">
<div class="card">
<h3>🐞 Bug</h3>
Fix it <b>directly</b>.<br>Fold back into <code>spec.md</code> only if it exposed a spec gap.
</div>
<div class="card">
<h3>✨ New capability</h3>
Back through the loop:<br><code>specify → plan → tasks → implement</code> as a new <code>00N</code> spec.
</div>
</div>

<div class="legend">
<b>Real bugs I hit:</b> the map didn't resize properly · the attribution control rendered wrong · AWS rejected a POI category ID. All fixed directly - no spec needed.<br>
<b>analyze</b> checks the docs against each other · <b>converge</b> checks the code against the docs.
</div>

<!--
~50s. This is the bit that genuinely confused me at first, so it's worth landing clearly.
Spec Kit has no "fix the bugs" stage. Bugs -> fix directly (I got Claude to read the code and work out what was actually wrong first). New behaviour -> back through the workflow.
The three real bugs are good, honest examples: (1) map didn't size right until you resized the window; (2) duplicate/oddly-styled attribution control; (3) POI category filter sent an invalid ID (fuel_station) that AWS bounced - a doc-cross-check fix. None of these are spec changes, so none went near the workflow.
Then the tools: analyze reads only the three docs; converge reads the actual code. Concrete win: analyze caught a "contours = boolean" vs a 4-value enum mismatch - a one-line fix before any code.
-->

---

## What it cost / honesty

- First `/implement` was **token-hungry** - it built the whole app in one run
- After that, bug fixes and small features were **much cheaper** - the ground rules were already there
- Tests kept **minimal on purpose** (constitution: tests optional) - 19 unit tests on the fiddly bits (the sandbox runner, the request builders)
- Automated checks = typecheck + tests + build; **full verification still needs a browser + real API key**

<!--
~30s. Be candid. The interesting bit is the shape of it: expensive to get going, cheap to add to, because the ground rules and earlier specs were already sat there. Dry aside if you want it: "nice of it to build the whole app before I could object to any of it."
-->

---

<!-- _class: lead -->

## Takeaways

- The docs are the product; **the code just comes out of them**
- Bug? Fix it. New capability? **Back through the workflow.**
- A cheap read-through catches what a **10-file diff** wouldn't
- Write the rules down once - **the next feature comes easier**

<!--
~20s. Fast recap - don't linger, the real point is the next slide.
-->

---

<!-- _class: lead -->

## None of this is new

> The lifecycle had these stages long before AI - spec, design, build, review.<br><b>Spec-driven dev just drags you into actually doing them.</b>

<p class="sub">Yes, it leans a bit waterfall, and the trick is balance, not swinging back. But the real point: these stages exist for a reason. Done with real expertise, AI can speed up all of them - done without it, you just push the cost down the road. And honestly? The long-term cost is still to be determined, even when we think we're doing it well.</p>

<div class="foot">Joe Burkinshaw · Sparkgeo · repo + slides in <code>als-demo</code></div>

<!--
~35s and the note to end on. Three beats, building:
1. This isn't a new religion - it's old discipline the tooling nudges you into.
2. It leans a bit waterfall; the answer is balance with agile, not swinging back.
3. The one that matters, and be honest about the uncertainty: these stages exist for good
   reasons, from before AI. Done with real expertise, AI can genuinely speed up all of
   them - spec, design, build, review, not just the typing. Done without that expertise,
   it doesn't remove the work; it kicks the cost down the road - bugs, rework, spec drift
   you pay for later. And even when we think we're doing it well, the long-term cost is
   still unknown. So value the process, and value the people with the expertise to run
   each stage - that's what decides whether AI actually saves you anything.
Good, honest, slightly provocative note to open Q&A on.
-->

