# Project Status: Sunset & Silence

**Current Phase:** Phase 2: Core UI & Detective Desk (Completed)  
**Last Updated:** Phase 2 Milestone Completed  
**Branch:** `master`

---

## Completed
- **Phase 1: Deterministic Case Engine & Solvability (Completed)**:
  - Scaffolding of monorepo (`packages/case-engine`, `apps/web`, `docs/`).
  - World model, evidence derivation chains, suspect secrets & PRNG determinism.
  - Solvability Validator with 3-pillar proof & 11/11 Vitest tests.
  - Interactive Terminal CLI (`npm run cli`).
  - Case 01 exported to `cases/case_01_echo_park.json`.

- **Phase 2: Core UI & Detective Desk (Completed)**:
  - **Tactile Desk Shell (`DeskShell.tsx`)**:
    - Central immersive workstation view with green banker's lamp (interactive warm cone toggle), wood grain desktop, manila case folder, wall corkboard, MDT terminal, interrogation suite portal, and police radio dispatch.
    - Persistent 48-hour arraignment clock tracking in-game time consumption.
  - **Tactile Evidence Board (`EvidenceBoard.tsx`)**:
    - Framed corkboard canvas with pushpins, index cards, rotation jitter, category badges, and conviction pillar tags (Motive, Opportunity, Means).
    - SVG interactive red yarn string connections linking clues with realistic gravity sag.
    - Clue tray for unpinned discovered evidence with one-click pinning.
  - **Case File Dossier & Autopsy (`CaseFileViewer.tsx`)**:
    - Manila folder with tabbed sections (CAD Dispatch, Medical Examiner Autopsy, Phone & Surveillance Logs, Escrow Audit, Ballistics & AFIS).
    - Authentic typewriter typography, classified stamps, and chain-of-custody markers.
  - **Menu-based Interrogation Suite (`InterrogationRoom.tsx`)**:
    - Two-way mirror suspect observation with Raymond Calderon, Elena Cruz, and Tyler Vance.
    - Analog dynamic **Pressure Gauge** (0–100%) and **Trust Gauge** (0–100%).
    - Suspect testimony tree with contradictory evidence presentation interface.
    - 5th Amendment lawyer lockout mechanics triggered when badgered without evidence.
  - **Retro CRT CAD Terminal (`TerminalView.tsx`)**:
    - Phosphor scanline terminal for DOT traffic camera subpoenas, emergency CSLI cell tower warrants, and Crime Lab AFIS fingerprint runs.
  - **LA Scene Canvassing (`LocationCanvass.tsx`)**:
    - Realistic LA neighborhoods (Echo Park boathouse, Downtown Arts District accounting loft, Silver Lake escrow office, Filipinotown lounge, Los Feliz apartment).
    - Fast travel time cost affecting the 48-hour arraignment deadline.
  - **DA Arraignment & Accusation Modal (`IndictmentModal.tsx`)**:
    - Formal indictment submission interface verifying Motive, Opportunity, and Means.
    - Official DA determinations (First-degree murder conviction vs Case dismissed vs Catastrophic wrongful arrest disaster).
  - **Tactile Audio Engine (`soundManager.ts`)**:
    - Procedural zero-dependency Web Audio synthesizers for typewriter strikes, pushpin thuds, paper rustles, buzzer alarms, and dramatic lie-shattering impacts.

---

## In Progress / Next Up
- **Phase 3 (Weeks 7–9): LA Map & Stylized CCTV Systems**:
  - MapLibre GL dark-noir vector map integration for Los Angeles County.
  - Stylized CCTV security playback viewer (lens distortion, timestamp scanlines, night glitches).
  - Judicial warrant requirement checks linked to probable cause.
