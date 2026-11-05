import { create } from 'zustand';
import {
  Accusation,
  AccusationResult,
  CaseData,
  CaseEngine,
  InterrogationSession,
  generateCase
} from '@sunset/case-engine';
import { soundManager } from '../audio/soundManager';

export type DeskView =
  | 'desk'
  | 'casefile'
  | 'corkboard'
  | 'interrogation'
  | 'terminal'
  | 'canvass'
  | 'indictment';

export interface BoardPin {
  id: string;
  clueId: string;
  x: number; // percentage or px
  y: number;
  rotation: number;
  note?: string;
}

export interface BoardString {
  id: string;
  fromPinId: string;
  toPinId: string;
  color: string;
}

interface GameState {
  caseData: CaseData;
  engine: CaseEngine;
  activeView: DeskView;
  selectedCharacterId: string | null;
  selectedCaseFileTab: 'incident' | 'autopsy' | 'phone' | 'dossier' | 'forensics';
  lampOn: boolean;
  muted: boolean;

  // Evidence board interactive state
  boardPins: BoardPin[];
  boardStrings: BoardString[];
  connectingPinId: string | null;

  // Active game progress derived from engine
  discoveredEvidenceIds: string[];
  unlockedLocationIds: string[];
  unlockedCharacterIds: string[];
  visitedLocationIds: string[];
  interrogationSessions: Record<string, InterrogationSession>;
  inGameTime: string;
  hoursRemaining: number;

  // Indictment result
  lastAccusationResult: AccusationResult | null;

  // Actions
  setActiveView: (view: DeskView) => void;
  setSelectedCharacter: (characterId: string | null) => void;
  setSelectedCaseFileTab: (tab: 'incident' | 'autopsy' | 'phone' | 'dossier' | 'forensics') => void;
  toggleLamp: () => void;
  toggleAudio: () => void;

  // Case actions
  searchLocation: (locationId: string) => void;
  requestSubpoena: (recordType: 'cctv_park_ave' | 'calderon_cell_ping') => { success: boolean; message: string };
  requestForensicLab: (clueId: string) => { success: boolean; message: string };
  askTopic: (characterId: string, topicId: string) => void;
  confrontSuspect: (
    characterId: string,
    topicId: string,
    evidenceId: string
  ) => { success: boolean; response: string; lawyerCalled: boolean };
  submitAccusation: (accusation: Accusation) => AccusationResult;

  // Board actions
  addPinToBoard: (clueId: string, x?: number, y?: number) => void;
  updatePinPosition: (pinId: string, x: number, y: number) => void;
  removePin: (pinId: string) => void;
  startStringConnection: (pinId: string) => void;
  completeStringConnection: (targetPinId: string) => void;
  cancelStringConnection: () => void;
  removeString: (stringId: string) => void;

  resetGame: () => void;
}

function initInitialPins(): BoardPin[] {
  return [
    {
      id: 'pin_dispatch',
      clueId: 'ev_dispatch',
      x: 18,
      y: 22,
      rotation: -2,
      note: 'Found in Echo Park Lotus Reeds - 06:14 AM'
    },
    {
      id: 'pin_coroner',
      clueId: 'ev_coroner_prelim',
      x: 48,
      y: 20,
      rotation: 1,
      note: 'TOD: 22:15 - 22:45. Cranial trauma.'
    },
    {
      id: 'pin_phone',
      clueId: 'ev_victim_phone',
      x: 78,
      y: 24,
      rotation: 3,
      note: 'Last contact: Calderon & Elena Cruz'
    }
  ];
}

function initInitialStrings(): BoardString[] {
  return [
    {
      id: 'str_1',
      fromPinId: 'pin_dispatch',
      toPinId: 'pin_coroner',
      color: '#dc2626'
    },
    {
      id: 'str_2',
      fromPinId: 'pin_coroner',
      toPinId: 'pin_phone',
      color: '#dc2626'
    }
  ];
}

const initialCaseData = generateCase({ seed: 1984 });
const initialEngine = new CaseEngine(initialCaseData);

