import {
  Accusation,
  AccusationResult,
  CaseData,
  InterrogationSession,
  InterrogationTopic
} from '../types/index.js';
import { SolvabilityValidator } from '../validator/solvabilityValidator.js';

export interface PlayerGameState {
  caseId: string;
  inGameTime: string; // Clock tracking
  discoveredEvidenceIds: string[];
  unlockedLocationIds: string[];
  unlockedCharacterIds: string[];
  visitedLocationIds: string[];
  interrogationSessions: Record<string, InterrogationSession>;
  labRequests: { id: string; status: 'pending' | 'completed'; revealsEvidenceId: string }[];
  warrantsIssued: string[];
  solved: boolean;
}

export class CaseEngine {
  private caseData: CaseData;
  private state: PlayerGameState;

  constructor(caseData: CaseData) {
    this.caseData = caseData;
    this.state = this.initGameState();
  }

  private initGameState(): PlayerGameState {
    return {
      caseId: this.caseData.caseId,
      inGameTime: '2026-10-19T07:30:00',
      discoveredEvidenceIds: [...this.caseData.startingEvidenceIds],
      unlockedLocationIds: [...this.caseData.startingLocationIds],
      unlockedCharacterIds: [...this.caseData.startingCharacterIds],
      visitedLocationIds: [],
      interrogationSessions: {},
      labRequests: [],
      warrantsIssued: [],
      solved: false
    };
  }

  public getCaseData(): CaseData {
    return this.caseData;
  }

  public getState(): PlayerGameState {
    return this.state;
  }

  /**
   * Search / Canvass a location for physical clues or witnesses.
   */
  public searchLocation(locationId: string): {
    locationName: string;
    description: string;
    foundEvidence: string[];
    foundCharacters: string[];
  } {
    const loc = this.caseData.locations[locationId];
    if (!loc) throw new Error(`Unknown location ${locationId}`);

    if (!this.state.visitedLocationIds.includes(locationId)) {
      this.state.visitedLocationIds.push(locationId);
    }

    const foundEvidence: string[] = [];
    for (const clueId of loc.searchClueIds) {
      if (!this.state.discoveredEvidenceIds.includes(clueId)) {
        this.state.discoveredEvidenceIds.push(clueId);
        foundEvidence.push(clueId);
        this.processEvidenceUnlocks(clueId);
      }
    }

    const foundCharacters: string[] = [];
    for (const charId of loc.residentCharacterIds) {
      if (!this.state.unlockedCharacterIds.includes(charId)) {
        this.state.unlockedCharacterIds.push(charId);
        foundCharacters.push(charId);
      }
    }

    return {
      locationName: loc.name,
      description: loc.description,
      foundEvidence,
      foundCharacters
    };
  }

  /**
   * Submits evidence to crime lab for forensic / AFIS ballistics examination.
   */
  public requestForensicLab(clueId: string): { success: boolean; message: string; unlockedEvidenceId?: string } {
    if (!this.state.discoveredEvidenceIds.includes(clueId)) {
      return { success: false, message: 'You have not collected this evidence item.' };
    }

    if (clueId === 'ev_culvert_weapon') {
      const resultClueId = 'ev_forensic_ballistics_dna';
      if (!this.state.discoveredEvidenceIds.includes(resultClueId)) {
        this.state.discoveredEvidenceIds.push(resultClueId);
        this.processEvidenceUnlocks(resultClueId);
        return {
          success: true,
          message: 'Forensic Lab expedited AFIS fingerprint lift & trace chemical analysis.',
          unlockedEvidenceId: resultClueId
        };
      }
      return { success: true, message: 'Forensic analysis already completed for this item.' };
    }

    return { success: false, message: 'Crime Lab: No actionable biological or trace evidence found on this item.' };
  }

