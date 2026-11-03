import { PRNG } from '../prng/index.js';
import {
  CaseData,
  Character,
  EvidenceItem,
  GroundTruth,
  GroundTruthFact,
  InterrogationTopic,
  Location,
  TimelineEvent
} from '../types/index.js';

export interface GeneratorOptions {
  seed?: number | string;
}

/**
 * Deterministic Case Generator.
 * Constructs Ground Truth first, then derives all physical clues,
 * records, suspect secrets, and interrogation dialogue graphs.
 */
export function generateCase(options: GeneratorOptions = {}): CaseData {
  const seed = options.seed ?? 1984;
  const rng = new PRNG(seed);

  // Case identifiers
  const caseNumber = `MHD-2026-${rng.nextInt(1000, 9999)}`;
  const caseId = `case_${rng.nextInt(10000, 99999)}`;

  // --- 1. GROUND TRUTH DEFINITION ---
  const victimId = 'char_victim_mercer';
  const culpritId = 'char_suspect_calderon';
  const innocentSuspect1Id = 'char_suspect_elena';
  const innocentSuspect2Id = 'char_suspect_tyler';
  const witnessHectorId = 'char_witness_hector';

  const crimeSceneId = 'loc_echo_park_boathouse';
  const victimOfficeId = 'loc_mercer_office';
  const calderonOfficeId = 'loc_calderon_realty';
  const barLocationId = 'loc_filipino_bar';
  const elenaResidenceId = 'loc_elena_residence';

  const murderWeapon = 'Stolen Heavy Brass Nautical Theodolite';
  const causeOfDeath = 'Multiple blunt force cranial impacts with specialized brass instrument';
  const estimatedTimeOfDeath = '2026-10-18T22:30:00';

  const groundTruthFacts: Record<string, GroundTruthFact> = {
    fact_calderon_embezzlement: {
      id: 'fact_calderon_embezzlement',
      type: 'motive',
      description:
        'Raymond Calderon diverted $2,400,000 from client escrow into private Cayman accounts, discovered by auditor Julian Mercer.',
      primarySubjectId: culpritId,
      secondarySubjectId: victimId,
      significance: 'critical_pillar'
    },
    fact_calderon_at_scene_tod: {
      id: 'fact_calderon_at_scene_tod',
      type: 'presence',
      description:
        'Raymond Calderon drove to Echo Park Lake in his Lexus ES, arrived at 22:10, confronted Julian Mercer in the boathouse, and fled at 22:38.',
      primarySubjectId: culpritId,
      locationId: crimeSceneId,
      timestamp: '2026-10-18T22:25:00',
      significance: 'critical_pillar'
    },
    fact_calderon_weapon_handling: {
      id: 'fact_calderon_weapon_handling',
      type: 'weapon',
      description:
        'Raymond Calderon took an antique brass theodolite from his vehicle trunk, struck Julian Mercer 3 times, then threw it into the lake culvert.',
      primarySubjectId: culpritId,
      locationId: crimeSceneId,
      timestamp: '2026-10-18T22:28:00',
      significance: 'critical_pillar'
    },
    fact_elena_drug_deal: {
      id: 'fact_elena_drug_deal',
      type: 'secret',
      description:
        'Elena Cruz met a prescription fentanyl dealer at Beverly Blvd from 22:20 to 22:40, proving she was 2.5 miles from the crime scene at the time of death.',
      primarySubjectId: innocentSuspect1Id,
      timestamp: '2026-10-18T22:30:00',
      significance: 'supporting'
    },
    fact_tyler_atm_withdrawal: {
      id: 'fact_tyler_atm_withdrawal',
      type: 'secret',
      description:
        'Tyler Vance was deeply indebted to loan sharks and withdrew $40 at an ATM on Temple St at 22:35, then waited in his car.',
      primarySubjectId: innocentSuspect2Id,
      timestamp: '2026-10-18T22:35:00',
      significance: 'supporting'
    },
    fact_hector_observation: {
      id: 'fact_hector_observation',
      type: 'timeline',
      description:
        'Groundskeeper Hector Alvarez saw a dark luxury sedan speed south on Glendale Blvd away from the lake at 22:36.',
      primarySubjectId: witnessHectorId,
      locationId: crimeSceneId,
      timestamp: '2026-10-18T22:36:00',
      significance: 'supporting'
    }
  };

  const timeline: TimelineEvent[] = [
    {
      id: 'tl_1',
      timestamp: '2026-10-18T18:30:00',
      characterId: innocentSuspect1Id,
      locationId: victimOfficeId,
      action: 'Elena Cruz argues violently with Julian Mercer regarding missing audit funds.',
      factId: 'fact_calderon_embezzlement'
    },
    {
      id: 'tl_2',
      timestamp: '2026-10-18T21:00:00',
      characterId: victimId,
      locationId: victimOfficeId,
      action: 'Julian calls Raymond Calderon demanding an urgent midnight meeting at Echo Park Boathouse.',
      factId: 'fact_calderon_embezzlement'
    },
    {
      id: 'tl_3',
      timestamp: '2026-10-18T21:30:00',
      characterId: innocentSuspect2Id,
      locationId: barLocationId,
      action: 'Tyler Vance gets into an argument over his declined credit card and leaves the bar.',
      factId: 'fact_tyler_atm_withdrawal'
    },
    {
      id: 'tl_4',
      timestamp: '2026-10-18T22:10:00',
      characterId: culpritId,
      locationId: crimeSceneId,
      action: 'Raymond Calderon parks his dark Lexus ES at Park Ave and Glendale Blvd.',
      factId: 'fact_calderon_at_scene_tod'
    },
    {
      id: 'tl_5',
      timestamp: '2026-10-18T22:28:00',
      characterId: culpritId,
      locationId: crimeSceneId,
      action: 'Raymond Calderon bludgeons Julian Mercer with the brass theodolite.',
      factId: 'fact_calderon_weapon_handling',
      isCrimeEvent: true
    },
    {
      id: 'tl_6',
      timestamp: '2026-10-18T22:35:00',
      characterId: innocentSuspect2Id,
      locationId: 'loc_atm_temple',
      action: 'Tyler Vance withdraws $40 cash from Temple St ATM.',
      factId: 'fact_tyler_atm_withdrawal'
    },
    {
      id: 'tl_7',
      timestamp: '2026-10-18T22:36:00',
      characterId: culpritId,
      locationId: crimeSceneId,
      action: 'Calderon discards weapon in culvert and speeds away in Lexus ES.',
      factId: 'fact_hector_observation'
    }
  ];

  const groundTruth: GroundTruth = {
    victimId,
    culpritId,
    murderWeapon,
    causeOfDeath,
    estimatedTimeOfDeath,
    timeOfDeathWindow: {
      start: '2026-10-18T22:15:00',
      end: '2026-10-18T22:45:00'
    },
    crimeSceneId,
    motiveCategory: 'coverup_blackmail',
    motiveDetails:
      'Calderon faced imminent federal prosecution and ruin after Mercer uncovered his $2.4M escrow embezzlement scheme.',
    facts: groundTruthFacts,
    timeline
  };

  // --- 2. LOCATIONS DEFINITION ---
  const locations: Record<string, Location> = {
    [crimeSceneId]: {
      id: crimeSceneId,
      name: 'Echo Park Lake Boathouse & Canal Walk',
      neighborhood: 'Echo Park',
      fictionalAddress: '1120 Echo Park Avenue',
      coordinates: { lat: 34.0722, lng: -118.2606 },
      type: 'crime_scene',
      description:
        'A dark wooden promenade and maintenance dock beside the lotus bed. Heavy police perimeter tape flutters in the night damp.',
      initialUnlocked: true,
      searchClueIds: ['ev_mud_footprints', 'ev_culvert_weapon'],
      residentCharacterIds: [witnessHectorId]
    },
    [victimOfficeId]: {
      id: victimOfficeId,
      name: 'Vance & Mercer Forensic Accounting',
      neighborhood: 'Downtown Arts District',
      fictionalAddress: '834 Mateo Street, Suite 4B',
      coordinates: { lat: 34.0375, lng: -118.2322 },
      type: 'workplace',
      description:
        'A converted industrial loft lined with secure filing cabinets, dual-monitor workstations, and shredding bins.',
      initialUnlocked: true,
      searchClueIds: ['ev_audit_dossier', 'ev_victim_desktop_memo'],
      residentCharacterIds: [innocentSuspect1Id]
    },
    [calderonOfficeId]: {
      id: calderonOfficeId,
      name: 'Calderon Pacific Escrow & Capital',
      neighborhood: 'Silver Lake',
      fictionalAddress: '2815 Sunset Boulevard',
      coordinates: { lat: 34.0818, lng: -118.2736 },
      type: 'workplace',
      description:
        'An upscale mid-century commercial office with tinted glass, polished slate, and private subterranean executive parking.',
      initialUnlocked: false,
      searchClueIds: ['ev_calderon_trunk_kit'],
      residentCharacterIds: [culpritId]
    },
    [barLocationId]: {
      id: barLocationId,
      name: 'The Midnight Lantern Lounge',
      neighborhood: 'Historic Filipinotown',
      fictionalAddress: '1604 Temple Street',
      coordinates: { lat: 34.0671, lng: -118.2682 },
      type: 'commercial',
      description:
        'A dimly lit dive bar smelling of draft beer, stale tobacco, and vinyl booths. A muted TV plays Dodgers highlights in the corner.',
      initialUnlocked: false,
      searchClueIds: ['ev_bartender_statement'],
      residentCharacterIds: [innocentSuspect2Id]
    },
    [elenaResidenceId]: {
      id: elenaResidenceId,
      name: 'Elena Cruz Residence',
      neighborhood: 'Los Feliz',
      fictionalAddress: '4622 Ambrose Avenue, Apt 3',
      coordinates: { lat: 34.1085, lng: -118.2915 },
      type: 'residence',
      description:
        'A quiet second-floor stucco apartment with blackout curtains and a locked prescription medicine cabinet.',
      initialUnlocked: false,
      searchClueIds: ['ev_elena_rideshare_receipt'],
      residentCharacterIds: [innocentSuspect1Id]
    }
  };

  // --- 3. CHARACTERS DEFINITION ---
  const characters: Record<string, Character> = {
    [victimId]: {
      id: victimId,
      name: 'Julian Mercer',
      age: 44,
      occupation: 'Senior Forensic Auditor & Partner',
      residenceLocationId: 'loc_mercer_office',
      workplaceLocationId: victimOfficeId,
      bio: 'A meticulous, stubborn forensic accountant known for unearthing municipal and corporate embezzlement. Widowed, lived alone in Los Feliz.',
      role: 'victim',
      traits: ['calculating'],
      trust: 100,
      pressure: 0,
      lawyerThreshold: 100,
      breakdownThreshold: 100,
      secret: {
        id: 'sec_victim',
        title: 'Impending Whistleblower Filing',
        category: 'blackmail',
        description:
          'Had prepared a formal whistleblower package for the US Attorney regarding Calderon Escrow.',
        isMurder: false
      },
      claimedAlibi: {
        locationId: crimeSceneId,
        description: 'N/A (Deceased)',
        timeWindow: { start: '22:15', end: '22:45' },
        isFalse: false
      }
    },
    [culpritId]: {
      id: culpritId,
      name: 'Raymond "Ray" Calderon',
      age: 51,
      occupation: 'Managing Principal, Calderon Escrow & Capital',
      residenceLocationId: calderonOfficeId,
      workplaceLocationId: calderonOfficeId,
      bio: 'A polished, smooth-talking civic donor and commercial broker. Moves in high municipal circles, quick to threaten lawsuits when questioned.',
      role: 'culprit',
      traits: ['arrogant', 'calculating', 'defensive'],
      trust: 50,
      pressure: 15,
      lawyerThreshold: 90,
      breakdownThreshold: 65,
      secret: {
        id: 'sec_calderon_murder',
        title: '$2.4M Embezzlement & Homicide',
        category: 'murder',
        description:
          'Murdered Julian Mercer to conceal systemic escrow theft that would have resulted in federal prison.',
        isMurder: true
      },
      claimedAlibi: {
        locationId: 'loc_taix_restaurant',
        description:
          'Dined alone at Taix French Restaurant on Sunset until 23:15, then drove directly home to Silver Lake.',
        timeWindow: { start: '21:00', end: '23:30' },
        isFalse: true
      }
    },
    [innocentSuspect1Id]: {
      id: innocentSuspect1Id,
      name: 'Elena Cruz',
      age: 32,
      occupation: 'Junior Audit Associate',
      residenceLocationId: elenaResidenceId,
      workplaceLocationId: victimOfficeId,
      bio: 'Brilliant but chronically stressed accountant. Had screaming matches with Mercer over audit workload and missing receipts.',
      role: 'suspect',
      traits: ['nervous', 'defensive'],
      trust: 40,
      pressure: 25,
      lawyerThreshold: 85,
      breakdownThreshold: 55,
      secret: {
        id: 'sec_elena_drugs',
        title: 'Prescription Fentanyl Dependency',
        category: 'narcotics',
        description:
          'Buys illicit diverted fentanyl pills; was meeting her supplier in a parked sedan during the murder.',
        isMurder: false
      },
      claimedAlibi: {
        locationId: elenaResidenceId,
        description: 'Went straight home to Los Feliz at 19:00, took a sleep aid, and slept all night.',
        timeWindow: { start: '19:00', end: '07:00' },
        isFalse: true
      }
    },
    [innocentSuspect2Id]: {
      id: innocentSuspect2Id,
      name: 'Tyler Vance',
      age: 48,
      occupation: 'Suspended County Code Inspector',
      residenceLocationId: barLocationId,
      bio: 'Julian Mercer’s estranged half-brother. Gambling debt, aggressive temper, co-beneficiary on Julian’s term life insurance policy.',
      role: 'suspect',
      traits: ['hostile', 'defensive'],
      trust: 30,
      pressure: 30,
      lawyerThreshold: 80,
      breakdownThreshold: 60,
      secret: {
        id: 'sec_tyler_loan',
        title: '$80,000 Loan Shark Debt',
        category: 'theft',
        description:
          'Hunted Julian for money and contemplated burglary; was desperately withdrawing cash at an ATM at TOD.',
        isMurder: false
      },
      claimedAlibi: {
        locationId: barLocationId,
        description: 'Drank at The Midnight Lantern Lounge until closing time at 02:00 AM.',
        timeWindow: { start: '20:00', end: '02:00' },
        isFalse: true
      }
    },
    [witnessHectorId]: {
      id: witnessHectorId,
      name: 'Hector Alvarez',
      age: 58,
      occupation: 'Parks Department Groundskeeper',
      residenceLocationId: crimeSceneId,
      bio: 'Worked Echo Park grounds for 18 years. Discovered the body near the north inlet gate at 06:10 AM.',
      role: 'witness',
      traits: ['compliant', 'grieving'],
      trust: 85,
      pressure: 10,
      lawyerThreshold: 100,
      breakdownThreshold: 20,
      secret: {
        id: 'sec_hector_none',
        title: 'None',
        category: 'theft',
        description: 'Clean record.',
        isMurder: false
      },
      claimedAlibi: {
        locationId: crimeSceneId,
        description: 'On night duty at park depot.',
        timeWindow: { start: '22:00', end: '06:00' },
        isFalse: false
      }
    }
  };

  // --- 4. EVIDENCE REPOSITORY ---
  const evidence: Record<string, EvidenceItem> = {
    ev_dispatch: {
      id: 'ev_dispatch',
      title: '911 Dispatch Audio & Computer Aided Dispatch Log',
      category: 'coroner',
      description:
        'Call placed at 06:14 AM by park groundskeeper Hector Alvarez. Unconscious male face-down in marsh reeds near Echo Park Boathouse dock.',
      discoveredByDefault: true,
      derivedFromFactIds: ['fact_hector_observation'],
      unlocksLocationIds: [crimeSceneId],
      unlocksCharacterIds: [witnessHectorId]
    },
    ev_coroner_prelim: {
      id: 'ev_coroner_prelim',
      title: 'County Medical Examiner Preliminary Autopsy Report',
      category: 'coroner',
      description:
        'Victim identified as Julian Mercer. Cause of death: Massive blunt force cranial depression. Time of death established between 22:15 and 22:45. Wound profile indicates heavy brass or bronze object with hexagonal threaded collar. Body submerged post-mortem.',
      discoveredByDefault: true,
      derivedFromFactIds: ['fact_calderon_weapon_handling'],
      unlocksLocationIds: [victimOfficeId]
    },
    ev_victim_phone: {
      id: 'ev_victim_phone',
      title: "Victim's Encrypted Phone - Extracted Call Log & Drafts",
      category: 'phone_record',
      description:
        'Mercer received an incoming call from Raymond Calderon at 21:00 (duration: 3m 12s). Mercer also had a stormy SMS exchange with Elena Cruz at 18:30. A draft unsent email reads: "Calderon, I will not sign off on the escrow reconciliation. The missing $2.4M is grand larceny. Bring your records to the boathouse tonight."',
      discoveredByDefault: true,
      derivedFromFactIds: ['fact_calderon_embezzlement'],
      provesMotiveFor: culpritId,
      contradictsStatementIds: ['stmt_calderon_no_contact', 'stmt_calderon_alibi'],
      unlocksCharacterIds: [culpritId, innocentSuspect1Id],
      unlocksLocationIds: [calderonOfficeId, elenaResidenceId]
    },
    ev_mud_footprints: {
      id: 'ev_mud_footprints',
      title: 'Crime Scene Cast: Size 11 Italian Loafer Impression',
      category: 'forensic_physical',
      description:
        'Fresh shoe impressions in lake shore mud leading from the boathouse dock to the north stormwater culvert. Fine Italian pebble-grain leather sole, size 11 European cut.',
      locationFoundId: crimeSceneId,
      derivedFromFactIds: ['fact_calderon_at_scene_tod'],
      provesOpportunityFor: culpritId
    },
    ev_culvert_weapon: {
      id: 'ev_culvert_weapon',
      title: 'Recovered Murder Weapon: Antique Brass Nautical Theodolite',
      category: 'forensic_physical',
      description:
        'A 14-pound solid brass marine survey instrument fished from the north storm culvert. Heavy hexagonal base matches skull fractures exactly. Human hair and tissue embedded in base screw threading.',
      locationFoundId: crimeSceneId,
      derivedFromFactIds: ['fact_calderon_weapon_handling'],
      provesMeansFor: culpritId
    },
    ev_witness_hector_statement: {
      id: 'ev_witness_hector_statement',
      title: 'Statement of Groundskeeper Hector Alvarez',
      category: 'witness_statement',
      description:
        'Hector testifies: "Around 22:35, I heard muffled yelling near the boat launch. A minute later, a dark luxury sedan—looked like a Lexus or BMW—screeched away down Glendale Blvd toward the freeway."',
      derivedFromFactIds: ['fact_hector_observation'],
      disprovesAlibiFor: culpritId,
      unlocksLocationIds: [calderonOfficeId]
    },
    ev_audit_dossier: {
      id: 'ev_audit_dossier',
      title: 'Mercer Office Safe: Calderon Escrow Irregularity Audit',
      category: 'document',
      description:
        'Uncovered in Mercer’s locked office safe: 80 pages of bank transfers proving Raymond Calderon skimmed $2,400,000 in earnest money deposits from commercial real estate deals. Scheduled for formal submission to the DA and State Bar on Monday.',
      locationFoundId: victimOfficeId,
      derivedFromFactIds: ['fact_calderon_embezzlement'],
      provesMotiveFor: culpritId,
      contradictsStatementIds: ['stmt_calderon_business_normal']
    },
    ev_victim_desktop_memo: {
      id: 'ev_victim_desktop_memo',
      title: 'Desk Calendar & Tyler Vance Threat Note',
      category: 'document',
      description:
        'Handwritten scrawl from Mercer’s desk: "Tyler came by screaming about mother’s estate deed. Threatened to take it out of my hide if I didn’t give him $50k for his bookie." Also notes Julian’s life insurance policy naming Tyler as secondary.',
      locationFoundId: victimOfficeId,
      derivedFromFactIds: ['fact_tyler_atm_withdrawal'],
      isRedHerring: true,
      unlocksCharacterIds: [innocentSuspect2Id],
      unlocksLocationIds: [barLocationId]
    },
    ev_cctv_calderon_car: {
      id: 'ev_cctv_calderon_car',
      title: 'LA City DOT Traffic Camera Footage (Glendale & Park Ave)',
      category: 'cctv',
      description:
        'Grainy timestamped intersection camera shows Raymond Calderon’s dark blue Lexus ES 350 (CA Lic #7XYZ88) turning south onto Park Ave toward the boathouse at 22:10, and exiting north onto Glendale Blvd at 22:38 with headlights off for the first 100 feet.',
      derivedFromFactIds: ['fact_calderon_at_scene_tod'],
      provesOpportunityFor: culpritId,
      disprovesAlibiFor: culpritId,
      contradictsStatementIds: ['stmt_calderon_alibi', 'stmt_calderon_never_in_park']
    },
    ev_cell_ping_calderon: {
      id: 'ev_cell_ping_calderon',
      title: 'Subpoenaed Cellular Tower Geo-Ping: Calderon Handset',
      category: 'phone_record',
      description:
        'Cell records for Raymond Calderon’s iPhone 15 Pro show handoff to Sector 3 of Echo Park North Tower between 22:14 and 22:37. No activity registered near Taix Restaurant during this window.',
      requiresWarrant: true,
      derivedFromFactIds: ['fact_calderon_at_scene_tod'],
      provesOpportunityFor: culpritId,
      disprovesAlibiFor: culpritId,
      contradictsStatementIds: ['stmt_calderon_alibi']
    },
    ev_forensic_ballistics_dna: {
      id: 'ev_forensic_ballistics_dna',
      title: 'Crime Lab Forensics: AFIS Latent Print & Paint Match',
      category: 'forensic_physical',
      description:
        'Forensic analysis of the recovered theodolite: Latent right thumbprint lifted in blood from the brass leveling wheel matches Raymond Calderon (AFIS 10-point match). Microscopic paint scraping from theodolite housing matches automotive clearcoat from Calderon’s Lexus trunk lining.',
      derivedFromFactIds: ['fact_calderon_weapon_handling'],
      provesMeansFor: culpritId,
      contradictsStatementIds: ['stmt_calderon_never_touched_weapon']
    },
    ev_elena_rideshare_receipt: {
      id: 'ev_elena_rideshare_receipt',
      title: 'Elena Cruz Rideshare Records & Cell Data',
      category: 'phone_record',
      description:
        'Lyft receipt shows Elena was dropped off at Alvarado & 8th St at 21:55, contradicting her claim that she slept at home in Los Feliz all night.',
      locationFoundId: elenaResidenceId,
      derivedFromFactIds: ['fact_elena_drug_deal'],
      contradictsStatementIds: ['stmt_elena_alibi']
    },
    ev_elena_signal_alibi: {
      id: 'ev_elena_signal_alibi',
      title: 'Elena Cruz Encrypted Signal Chat & Prescription Vial',
      category: 'document',
      description:
        'Yielded by Elena after breaking: Timestamped messages between 22:20 and 22:42 at a location on Beverly Blvd 2.5 miles away purchasing painkillers. Cell tower triangulation confirms her physical presence on Beverly Blvd during TOD.',
      derivedFromFactIds: ['fact_elena_drug_deal'],
      isRedHerring: true
    },
    ev_bartender_statement: {
      id: 'ev_bartender_statement',
      title: 'Witness Statement: Bartender at Midnight Lantern Lounge',
      category: 'witness_statement',
      description:
        'Bartender testifies: "Tyler Vance had three shots of bourbon, his debit card declined, he cursed at me and stormed out into the rain at 21:30. He was definitely not here at midnight."',
      locationFoundId: barLocationId,
      derivedFromFactIds: ['fact_tyler_atm_withdrawal'],
      contradictsStatementIds: ['stmt_tyler_alibi']
    },
    ev_atm_receipt_tyler: {
      id: 'ev_atm_receipt_tyler',
      title: 'Wells Fargo ATM Surveillance & Receipt (Temple & Glendale)',
      category: 'bank_record',
      description:
        'Surveillance video and time-stamped transaction receipt show Tyler Vance withdrawing $40 cash from the ATM at 22:35, then sitting despondently on the hood of his truck until 22:50. This confirms his whereabouts 1.5 miles from the boathouse during TOD.',
      derivedFromFactIds: ['fact_tyler_atm_withdrawal'],
      isRedHerring: true
    }
  };

  // --- 5. INTERROGATION TOPICS & LIE RESOLUTION ---
  const interrogationTopics: Record<string, InterrogationTopic> = {
    // Calderon Topics
    topic_calderon_alibi: {
      id: 'topic_calderon_alibi',
      characterId: culpritId,
      prompt: 'Account for your movements between 21:30 and 23:00 on Sunday night.',
      initialResponse:
        'I have already explained this to your patrol officers. I had a late dinner alone at Taix on Sunset. Enjoyed a bottle of Bordeaux, left at 23:15, and went straight home to bed. Check with the maître d\'.',
      isLie: true,
      underlyingFactId: 'fact_calderon_at_scene_tod',
      refutedByEvidenceId: 'ev_cctv_calderon_car',
      brokenConfessionResponse:
        'Alright, look... fine. I wasn’t at Taix the whole time. I drove by the park. Mercer insisted we meet there to discuss an audit issue. But I only stayed five minutes! He was perfectly alive when I walked away!',
      wrongEvidenceRetort:
        'Detective, that piece of paper proves absolutely nothing about where I was having dinner.',
      pressureDeltaOnAsk: 8,
      trustDeltaOnAsk: -5,
      pressureGainOnBreak: 25,
      trustDropOnBreak: -20,
      unlocksTopicIds: ['topic_calderon_meeting', 'topic_calderon_motive']
    },
    topic_calderon_motive: {
      id: 'topic_calderon_motive',
      characterId: culpritId,
      prompt: 'Julian Mercer had uncovered $2.4M missing from your escrow accounts.',
      initialResponse:
        'That is an outright slander! Mercer was a paranoid crank who didn’t understand high-velocity commercial liquidity reserves. My firm is solvent, and my reputation is spotless.',
      isLie: true,
      underlyingFactId: 'fact_calderon_embezzlement',
      refutedByEvidenceId: 'ev_audit_dossier',
      brokenConfessionResponse:
        'Mercer was trying to destroy me! Thirty years of building this company, and he wanted to take it all to the US Attorney over temporary float adjustments! He gave me an ultimatum... he forced my hand!',
      wrongEvidenceRetort:
        'Throwing baseless wild accusations at a respected civic businessman is a fast track to a civil rights lawsuit.',
      pressureDeltaOnAsk: 12,
      trustDeltaOnAsk: -10,
      pressureGainOnBreak: 30,
      trustDropOnBreak: -25,
      unlocksTopicIds: ['topic_calderon_weapon']
    },
    topic_calderon_weapon: {
      id: 'topic_calderon_weapon',
      characterId: culpritId,
      prompt: 'We fished the antique brass theodolite out of the north culvert.',
      initialResponse:
        'I know nothing about antique brass instruments or what happens in city drainage ditches. You are fishing in the dark.',
      isLie: true,
      underlyingFactId: 'fact_calderon_weapon_handling',
      refutedByEvidenceId: 'ev_forensic_ballistics_dna',
      brokenConfessionResponse:
        'My god... (Calderon buries his face in trembling hands). He laughed in my face. He told me I was going to spend twenty years in a federal penitentiary. I had the antique piece in my trunk from an estate sale... I didn’t plan it! It was dark, it was raining, he wouldn’t stop screaming at me! God help me...',
      wrongEvidenceRetort:
        'You have zero physical connection tying me to whatever junk you dredged up.',
      pressureDeltaOnAsk: 15,
      trustDeltaOnAsk: -15,
      pressureGainOnBreak: 40,
      trustDropOnBreak: -30
    },

    // Elena Cruz Topics
    topic_elena_whereabouts: {
      id: 'topic_elena_whereabouts',
      characterId: innocentSuspect1Id,
      prompt: 'Where were you between 9:00 PM and midnight last night?',
      initialResponse:
        'I was at my apartment on Ambrose Avenue. I had a migraine from the screaming match Julian and I had earlier. I took two Ambien and was out cold by 9:30 PM. I never left.',
      isLie: true,
      underlyingFactId: 'fact_elena_drug_deal',
      refutedByEvidenceId: 'ev_elena_rideshare_receipt',
      brokenConfessionResponse:
        'Please... don’t put this in the homicide report! I wasn’t asleep. I had a rideshare drop me near Alvarado. I was buying black-market Oxycodone. I have a severe spinal injury and the doctor cut off my prescription. Here—look at my phone! Look at the Signal chat! I was in a car on Beverly Blvd from 22:20 to 22:42 buying pills! I never went near Julian!',
      wrongEvidenceRetort:
        'That has nothing to do with my whereabouts. I told you I was at home.',
      pressureDeltaOnAsk: 10,
      trustDeltaOnAsk: -5,
      pressureGainOnBreak: 25,
      trustDropOnBreak: -15,
      unlocksClueIds: ['ev_elena_signal_alibi']
    },

    // Tyler Vance Topics
    topic_tyler_alibi: {
      id: 'topic_tyler_alibi',
      characterId: innocentSuspect2Id,
      prompt: 'You claim you were at the Midnight Lantern Lounge all night.',
      initialResponse:
        'Yeah, that’s right. Sipping draft beer, watching the Dodgers replay, minding my own damn business. Go ask the bartender if you don’t believe me.',
      isLie: true,
      underlyingFactId: 'fact_tyler_atm_withdrawal',
      refutedByEvidenceId: 'ev_bartender_statement',
      brokenConfessionResponse:
        'Alright! Okay! So the bartender cut me off when my card bounced at 9:30. Big deal! I went over to Temple and got $40 out of the Wells Fargo ATM at 10:35 PM to buy a six-pack at the 7-Eleven. Check the ATM cameras! I didn’t touch Julian! He was my brother!',
      wrongEvidenceRetort:
        'You’re barking up the wrong tree, detective. Try bringing real proof.',
      pressureDeltaOnAsk: 12,
      trustDeltaOnAsk: -10,
      pressureGainOnBreak: 25,
      trustDropOnBreak: -15,
      unlocksClueIds: ['ev_atm_receipt_tyler']
    },

    // Witness Hector
    topic_hector_night: {
      id: 'topic_hector_night',
      characterId: witnessHectorId,
      prompt: 'Tell me everything you observed before finding the victim.',
      initialResponse:
        'It was quiet around the lake until about 10:35 PM. I was locking the storage sheds near the north path when I heard an engine revving hard. A dark sedan sped out onto Glendale Blvd without lights on. Found the poor man in the reeds early this morning.',
      isLie: false,
      wrongEvidenceRetort: 'I don’t know about that, officer. I only saw the car speed away.',
      pressureDeltaOnAsk: 0,
      trustDeltaOnAsk: 5,
      pressureGainOnBreak: 0,
      trustDropOnBreak: 0,
      unlocksClueIds: ['ev_witness_hector_statement']
    }
  };

  const startingEvidenceIds = ['ev_dispatch', 'ev_coroner_prelim', 'ev_victim_phone'];
  const startingLocationIds = [crimeSceneId, victimOfficeId];
  const startingCharacterIds = [culpritId, innocentSuspect1Id, witnessHectorId];

  return {
    caseId,
    caseNumber,
    title: 'The Echo Park Reservoir Homicide',
    briefDescription:
      'A prominent forensic auditor is found bludgeoned to death in the reeds of Echo Park Lake. Beneath the placid water lies an intricate web of commercial embezzlement, narcotics dependencies, and loan shark desperation.',
    dispatchReport: {
      incidentTime: '2026-10-19T06:14:00',
      operatorNotes:
        '911 call from park employee reporting deceased adult male in water near north boathouse inlet. Code 3 response.',
      reportingParty: 'Hector Alvarez (Parks Dept)',
      initialUnitDispatched: 'Unit 11-A-42 (Metro Division)'
    },
    groundTruth,
    characters,
    locations,
    evidence,
    interrogationTopics,
    startingEvidenceIds,
    startingLocationIds,
    startingCharacterIds,
    seed
  };
}
