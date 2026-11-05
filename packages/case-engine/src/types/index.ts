/**
 * Core type definitions for Sunset & Silence: Case Engine
 * All ground truth facts, evidence derivations, and interrogation states.
 */

export type CharacterRole = 'victim' | 'culprit' | 'suspect' | 'witness' | 'detective';

export type PersonalityTrait =
  | 'nervous'
  | 'arrogant'
  | 'defensive'
  | 'compliant'
  | 'calculating'
  | 'grieving'
  | 'hostile';

export interface CharacterSecret {
  id: string;
  title: string;
  category: 'embezzlement' | 'blackmail' | 'infidelity' | 'narcotics' | 'theft' | 'murder';
  description: string;
  isMurder: boolean;
}

export interface Character {
  id: string;
  name: string;
  age: number;
  occupation: string;
  residenceLocationId: string;
  workplaceLocationId?: string;
  bio: string;
  role: CharacterRole;
  traits: PersonalityTrait[];
  trust: number; // 0 - 100
  pressure: number; // 0 - 100
  lawyerThreshold: number; // Pressure level at which suspect demands an attorney
  breakdownThreshold: number; // Required pressure to crack when presented with key evidence
  secret: CharacterSecret;
  claimedAlibi: {
    locationId: string;
    description: string;
    timeWindow: { start: string; end: string };
    corroboratingCharacterId?: string;
    isFalse: boolean;
  };
}

export type LocationType =
  | 'crime_scene'
  | 'residence'
  | 'workplace'
  | 'commercial'
  | 'public_area';

export interface Location {
  id: string;
  name: string;
  neighborhood: string; // Real Los Angeles neighborhood (e.g. Echo Park, Silver Lake)
  fictionalAddress: string; // Realistic but fictional street address
  coordinates: {
    lat: number;
    lng: number;
  };
  type: LocationType;
  description: string;
  initialUnlocked: boolean;
  searchClueIds: string[]; // Clues found by canvassing/searching this scene
  residentCharacterIds: string[];
}

export type FactType =
  | 'presence'
  | 'motive'
  | 'weapon'
  | 'secret'
  | 'alibi_refutation'
  | 'timeline'
  | 'cause_of_death';

export interface GroundTruthFact {
  id: string;
  type: FactType;
  description: string;
  primarySubjectId: string; // Character ID
  secondarySubjectId?: string;
  locationId?: string;
  timestamp?: string;
  significance: 'critical_pillar' | 'supporting' | 'red_herring';
}

export interface TimelineEvent {
  id: string;
  timestamp: string; // ISO 8601 string or in-game format (e.g. "2026-10-18T21:45:00")
  characterId: string;
  locationId: string;
  action: string;
  factId: string; // Linked GroundTruthFact
  isCrimeEvent?: boolean;
}

export interface GroundTruth {
  victimId: string;
  culpritId: string;
  murderWeapon: string;
  causeOfDeath: string;
  estimatedTimeOfDeath: string;
  timeOfDeathWindow: {
    start: string;
    end: string;
  };
  crimeSceneId: string;
  motiveCategory: 'financial_ruin' | 'revenge_betrayal' | 'coverup_blackmail' | 'crime_of_passion';
  motiveDetails: string;
  facts: Record<string, GroundTruthFact>;
  timeline: TimelineEvent[];
}

export type EvidenceCategory =
  | 'coroner'
  | 'cctv'
  | 'phone_record'
  | 'bank_record'
  | 'forensic_physical'
  | 'witness_statement'
  | 'document'
  | 'canvass';

export interface EvidenceItem {
  id: string;
  title: string;
  category: EvidenceCategory;
  description: string;
  locationFoundId?: string;
  timestamp?: string;
  discoveredByDefault?: boolean;
  derivedFromFactIds: string[]; // Every evidence item must trace to 1+ GroundTruthFact(s)
  
  // Pillars of conviction
  provesMotiveFor?: string; // Character ID
  provesOpportunityFor?: string; // Character ID (breaks alibi/places at scene at TOD)
  provesMeansFor?: string; // Character ID (links weapon/forensics to suspect)
  disprovesAlibiFor?: string; // Character ID

  // Interrogation linkages
  contradictsStatementIds?: string[];

  // Exploration graph
  unlocksLocationIds?: string[];
  unlocksCharacterIds?: string[];
  requiresWarrant?: boolean;
  isRedHerring?: boolean;
}

export interface InterrogationTopic {
  id: string;
  characterId: string;
  prompt: string; // What the detective asks
  initialResponse: string; // Suspect's response
  isLie: boolean;
  underlyingFactId?: string; // The ground truth fact this lie distorts
  refutedByEvidenceId?: string; // The exact evidence ID that catches them lying
  brokenConfessionResponse?: string; // What the suspect confesses when confronted
  wrongEvidenceRetort: string; // What the suspect snaps when detective presents irrelevant proof
  pressureDeltaOnAsk: number;
  trustDeltaOnAsk: number;
  pressureGainOnBreak: number;
  trustDropOnBreak: number;
  unlocksClueIds?: string[]; // Clues or documents yielded upon breaking
  unlocksTopicIds?: string[]; // Follow-up topics unlocked
}

export interface InterrogationSession {
  characterId: string;
  trust: number;
  pressure: number;
  isLawyerInvoked: boolean;
  unlockedTopicIds: string[];
  askedTopicIds: string[];
  brokenTopicIds: string[];
  transcript: {
    speaker: string;
    text: string;
    timestamp: string;
    action?: 'ASK' | 'CONFRONT_SUCCESS' | 'CONFRONT_FAIL' | 'LAWYER_WALKOUT';
  }[];
}

export interface CaseData {
  caseId: string;
  caseNumber: string;
  title: string;
  briefDescription: string;
  dispatchReport: {
    incidentTime: string;
    operatorNotes: string;
    reportingParty: string;
    initialUnitDispatched: string;
  };
  groundTruth: GroundTruth;
  characters: Record<string, Character>;
  locations: Record<string, Location>;
  evidence: Record<string, EvidenceItem>;
  interrogationTopics: Record<string, InterrogationTopic>;
  startingEvidenceIds: string[];
  startingLocationIds: string[];
  startingCharacterIds: string[];
  seed: number | string;
}

export interface Accusation {
  accusedCharacterId: string;
  motiveEvidenceId: string;
  opportunityEvidenceId: string;
  meansEvidenceId: string;
}

export interface AccusationResult {
  success: boolean;
  verdict: 'CONVICTION' | 'CASE_DISMISSED_INSUFFICIENT_EVIDENCE' | 'WRONGFUL_ARREST_DISASTER';
  headline: string;
  detailedAnalysis: string;
  flaws: string[];
  satisfiedPillars: {
    motive: boolean;
    opportunity: boolean;
    means: boolean;
    identityCorrect: boolean;
  };
}

export interface SolvabilityTraceStep {
  stepNumber: number;
  action: string;
  details: string;
  newEvidenceDiscovered: string[];
  newLocationsDiscovered: string[];
  liesBroken: string[];
}

export interface ValidationReport {
  seed: number | string;
  solvable: boolean;
  culpritId: string;
  culpritName: string;
  reachableEvidenceIds: string[];
  unlockedLocationIds: string[];
  brokenLieIds: string[];
  pillarsEstablished: {
    motive: boolean;
    opportunity: boolean;
    means: boolean;
  };
  criticalPath: string[];
  stepsTrace: SolvabilityTraceStep[];
  errors: string[];
}