  /**
   * Requests judicial warrant or subpoena for phone/CCTV records.
   */
  public requestSubpoena(recordType: 'cctv_park_ave' | 'calderon_cell_ping'): {
    success: boolean;
    message: string;
    unlockedEvidenceId?: string;
  } {
    if (recordType === 'cctv_park_ave') {
      // Need witness statement or suspect vehicle lead
      if (
        this.state.discoveredEvidenceIds.includes('ev_witness_hector_statement') ||
        this.state.discoveredEvidenceIds.includes('ev_mud_footprints') ||
        this.state.discoveredEvidenceIds.includes('ev_victim_phone')
      ) {
        const clueId = 'ev_cctv_calderon_car';
        if (!this.state.discoveredEvidenceIds.includes(clueId)) {
          this.state.discoveredEvidenceIds.push(clueId);
          this.processEvidenceUnlocks(clueId);
        }
        return {
          success: true,
          message: 'Department of Transportation Traffic Camera footage secured for Glendale & Park Ave.',
          unlockedEvidenceId: clueId
        };
      }
      return {
        success: false,
        message: 'City Attorney: Subpoena denied. You must establish probable cause linking the area or vehicle first.'
      };
    }

    if (recordType === 'calderon_cell_ping') {
      if (this.state.discoveredEvidenceIds.includes('ev_cctv_calderon_car')) {
        const clueId = 'ev_cell_ping_calderon';
        if (!this.state.discoveredEvidenceIds.includes(clueId)) {
          this.state.discoveredEvidenceIds.push(clueId);
          this.processEvidenceUnlocks(clueId);
        }
        return {
          success: true,
          message: 'Magistrate granted Emergency Cell Site Location Information (CSLI) warrant for Raymond Calderon.',
          unlockedEvidenceId: clueId
        };
      }
      return {
        success: false,
        message: 'Magistrate denied search warrant: Insufficient probable cause to breach 4th Amendment protections.'
      };
    }

    return { success: false, message: 'Unknown subpoena target.' };
  }

  private processEvidenceUnlocks(clueId: string): void {
    const clue = this.caseData.evidence[clueId];
    if (!clue) return;

    if (clue.unlocksLocationIds) {
      for (const locId of clue.unlocksLocationIds) {
        if (!this.state.unlockedLocationIds.includes(locId)) {
          this.state.unlockedLocationIds.push(locId);
        }
      }
    }

    if (clue.unlocksCharacterIds) {
      for (const charId of clue.unlocksCharacterIds) {
        if (!this.state.unlockedCharacterIds.includes(charId)) {
          this.state.unlockedCharacterIds.push(charId);
        }
      }
    }
  }

  /**
   * Initializes or fetches an active interrogation session for a suspect.
   */
  public getOrCreateInterrogationSession(characterId: string): InterrogationSession {
    if (!this.state.interrogationSessions[characterId]) {
      const char = this.caseData.characters[characterId];
      if (!char) throw new Error(`Unknown character ${characterId}`);

      // Initial topics belonging to this character
      const charTopics = Object.values(this.caseData.interrogationTopics)
        .filter((t) => t.characterId === characterId)
        .map((t) => t.id);

      this.state.interrogationSessions[characterId] = {
        characterId,
        trust: char.trust,
        pressure: char.pressure,
        isLawyerInvoked: false,
        unlockedTopicIds: charTopics,
        askedTopicIds: [],
        brokenTopicIds: [],
        transcript: []
      };
    }

    return this.state.interrogationSessions[characterId];
  }

  /**
   * Ask an interrogation topic.
   */
  public askTopic(
    characterId: string,
    topicId: string
  ): {
    statement: string;
    isLie: boolean;
    trustDelta: number;
    pressureDelta: number;
    lawyerCalled: boolean;
  } {
    const session = this.getOrCreateInterrogationSession(characterId);
    const char = this.caseData.characters[characterId];
    const topic = this.caseData.interrogationTopics[topicId];

    if (session.isLawyerInvoked) {
      return {
        statement: 'Suspect has invoked their 5th Amendment right to counsel. Questioning is terminated.',
        isLie: false,
        trustDelta: 0,
        pressureDelta: 0,
        lawyerCalled: true
      };
    }

    if (!session.askedTopicIds.includes(topicId)) {
      session.askedTopicIds.push(topicId);
    }

    session.trust = Math.max(0, Math.min(100, session.trust + topic.trustDeltaOnAsk));
    session.pressure = Math.max(0, Math.min(100, session.pressure + topic.pressureDeltaOnAsk));

    // Check lawyer threshold
    if (session.pressure >= char.lawyerThreshold) {
      session.isLawyerInvoked = true;
      session.transcript.push({
        speaker: char.name,
        text: 'That is it! I want my attorney. Do not speak another word to me without my lawyer present!',
        timestamp: this.state.inGameTime,
        action: 'LAWYER_WALKOUT'
      });
      return {
        statement: 'Suspect has invoked their right to an attorney.',
        isLie: false,
        trustDelta: topic.trustDeltaOnAsk,
        pressureDelta: topic.pressureDeltaOnAsk,
        lawyerCalled: true
      };
    }

    session.transcript.push({
      speaker: 'Detective',
      text: topic.prompt,
      timestamp: this.state.inGameTime,
      action: 'ASK'
    });

    session.transcript.push({
      speaker: char.name,
      text: topic.initialResponse,
      timestamp: this.state.inGameTime
    });

    // If asking witness gave clues
    if (topic.unlocksClueIds) {
      for (const clueId of topic.unlocksClueIds) {
        if (!this.state.discoveredEvidenceIds.includes(clueId)) {
          this.state.discoveredEvidenceIds.push(clueId);
          this.processEvidenceUnlocks(clueId);
        }
      }
    }

    return {
      statement: topic.initialResponse,
      isLie: topic.isLie,
      trustDelta: topic.trustDeltaOnAsk,
      pressureDelta: topic.pressureDeltaOnAsk,
      lawyerCalled: false
    };
  }