export const useGameStore = create<GameState>((set, get) => ({
  caseData: initialCaseData,
  engine: initialEngine,
  activeView: 'desk',
  selectedCharacterId: 'char_suspect_calderon',
  selectedCaseFileTab: 'incident',
  lampOn: true,
  muted: false,

  boardPins: initInitialPins(),
  boardStrings: initInitialStrings(),
  connectingPinId: null,

  discoveredEvidenceIds: [...initialEngine.getState().discoveredEvidenceIds],
  unlockedLocationIds: [...initialEngine.getState().unlockedLocationIds],
  unlockedCharacterIds: [...initialEngine.getState().unlockedCharacterIds],
  visitedLocationIds: [...initialEngine.getState().visitedLocationIds],
  interrogationSessions: { ...initialEngine.getState().interrogationSessions },
  inGameTime: '2026-10-19T07:30:00',
  hoursRemaining: 48,
  lastAccusationResult: null,

  setActiveView: (view: DeskView) => {
    soundManager.playPaperRustle();
    set({ activeView: view });
  },

  setSelectedCharacter: (characterId: string | null) => {
    soundManager.playClick();
    set({ selectedCharacterId: characterId });
  },

  setSelectedCaseFileTab: (tab) => {
    soundManager.playPaperRustle();
    set({ selectedCaseFileTab: tab });
  },

  toggleLamp: () => {
    soundManager.playLampSwitch();
    set((state) => ({ lampOn: !state.lampOn }));
  },

  toggleAudio: () => {
    const isMuted = soundManager.toggleMute();
    set({ muted: isMuted });
  },

  searchLocation: (locationId: string) => {
    const { engine } = get();
    soundManager.playPaperRustle();
    const result = engine.searchLocation(locationId);
    const engineState = engine.getState();

    set((state) => ({
      discoveredEvidenceIds: [...engineState.discoveredEvidenceIds],
      unlockedLocationIds: [...engineState.unlockedLocationIds],
      unlockedCharacterIds: [...engineState.unlockedCharacterIds],
      visitedLocationIds: [...engineState.visitedLocationIds],
      hoursRemaining: Math.max(1, state.hoursRemaining - 2) // Searching takes 2 hours of transit
    }));

    // Auto-pin newly discovered clues if any
    for (const clueId of result.foundEvidence) {
      get().addPinToBoard(clueId);
    }
  },

  requestSubpoena: (recordType) => {
    const { engine } = get();
    soundManager.playClick();
    const result = engine.requestSubpoena(recordType);
    const engineState = engine.getState();

    set((state) => ({
      discoveredEvidenceIds: [...engineState.discoveredEvidenceIds],
      unlockedLocationIds: [...engineState.unlockedLocationIds],
      unlockedCharacterIds: [...engineState.unlockedCharacterIds],
      hoursRemaining: Math.max(1, state.hoursRemaining - 1)
    }));

    if (result.unlockedEvidenceId) {
      get().addPinToBoard(result.unlockedEvidenceId);
    }

    return result;
  },

  requestForensicLab: (clueId) => {
    const { engine } = get();
    soundManager.playClick();
    const result = engine.requestForensicLab(clueId);
    const engineState = engine.getState();

    set((state) => ({
      discoveredEvidenceIds: [...engineState.discoveredEvidenceIds],
      unlockedLocationIds: [...engineState.unlockedLocationIds],
      unlockedCharacterIds: [...engineState.unlockedCharacterIds],
      hoursRemaining: Math.max(1, state.hoursRemaining - 3) // Lab backlog delay
    }));

    if (result.unlockedEvidenceId) {
      get().addPinToBoard(result.unlockedEvidenceId);
    }

    return result;
  },

  askTopic: (characterId, topicId) => {
    const { engine } = get();
    soundManager.playClick();
    const res = engine.askTopic(characterId, topicId);
    const engineState = engine.getState();

    if (res.lawyerCalled) {
      soundManager.playLawyerBuzzer();
    }

    set({
      interrogationSessions: { ...engineState.interrogationSessions },
      discoveredEvidenceIds: [...engineState.discoveredEvidenceIds],
      unlockedLocationIds: [...engineState.unlockedLocationIds]
    });
  },

  confrontSuspect: (characterId, topicId, evidenceId) => {
    const { engine } = get();
    const res = engine.confrontWithEvidence(characterId, topicId, evidenceId);
    const engineState = engine.getState();

    if (res.success) {
      soundManager.playBreakLie();
      for (const clueId of res.unlockedClues) {
        get().addPinToBoard(clueId);
      }
    } else {
      if (res.lawyerCalled) {
        soundManager.playLawyerBuzzer();
      } else {
        soundManager.playClick();
      }
    }

    set({
      interrogationSessions: { ...engineState.interrogationSessions },
      discoveredEvidenceIds: [...engineState.discoveredEvidenceIds],
      unlockedLocationIds: [...engineState.unlockedLocationIds]
    });

    return res;
  },

  submitAccusation: (accusation) => {
    const { engine } = get();
    soundManager.playPaperRustle();
    const result = engine.submitAccusation(accusation);
    if (result.success) {
      soundManager.playBreakLie();
    } else {
      soundManager.playLawyerBuzzer();
    }
    set({ lastAccusationResult: result });
    return result;
  },

  addPinToBoard: (clueId, x, y) => {
    const { boardPins } = get();
    if (boardPins.some((p) => p.clueId === clueId)) return;

    soundManager.playPinThud();
    const defaultX = x ?? 20 + ((boardPins.length * 15) % 65);
    const defaultY = y ?? 35 + ((boardPins.length * 12) % 45);
    const rotation = (Math.random() - 0.5) * 6;

    const newPin: BoardPin = {
      id: `pin_${clueId}_${Date.now()}`,
      clueId,
      x: defaultX,
      y: defaultY,
      rotation
    };

    set({ boardPins: [...boardPins, newPin] });
  },

  updatePinPosition: (pinId, x, y) => {
    set((state) => ({
      boardPins: state.boardPins.map((p) => (p.id === pinId ? { ...p, x, y } : p))
    }));
  },

  removePin: (pinId) => {
    soundManager.playClick();
    set((state) => ({
      boardPins: state.boardPins.filter((p) => p.id !== pinId),
      boardStrings: state.boardStrings.filter(
        (s) => s.fromPinId !== pinId && s.toPinId !== pinId
      ),
      connectingPinId: state.connectingPinId === pinId ? null : state.connectingPinId
    }));
  },

  startStringConnection: (pinId) => {
    soundManager.playClick();
    set({ connectingPinId: pinId });
  },

  completeStringConnection: (targetPinId) => {
    const { connectingPinId, boardStrings } = get();
    if (!connectingPinId || connectingPinId === targetPinId) {
      set({ connectingPinId: null });
      return;
    }

    soundManager.playPinThud();
    const exists = boardStrings.some(
      (s) =>
        (s.fromPinId === connectingPinId && s.toPinId === targetPinId) ||
        (s.fromPinId === targetPinId && s.toPinId === connectingPinId)
    );

    if (!exists) {
      const newString: BoardString = {
        id: `str_${Date.now()}`,
        fromPinId: connectingPinId,
        toPinId: targetPinId,
        color: '#dc2626' // Classic red evidence string
      };
      set({
        boardStrings: [...boardStrings, newString],
        connectingPinId: null
      });
    } else {
      set({ connectingPinId: null });
    }
  },

  cancelStringConnection: () => {
    set({ connectingPinId: null });
  },

  removeString: (stringId) => {
    soundManager.playClick();
    set((state) => ({
      boardStrings: state.boardStrings.filter((s) => s.id !== stringId)
    }));
  },

  resetGame: () => {
    const newCase = generateCase({ seed: 1984 });
    const newEngine = new CaseEngine(newCase);
    set({
      caseData: newCase,
      engine: newEngine,
      activeView: 'desk',
      selectedCharacterId: 'char_suspect_calderon',
      boardPins: initInitialPins(),
      boardStrings: initInitialStrings(),
      connectingPinId: null,
      discoveredEvidenceIds: [...newEngine.getState().discoveredEvidenceIds],
      unlockedLocationIds: [...newEngine.getState().unlockedLocationIds],
      unlockedCharacterIds: [...newEngine.getState().unlockedCharacterIds],
      visitedLocationIds: [],
      interrogationSessions: {},
      hoursRemaining: 48,
      lastAccusationResult: null
    });
  }
}));
