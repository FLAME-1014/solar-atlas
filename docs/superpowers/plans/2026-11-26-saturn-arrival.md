# Saturn Arrival Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let first-time visitors arrive at Saturn through a brief, legible, reduced-motion-aware star-map camera tour, then continue exploring.

**Architecture:** Extend the existing atlas-camera and Canvas 2D fallback rather than touching real-scale flight. Add a small accessible tour control surface, integrate tour state with landing/restore/escape transitions, and use local ring and Saturn textures. Prove the journey, touch behavior and fallback with a focused Playwright browser script before broad existing verification.

**Tech Stack:** HTML, CSS, Ark-free vanilla JavaScript modules, existing Three.js scene, existing Canvas 2D fallback, Node and Playwright.

**Spec:** `docs/superpowers/specs/2026-11-26-saturn-arrival-design.md`

## File ownership

- `scripts/verify-saturn.mjs`: focused failing-first desktop, mobile, reduced-motion, fallback and recovery regression checks.
- `index.html`, `src/data.js`, `src/app.js`: entrypoint copy, accessible transient states, keyboard and archive ownership.
- `src/scene.js`, `src/flat-scene.js`: rendered camera choreography, WebGL-to-Canvas fallback, viewport-fitting and immediate input handoff.
- `styles.css`: existing-brand controls and obstruction-free desktop/mobile framing.
- `bootstrap.js`, `scripts/build-app.mjs`, `scripts/build-site.mjs`, `sw.js`: reliable local-asset and direct Saturn text-section recovery.

## Tasks

### 1. Prove existing deficiencies

- [x] Add a dedicated browser acceptance script that fails on the current implementation.
- [x] Run it and capture the expected missing-control failure before adding production behavior.

### 2. Connect the first screen

- [x] Promote Saturn to the primary entry action and keep atlas entry explicit.
- [x] Translate the new action and labels in both existing interface languages.
- [x] Make Enter activate the focused button natively and retain a non-control Enter shortcut.
- [x] Add a route-preserving escape, skip, and explore-again interaction.
- [x] Run focused landing and keyboard regressions.

### 3. Choreograph and fit the WebGL journey

- [x] Render a procedural Saturn-ring preview synchronously, then prioritize its local real texture and Saturn albedo.
- [x] Fit initial and close cameras from the visible ring geometry and actual viewport aspect ratio.
- [x] Animate approach and edge-on turn, hide distracting labels and overlays, and explicitly notify state changes.
- [x] Make skip and first pointer-down hand off the same camera immediately.
- [x] Restore the exact view on archive dismissal; make escape preserve the final camera position.
- [x] Respect both system and in-app reduced-motion preferences with stable, keyboard-accessible angle controls.
- [x] Run desktop and phone frame/projection and take-over regressions.

### 4. Complete honest fallback routes

- [x] Draw Saturn and its rings in the existing Canvas 2D scene with fitting, phase feedback and view actions.
- [x] Preserve Saturn while replacing a lost WebGL scene.
- [x] Add a stable Saturn anchor to the generated text catalogue and cache the supporting local data needed offline.
- [x] Run no-WebGL, context-loss and blocked-bundle regression checks.

### 5. Validate integration and visuals

- [x] Run the focused Saturn route suite.
- [x] Review desktop and mobile tour, arrival and fallback screenshots together.
- [x] Run syntax/data checks and the existing desktop, mobile, completion and site-build checks.
- [x] Confirm the existing user changes in unrelated files remain intact; this implementation began in the original working tree, so the existing edits in `scripts/build-site.mjs` and the search-related edits in `index.html`, `src/app.js`, `styles.css`, `scripts/verify.mjs`, `scripts/verify-mobile.mjs`, and generated `lite.html` were preserved.