  /**
   * Present evidence to confront a suspect on an asked topic and break their lie.
   */
  public confrontWithEvidence(
    characterId: string,
    topicId: string,
    evidenceId: string
  ): {
    success: boolean;
    response: string;
    unlockedClues: string[];
    lawyerCalled: boolean;
  } {
    const session = this.getOrCreateInterrogationSession(characterId);
    const char = this.caseData.characters[characterId];
    const topic = this.caseData.interrogationTopics[topicId];

    if (session.isLawyerInvoked) {
      return {
        success: false,
        response: 'Suspect is refusing to answer without counsel.',
        unlockedClues: [],
        lawyerCalled: true
      };
    }

    if (!this.state.discoveredEvidenceIds.includes(evidenceId)) {
      return {
        success: false,
        response: 'You cannot present evidence you have not discovered.',
        unlockedClues: [],
        lawyerCalled: false
      };
    }

    // Is this the correct refuting evidence?
    if (topic.isLie && topic.refutedByEvidenceId === evidenceId) {
      session.brokenTopicIds.push(topicId);
      session.pressure = Math.max(0, Math.min(100, session.pressure + topic.pressureGainOnBreak));
      session.trust = Math.max(0, Math.min(100, session.trust + topic.trustDropOnBreak));

      const confession = topic.brokenConfessionResponse || 'Suspect broke down in tears and yielded.';
      session.transcript.push({
        speaker: 'Detective',
        text: `[Presents ${this.caseData.evidence[evidenceId].title}]`,
        timestamp: this.state.inGameTime,
        action: 'CONFRONT_SUCCESS'
      });
      session.transcript.push({
        speaker: char.name,
        text: confession,
        timestamp: this.state.inGameTime
      });

      const unlockedClues: string[] = [];
      if (topic.unlocksClueIds) {
        for (const cId of topic.unlocksClueIds) {
          if (!this.state.discoveredEvidenceIds.includes(cId)) {
            this.state.discoveredEvidenceIds.push(cId);
            this.processEvidenceUnlocks(cId);
            unlockedClues.push(cId);
          }
        }
      }

      if (topic.unlocksTopicIds) {
        for (const tId of topic.unlocksTopicIds) {
          if (!session.unlockedTopicIds.includes(tId)) {
            session.unlockedTopicIds.push(tId);
          }
        }
      }

      return {
        success: true,
        response: confession,
        unlockedClues,
        lawyerCalled: false
      };
    } else {
      // Wrong evidence presented! Severe penalty: spikes pressure and lowers trust!
      const penaltyPressure = 18;
      const penaltyTrust = -15;
      session.pressure = Math.max(0, Math.min(100, session.pressure + penaltyPressure));
      session.trust = Math.max(0, Math.min(100, session.trust + penaltyTrust));

      session.transcript.push({
        speaker: 'Detective',
        text: `[Presents irrelevant evidence: ${this.caseData.evidence[evidenceId].title}]`,
        timestamp: this.state.inGameTime,
        action: 'CONFRONT_FAIL'
      });
      session.transcript.push({
        speaker: char.name,
        text: topic.wrongEvidenceRetort,
        timestamp: this.state.inGameTime
      });

      // Check if pressure now triggers lawyer
      let lawyerCalled = false;
      if (session.pressure >= char.lawyerThreshold) {
        session.isLawyerInvoked = true;
        lawyerCalled = true;
        session.transcript.push({
          speaker: char.name,
          text: 'You are harassing me with fabricated nonsense! I am invoking my right to counsel. Interrogation is over!',
          timestamp: this.state.inGameTime,
          action: 'LAWYER_WALKOUT'
        });
      }

      return {
        success: false,
        response: topic.wrongEvidenceRetort,
        unlockedClues: [],
        lawyerCalled
      };
    }
  }

  /**
   * Submit formal charges to the District Attorney.
   */
  public submitAccusation(accusation: Accusation): AccusationResult {
    const result = SolvabilityValidator.evaluateAccusation(this.caseData, accusation);
    if (result.success) {
      this.state.solved = true;
    }
    return result;
  }
}
