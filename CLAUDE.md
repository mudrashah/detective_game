# Project Conventions & Locked Decisions: Sunset & Silence (LA Detective Game)

## 1. Locked Decisions
- **Platform**: Web first (React + Vite + Tailwind + Framer Motion), desktop release via Tauri (Steam) later.
- **Setting**: Los Angeles, USA. Realistic geography (authentic neighborhoods, freeways, landmarks, street grids), but **strictly fictional** people, businesses, phone numbers, and street addresses.
- **Law Enforcement Branding**: Do not use real LAPD or LASD logos, badges, or real officers. Use fictional division: **Metro Homicide Division (MHD)** / **Los Angeles County Bureau of Investigation (LACBI)**.
- **Interrogation System**: **Menu-based strictly**. No runtime LLM calls during gameplay. Suspect statements are discrete dialogue nodes linked directly to ground truth facts. Contradictory evidence breaks lies; improper pressure triggers the 5th Amendment/lawyer lockouts.
- **Case Generation (Hybrid Pipeline)**:
  1. *Deterministic Engine*: Generates ground truth (victim, culprit, motive, weapon, minute-by-minute timeline, character coordinates).
  2. *Derived Evidence*: Clues derived directly from timeline facts (CCTV snapshots, cell tower pings, bank records, coroner timeline, physical forensics). Includes red herrings and non-murder secrets.
  3. *Solvability Validator*: Algorithmic solver simulates an ideal investigator; case only ships if culprit is definitively provable without guesswork.
  4. *Offline Prose Generation*: Narrative and dialogue generated offline at build time, reviewed and curated by human author. Facts remain locked in code.
- **Commercial Bar**: High atmospheric tension, tactile desk UI, realistic investigative proceduralism, zero hand-holding.

## 2. Monorepo Architecture
- **Repository**: `https://github.com/mudrashah/detective_game.git`
- `packages/case-engine`: Standalone, pure TypeScript package containing:
  - World model (characters, locations, relationships, ground truth timeline).
  - Evidence model (clues, derivation chains, secrets, red herrings).
  - Deterministic case generator (seeded PRNG).
  - Solvability validator & test harness.
  - Interactive CLI test harness.
- `apps/web`: React + Vite single-page application:
  - Detective desk UI (case files, physical evidence board with pins/string, map, interrogation suite, CCTV viewer, police terminal).
  - Audio management via Howler.
  - MapLibre GL custom dark noir map rendering.
  - Local persistence via Zustand + IndexedDB.
- `docs/`: Design documentation, roadmap, and living status trackers.

## 3. Engineering Guidelines
- **Language**: TypeScript strict mode across all packages.
- **Testing**: Vitest for unit, integration, and solvability validation tests.
- **Secrets & Credentials**: Strictly forbidden in repo. Use `.env` (gitignored).
- **Git & Workflow**:
  - Small, atomic commits with clear messages.
  - Never run `git push`, publish packages, or incur monetary costs without explicit user confirmation.
  - Keep `docs/STATUS.md` updated at the conclusion of every work session.
  - Provide direct recommendations rather than non-committal lists of options.

