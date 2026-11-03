import { describe, expect, it } from 'vitest';
import { PRNG } from '../src/prng/index.js';
import { generateCase } from '../src/generator/caseGenerator.js';
import { SolvabilityValidator } from '../src/validator/solvabilityValidator.js';
import { CaseEngine } from '../src/engine/caseEngine.js';

describe('PRNG Determinism', () => {
  it('produces identical random sequences for identical seeds', () => {
    const rng1 = new PRNG(42);
    const rng2 = new PRNG(42);

    for (let i = 0; i < 50; i++) {
      expect(rng1.next()).toBe(rng2.next());
      expect(rng1.nextInt(1, 100)).toBe(rng2.nextInt(1, 100));
    }
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = new PRNG('echo_park_a');
    const rng2 = new PRNG('echo_park_b');

    const sample1 = Array.from({ length: 10 }, () => rng1.next());
    const sample2 = Array.from({ length: 10 }, () => rng2.next());

    expect(sample1).not.toEqual(sample2);
  });
});

describe('Case Generator Ground Truth & Evidence Derivation', () => {
  const caseData = generateCase({ seed: 1984 });

  it('generates complete ground truth with timeline and facts', () => {
    expect(caseData.groundTruth).toBeDefined();
    expect(caseData.groundTruth.victimId).toBe('char_victim_mercer');
    expect(caseData.groundTruth.culpritId).toBe('char_suspect_calderon');
    expect(caseData.groundTruth.timeline.length).toBeGreaterThan(0);
    expect(Object.keys(caseData.groundTruth.facts).length).toBeGreaterThan(0);
  });

  it('strictly derives every single piece of evidence from 1+ ground truth facts', () => {
    for (const [clueId, clue] of Object.entries(caseData.evidence)) {
      expect(
        clue.derivedFromFactIds.length,
        `Evidence ${clueId} must link to at least one GroundTruthFact`
      ).toBeGreaterThan(0);

      for (const factId of clue.derivedFromFactIds) {
        expect(
          caseData.groundTruth.facts[factId],
          `Fact ${factId} referenced by evidence ${clueId} must exist in groundTruth.facts`
        ).toBeDefined();
      }
    }
  });

  it('ensures every suspect has a distinct secret, including non-murder secrets for innocent suspects', () => {
    const suspects = Object.values(caseData.characters).filter(
      (c) => c.role === 'suspect' || c.role === 'culprit'
    );
    expect(suspects.length).toBe(3);

    for (const suspect of suspects) {
      expect(suspect.secret).toBeDefined();
      expect(suspect.secret.description.length).toBeGreaterThan(10);
      if (suspect.id !== caseData.groundTruth.culpritId) {
        expect(suspect.secret.isMurder).toBe(false);
      } else {
        expect(suspect.secret.isMurder).toBe(true);
      }
    }
  });
});

describe('Solvability Validator', () => {
  const caseData = generateCase({ seed: 1984 });

  it('mathematically validates that the case is 100% solvable without guesswork', () => {
    const report = SolvabilityValidator.validateSolvability(caseData);

    expect(report.solvable).toBe(true);
    expect(report.culpritId).toBe(caseData.groundTruth.culpritId);
    expect(report.pillarsEstablished.motive).toBe(true);
    expect(report.pillarsEstablished.opportunity).toBe(true);
    expect(report.pillarsEstablished.means).toBe(true);
    expect(report.errors).toHaveLength(0);
    expect(report.criticalPath.length).toBeGreaterThan(0);
  });

  it('confirms conviction when correct suspect and all 3 pillars are presented to DA', () => {
    const validAccusation = {
      accusedCharacterId: caseData.groundTruth.culpritId,
      motiveEvidenceId: 'ev_audit_dossier',
      opportunityEvidenceId: 'ev_cctv_calderon_car',
      meansEvidenceId: 'ev_forensic_ballistics_dna'
    };

    const result = SolvabilityValidator.evaluateAccusation(caseData, validAccusation);
    expect(result.success).toBe(true);
    expect(result.verdict).toBe('CONVICTION');
    expect(result.satisfiedPillars.motive).toBe(true);
    expect(result.satisfiedPillars.opportunity).toBe(true);
    expect(result.satisfiedPillars.means).toBe(true);
  });

  it('rejects indictment if any pillar is missing', () => {
    const incompleteAccusation = {
      accusedCharacterId: caseData.groundTruth.culpritId,
      motiveEvidenceId: 'ev_audit_dossier',
      opportunityEvidenceId: 'ev_cctv_calderon_car',
      meansEvidenceId: 'ev_dispatch' // Dispatch does NOT prove means!
    };

    const result = SolvabilityValidator.evaluateAccusation(caseData, incompleteAccusation);
    expect(result.success).toBe(false);
    expect(result.verdict).toBe('CASE_DISMISSED_INSUFFICIENT_EVIDENCE');
    expect(result.satisfiedPillars.means).toBe(false);
  });

  it('flags catastrophic wrongful arrest if an innocent person is accused', () => {
    const wrongfulAccusation = {
      accusedCharacterId: 'char_suspect_elena',
      motiveEvidenceId: 'ev_victim_phone',
      opportunityEvidenceId: 'ev_elena_rideshare_receipt',
      meansEvidenceId: 'ev_culvert_weapon'
    };

    const result = SolvabilityValidator.evaluateAccusation(caseData, wrongfulAccusation);
    expect(result.success).toBe(false);
    expect(result.verdict).toBe('WRONGFUL_ARREST_DISASTER');
  });
});

describe('CaseEngine Interrogation & Contradiction Resolution', () => {
  it('correctly catches suspect lies with contradictory evidence and yields confessions', () => {
    const caseData = generateCase({ seed: 1984 });
    const engine = new CaseEngine(caseData);

    // Initial suspect Calderon
    const session = engine.getOrCreateInterrogationSession('char_suspect_calderon');
    expect(session.isLawyerInvoked).toBe(false);

    // Give player the CCTV evidence (discovered through subpoena)
    engine.requestSubpoena('cctv_park_ave');

    // Ask alibi topic
    const askRes = engine.askTopic('char_suspect_calderon', 'topic_calderon_alibi');
    expect(askRes.isLie).toBe(true);
    expect(askRes.statement).toContain('Taix');

    // Present CCTV evidence to refute lie
    const confrontRes = engine.confrontWithEvidence(
      'char_suspect_calderon',
      'topic_calderon_alibi',
      'ev_cctv_calderon_car'
    );

    expect(confrontRes.success).toBe(true);
    expect(confrontRes.response).toContain('Mercer insisted we meet there');
    expect(session.brokenTopicIds).toContain('topic_calderon_alibi');
    expect(session.unlockedTopicIds).toContain('topic_calderon_motive');
  });

  it('triggers lawyer walkout when badgering with wrong evidence drives pressure to threshold', () => {
    const caseData = generateCase({ seed: 1984 });
    const engine = new CaseEngine(caseData);

    const session = engine.getOrCreateInterrogationSession('char_suspect_calderon');

    // Repeatedly present irrelevant evidence
    for (let i = 0; i < 5; i++) {
      engine.confrontWithEvidence(
        'char_suspect_calderon',
        'topic_calderon_alibi',
        'ev_coroner_prelim' // Irrelevant to his alibi
      );
    }

    expect(session.pressure).toBeGreaterThanOrEqual(90);
    expect(session.isLawyerInvoked).toBe(true);

    // Any further questioning is blocked
    const blockedAsk = engine.askTopic('char_suspect_calderon', 'topic_calderon_alibi');
    expect(blockedAsk.lawyerCalled).toBe(true);
  });
});
