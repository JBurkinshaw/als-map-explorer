<!--
SYNC IMPACT REPORT
Version change: (template / unversioned) → 1.0.0
Bump rationale: Initial ratification. First concrete constitution replacing the
  unfilled template, establishing 5 core principles plus constraints, workflow,
  and governance sections.
Modified principles: n/a (initial definition)
  - PRINCIPLE_1 → I. Learning-First (NON-NEGOTIABLE)
  - PRINCIPLE_2 → II. Fast Iteration Over Perfection
  - PRINCIPLE_3 → III. AWS Location Service as the Backbone
  - PRINCIPLE_4 → IV. MapLibre for Rendering
  - PRINCIPLE_5 → V. Readable, Documented Integration Points
Added sections:
  - Technology & Integration Constraints (SECTION_2)
  - Development Workflow (SECTION_3)
Removed sections: none
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no change needed (generic
    "Constitution Check" gate; reads this file at plan time)
  - .specify/templates/spec-template.md ✅ no change needed (no constitution
    coupling)
  - .specify/templates/tasks-template.md ✅ no change needed (tests already
    OPTIONAL, consistent with fast-iteration stance)
  - .specify/templates/checklist-template.md ✅ no change needed
Follow-up TODOs: none
-->

# ALS Demo Constitution

## Core Principles

### I. Learning-First (NON-NEGOTIABLE)

The purpose of this project is to teach the developer how AWS Location Service
(ALS) and MapLibre integrate. Every feature MUST advance that understanding.

- Each ALS API call introduced MUST be accompanied by a plain-language note on
  what it does, what inputs it takes, and what it returns.
- Development MUST surface tips and lessons as work proceeds: why an approach was
  chosen, common pitfalls, and how the pieces fit together.
- When a shortcut is taken for speed, the tradeoff MUST be named so the lesson is
  not lost.

Rationale: The deliverable is comprehension as much as a working tool. Code with
no explanation fails the primary goal even if it runs.

### II. Fast Iteration Over Perfection

Working software in small increments beats polished software delivered slowly.

- Ship the smallest thing that runs and demonstrates the concept, then improve.
- Apply YAGNI: build what the current step needs, not speculative abstractions.
- Prefer running spikes and visible results over exhaustive up-front design.
- Refactoring is expected and welcome once a concept is understood; premature
  hardening is not.

Rationale: The developer learns fastest from seeing things work and iterating.
Optimizing prematurely slows the learning loop.

### III. AWS Location Service as the Backbone

Geospatial capabilities (maps, places/search, routes, geofences, trackers) MUST
be delivered through AWS Location Service APIs rather than reimplemented or
sourced elsewhere.

- ALS APIs SHOULD be exercised directly enough that the developer sees the raw
  requests and responses, not only a wrapper's output.
- Where an SDK or helper hides a call, the underlying ALS operation MUST be named
  so it can be understood.

Rationale: The project exists to learn ALS. Bypassing it defeats the purpose.

### IV. MapLibre for Rendering

Client-side map rendering MUST use MapLibre GL JS.

- ALS map resources MUST be wired to MapLibre through standard patterns (style
  URLs, tile/glyph/sprite sources, and the appropriate authentication helper).
- Custom rendering that circumvents MapLibre's model SHOULD be avoided unless a
  lesson specifically calls for it.

Rationale: MapLibre is the chosen rendering layer; consistent use keeps the
integration story coherent and transferable.

### V. Readable, Documented Integration Points

Clarity outranks cleverness, especially at the seams between ALS and MapLibre.

- Integration points (authentication, style loading, API request construction)
  MUST be readable and commented with intent, not just mechanics.
- Configuration such as region, resource names, and credentials MUST be obvious
  and centralized, not scattered or hard-coded in surprising places.

Rationale: The integration seams are where the learning happens; they must be
easy to read and revisit.

## Technology & Integration Constraints

- Rendering: MapLibre GL JS.
- Geospatial backend: AWS Location Service (Maps, Places, Routes, Geofences,
  Trackers as needed).
- Authentication to ALS SHOULD use a documented, low-friction mechanism (for
  example API keys or the Amazon Location authentication helper with Cognito);
  the chosen mechanism MUST be explained when introduced.
- Secrets and credentials MUST NOT be committed to the repository.
- Prefer widely used, well-documented tooling so examples map to public AWS and
  MapLibre docs the developer can follow.

## Development Workflow

- Work in small, demonstrable steps; each step SHOULD end in something runnable.
- Explain proposed changes before making them and get approval prior to editing
  code.
- Accompany new ALS or MapLibre usage with a short teaching note (what, why, and
  gotchas).
- Automated tests are OPTIONAL and added only when they aid learning or protect a
  fragile integration; their absence is acceptable in the spirit of fast
  iteration.
- Keep a lightweight record of lessons learned so understanding compounds.

## Governance

- This constitution supersedes other process preferences for this project.
- Amendments are made by updating this file, adjusting the version per the policy
  below, and refreshing the Sync Impact Report at the top.
- Versioning policy (semantic):
  - MAJOR: removal or incompatible redefinition of a principle or governance rule.
  - MINOR: a new principle or section, or materially expanded guidance.
  - PATCH: clarifications, wording, or typo fixes with no semantic change.
- Because fast iteration is a core value, compliance review is lightweight: at
  planning and review time, confirm work honors the Learning-First and
  ALS/MapLibre principles. Justify any deliberate deviation in the relevant
  plan or PR.

**Version**: 1.0.0 | **Ratified**: 2026-07-08 | **Last Amended**: 2026-07-08
