# Project Plan: Sunset & Silence (LA Detective Game)

## Vision
An uncompromising, atmospheric detective game set in modern Los Angeles. The player assumes the role of a seasoned detective in the Metro Homicide Division. The game refuses to hold the player's hand: there are no glowing quest markers, no automatic deduction popups, and no artificial gating. The player reviews 911 dispatch calls, conducts forensic crime-scene walkthroughs, reviews coroner reports, pulls security footage and phone records, subpoenas bank histories, questions witnesses and suspects, pins evidence onto a tactile corkboard, and submits formal charges to the District Attorney.

---

## 12-Week Roadmap to Commercial Vertical Slice

### Phase 1: Weeks 1–3 — Deterministic Case Engine & Solvability
- [x] Monorepo scaffold (`packages/case-engine`, `apps/web`, `docs/`) with TypeScript, Vitest, and lint configs.
- [x] World model (`Character`, `Location`, `Relationship`, `TimelineEvent`, `GroundTruth`).
- [x] Evidence model (`EvidenceItem`, `DerivationRule`, `FactLink`, `ContradictionMap`).
- [x] Seeded deterministic generator (Mulberry32 PRNG) generating a complete LA murder case.
- [x] Solvability validator simulating an optimal detective to prove case solvability.
- [x] Terminal CLI harness for rapid testing of case gameplay (interrogation, clue browsing, accusation).

### Phase 2: Weeks 4–6 — Core UI & Detective Desk
- [x] Vite + React + Tailwind + Framer Motion setup in `apps/web`.
- [x] The "Detective Desk" metaphor: single immersive workstation view (desktop lamp, physical case binder, landline/radio, evidence corkboard, CAD/records terminal).
- [x] Tactile Evidence Board: Canvas/Pixi/SVG drag-and-drop pins, string connections, photo grain, index cards.
- [x] Case File & Forensic Viewer: autopsy reports, crime scene photos, fingerprint comparisons.
- [x] Menu-based Interrogation Suite: suspect portrait, trust/pressure gauges, testimony tree, evidence presentation interface, Miranda rights warning, lawyer walkout risk.

### Phase 3: Weeks 7–9 — LA Map & Stylized CCTV Systems
- [ ] MapLibre GL integration with custom dark-noir monochrome/neon vector tiles for Los Angeles County.
- [ ] Fast travel simulation with realistic LA traffic time penalties affecting the 48-hour arraignment clock.
- [ ] Stylized CCTV viewer: timestamped security video playback simulation with scanlines, compression artifacts, lens distortion, bad angles, and lighting drops.
- [ ] Subpoena & Warrant mechanics: judicial warrant requests requiring documented probable cause before phone/bank record reveals.

### Phase 4: Weeks 10–12 — Vertical Slice & Polish
- [ ] Authoring "Case 01: Sunset & Silence" (Echo Park / Silver Lake homicide).
- [ ] Howler.js audio design: atmospheric city rain, distant sirens, LAPD radio chatter, ambient jazz/noir score, tactile UI sound effects (paper rustle, slide projector clicks).
- [ ] Save/Load persistence via Zustand + IndexedDB.
- [ ] Arraignment / DA submission sequence with detailed judicial evaluation of charges.

### Phase 5: Post-Slice — Steam & Content Expansion
- [ ] Tauri desktop packaging for Steam release with cloud saves and achievements.
- [ ] Case Packs 1–3 and procedural case generator expansion.
