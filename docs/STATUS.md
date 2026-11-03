# Project Status: Sunset & Silence

**Current Phase:** Phase 1: Case Engine Prototype & Solvability Verification (Completed)  
**Last Updated:** Phase 1 Milestone Completed  
**Branch:** `master`

---

## Completed
- **Project Governance & Documentation**:
  - Created `CLAUDE.md` documenting locked decisions, architectural constraints, and development rules.
  - Created `docs/PLAN.md` with complete 12-week roadmap to vertical slice.
  - Initialized git repository and configured `.gitignore` & `.prettierrc`.
- **Monorepo Setup**:
  - Established npm workspaces: `packages/case-engine` and `apps/web`.
  - Configured root and package TypeScript configurations (`tsconfig.base.json`, `tsconfig.json`).
  - Set up Vitest test runner across monorepo.
  - Scaffolded `apps/web` with Vite, React, Tailwind CSS, Framer Motion, Howler, and MapLibre GL dependencies.
- **Case Engine Core (`packages/case-engine`)**:
  - `prng`: Deterministic Mulberry32 seeded pseudo-random number generator.
  - `types`: World model (`Character`, `Location`, `TimelineEvent`, `GroundTruthFact`, `GroundTruth`), Evidence model (`EvidenceItem`, `DerivationRule`, `FactLink`), and Interrogation model (`InterrogationTopic`, `InterrogationSession`, `Accusation`).
  - `generator`: Deterministic case generator constructing ground truth timeline first, then deriving clues with non-murder suspect secrets and red herrings.
  - `validator`: Algorithmic Solvability Validator that simulates an optimal detective agent, proves 100% case solvability, establishes the three legal conviction pillars (Motive, Opportunity, Means), and confirms no innocent suspect can be falsely convicted.
  - `engine`: Active gameplay state manager handling canvassing, forensic lab ballistics/AFIS requests, judicial subpoenas (CSLI pings, CCTV footage), interrogation sessions with trust/pressure meters, lie breaking via contradictory proof, and lawyer lockout rules.
  - `cli`: Interactive terminal detective desk (`npm run cli`) supporting dispatch reading, evidence inspection, location canvassing, crime lab requests, suspect interrogation, automated solvability verification, and DA indictment submission.
  - Exported seeded Case 01 to `cases/case_01_echo_park.json`.
- **Test Suite**:
  - 11/11 Vitest tests passing covering PRNG determinism, fact derivation integrity, suspect secret distribution, solvability proof, legal pillar validation, wrongful arrest detection, and interrogation lie-breaking & lawyer walkout thresholds.

---

## In Progress / Next Up
- **Phase 2 (Weeks 4–6): Core UI & Detective Desk (`apps/web`)**:
  - Implement tactile "Detective Desk" UI shell (vintage desk lamp, file folders, landline, CAD terminal).
  - Implement canvas/SVG Evidence Board with drag-and-drop pins, index cards, polaroids, and red string connections.
  - Implement suspect interrogation screen with portrait displays, tension/trust meters, topic selection, and evidence presentation dialog.
  - Wire `@sunset/case-engine` directly into Zustand store with IndexedDB local persistence.
