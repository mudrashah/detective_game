import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  User,
  AlertTriangle,
  ArrowLeft,
  Flame,
  HeartHandshake,
  CheckCircle,
  HelpCircle,
  Shield,
  FileCheck
} from 'lucide-react';

export const InterrogationRoom: React.FC = () => {
  const {
    caseData,
    engine,
    unlockedCharacterIds,
    selectedCharacterId,
    setSelectedCharacter,
    interrogationSessions,
    askTopic,
    confrontSuspect,
    discoveredEvidenceIds,
    setActiveView
  } = useGameStore();

  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [showPresentEvidenceModal, setShowPresentEvidenceModal] = useState<boolean>(false);
  const [lastFeedback, setLastFeedback] = useState<{ success: boolean; message: string } | null>(
    null
  );

  const availableSuspects = unlockedCharacterIds
    .map((id) => caseData.characters[id])
    .filter((c) => c && c.role !== 'victim');

  const currentCharacter = selectedCharacterId
    ? caseData.characters[selectedCharacterId]
    : availableSuspects[0];

  const session = currentCharacter
    ? engine.getOrCreateInterrogationSession(currentCharacter.id)
    : null;

  const currentTopic = activeTopicId ? caseData.interrogationTopics[activeTopicId] : null;

  const handleSelectTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setLastFeedback(null);
    if (currentCharacter) {
      askTopic(currentCharacter.id, topicId);
    }
  };

  const handlePresentEvidence = (evidenceId: string) => {
    if (!currentCharacter || !activeTopicId) return;
    const result = confrontSuspect(currentCharacter.id, activeTopicId, evidenceId);
    setShowPresentEvidenceModal(false);
    setLastFeedback({
      success: result.success,
      message: result.response
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-noir-950 text-neutral-100 select-none overflow-hidden font-mono">
      {/* Top Bar */}
      <div className="z-20 flex items-center justify-between px-6 py-3 bg-noir-900 border-b border-noir-800">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveView('desk')}
            className="flex items-center space-x-1.5 px-3 py-1 bg-noir-800 hover:bg-noir-700 text-xs font-semibold rounded border border-neutral-700 text-neutral-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Desk</span>
          </button>
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
            INTERROGATION ROOM B — METRO HOMICIDE DIVISION
          </span>
        </div>

        {/* Suspect Selector Tabs */}
        <div className="flex items-center space-x-2">
          {availableSuspects.map((char) => {
            const isSelected = currentCharacter?.id === char.id;
            const charSession = interrogationSessions[char.id];
            const isLocked = charSession?.isLawyerInvoked;

            return (
              <button
                key={char.id}
                onClick={() => {
                  setSelectedCharacter(char.id);
                  setActiveTopicId(null);
                  setLastFeedback(null);
                }}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center space-x-2 border ${
                  isSelected
                    ? 'bg-amber-500 text-noir-950 border-amber-400'
                    : isLocked
                      ? 'bg-red-950/40 text-red-400 border-red-900'
                      : 'bg-noir-850 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                <User className="w-3 h-3" />
                <span>{char.name}</span>
                {isLocked && <span className="text-[10px] text-red-500 font-bold">[5TH]</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interrogation Split View */}
      {currentCharacter && session ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Pane: Suspect Portrait & Psychology Gauges */}
          <div className="w-80 bg-noir-900 border-r border-noir-800 p-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Suspect Avatar & Bio */}
              <div className="text-center space-y-3">
                <div className="relative w-28 h-28 mx-auto rounded-full bg-noir-800 border-2 border-neutral-700 flex items-center justify-center overflow-hidden shadow-2xl">
                  <User className="w-16 h-16 text-neutral-400" />
                  {session.isLawyerInvoked && (
                    <div className="absolute inset-0 bg-red-950/80 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-xs font-black text-red-500 tracking-wider">
                        COUNSEL INVOKED
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    {currentCharacter.name}
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans">{currentCharacter.occupation}</p>
                </div>
              </div>

              {/* Psychology Gauges */}
              <div className="space-y-4 bg-noir-850 p-4 rounded-lg border border-noir-800">
                {/* Pressure Gauge */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400 flex items-center space-x-1">
                      <Flame className="w-3.5 h-3.5 text-red-500" />
                      <span>Pressure / Tension:</span>
                    </span>
                    <span
                      className={`font-bold ${
                        session.pressure >= currentCharacter.lawyerThreshold - 15
                          ? 'text-red-500 animate-pulse'
                          : 'text-amber-400'
                      }`}
                    >
                      {session.pressure}% / {currentCharacter.lawyerThreshold}%
                    </span>
                  </div>
                  <div className="w-full bg-noir-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        session.pressure >= currentCharacter.lawyerThreshold - 15
                          ? 'bg-red-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, session.pressure)}%` }}
                    />
                  </div>
                  {session.pressure >= currentCharacter.lawyerThreshold - 15 && (
                    <span className="text-[10px] text-red-400 mt-1 block">
                      CRITICAL: Suspect on verge of invoking 5th Amendment counsel!
                    </span>
                  )}
                </div>

                {/* Trust Gauge */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400 flex items-center space-x-1">
                      <HeartHandshake className="w-3.5 h-3.5 text-blue-400" />
                      <span>Compliance / Trust:</span>
                    </span>
                    <span className="font-bold text-blue-400">{session.trust}%</span>
                  </div>
                  <div className="w-full bg-noir-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, session.trust)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Character Details & Alibi */}
              <div className="text-xs space-y-2 text-neutral-400 font-sans">
                <p>
                  <strong className="text-neutral-300">Traits:</strong>{' '}
                  {currentCharacter.traits.join(', ')}
                </p>
                <p>
                  <strong className="text-neutral-300">Claimed Alibi:</strong>{' '}
                  {currentCharacter.claimedAlibi.description}
                </p>
              </div>
            </div>

            {/* Miranda Warning Footer */}
            <div className="p-3 bg-noir-800/60 rounded border border-neutral-800 text-[10px] text-neutral-400">
              <Shield className="w-3 h-3 text-amber-500 inline mr-1" />
              Miranda advisory active. Badgering without evidentiary basis will trigger attorney
              lockout.
            </div>
          </div>

          {/* Center Pane: Testimony Tree & Dialogue Log */}
          <div className="flex-1 flex flex-col bg-noir-950">
            {/* Top: Topics to Ask */}
            <div className="p-6 border-b border-noir-800 bg-noir-900/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-3">
                Interrogation Topics & Inquiries:
              </h4>

              {session.isLawyerInvoked ? (
                <div className="p-4 bg-red-950/50 border border-red-700 rounded text-red-200 text-xs flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold">RIGHT TO COUNSEL INVOKED (5TH AMENDMENT)</h5>
                    <p className="text-[11px] font-sans mt-0.5 text-red-300">
                      The suspect has demanded legal counsel. Further police questioning is barred
                      under California law.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {session.unlockedTopicIds.map((topicId) => {
                    const topic = caseData.interrogationTopics[topicId];
                    if (!topic) return null;

                    const isBroken = session.brokenTopicIds.includes(topicId);
                    const isAsked = session.askedTopicIds.includes(topicId);
                    const isActive = activeTopicId === topicId;

                    return (
                      <button
                        key={topicId}
                        onClick={() => handleSelectTopic(topicId)}
                        className={`text-left p-3 rounded border transition-all text-xs ${
                          isActive
                            ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg'
                            : isBroken
                              ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                              : isAsked
                                ? 'bg-noir-850 border-neutral-700 text-neutral-300 hover:border-neutral-500'
                                : 'bg-noir-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[11px] truncate">{topic.prompt}</span>
                          {isBroken ? (
                            <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-bold">
                              <CheckCircle className="w-3 h-3" />
                              <span>BROKEN</span>
                            </span>
                          ) : isAsked ? (
                            <span className="text-[10px] text-amber-400">ASKED</span>
                          ) : (
                            <span className="text-[10px] text-cyan-400">NEW</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom: Active Exchange & Evidence Confrontation */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {currentTopic ? (
                <div className="space-y-4 max-w-3xl">
                  {/* Detective Question */}
                  <div className="p-4 rounded-lg bg-noir-850 border border-neutral-700 text-xs">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-1">
                      Detective Question:
                    </span>
                    <p className="text-white text-sm leading-relaxed">{currentTopic.prompt}</p>
                  </div>

                  {/* Suspect Statement */}
                  <div
                    className={`p-4 rounded-lg border text-xs leading-relaxed ${
                      session.brokenTopicIds.includes(currentTopic.id)
                        ? 'bg-emerald-950/40 border-emerald-600 text-emerald-100'
                        : 'bg-noir-900 border-neutral-800 text-neutral-200'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">
                      {session.brokenTopicIds.includes(currentTopic.id)
                        ? 'Broken Confession / Admission:'
                        : `${currentCharacter.name} (Suspect Statement):`}
                    </span>
                    <p className="text-sm font-sans italic">
                      "{session.brokenTopicIds.includes(currentTopic.id)
                        ? currentTopic.brokenConfessionResponse
                        : currentTopic.initialResponse}"
                    </p>
                  </div>

                  {/* Feedback Message if recently confronted */}
                  {lastFeedback && (
                    <div
                      className={`p-3 rounded text-xs border ${
                        lastFeedback.success
                          ? 'bg-emerald-900/40 border-emerald-500 text-emerald-200'
                          : 'bg-red-950/40 border-red-500 text-red-200'
                      }`}
                    >
                      <strong>
                        {lastFeedback.success
                          ? 'LIE SHATTERED BY CONTRADICTORY EVIDENCE!'
                          : 'CONFRONTATION REJECTED BY SUSPECT:'}
                      </strong>
                      <p className="font-sans mt-1 text-[11px]">{lastFeedback.message}</p>
                    </div>
                  )}

                  {/* Action Button: Present Evidence */}
                  {!session.brokenTopicIds.includes(currentTopic.id) && !session.isLawyerInvoked && (
                    <div className="pt-2 flex items-center space-x-3">
                      <button
                        onClick={() => setShowPresentEvidenceModal(true)}
                        className="px-4 py-2.5 rounded bg-red-900 hover:bg-red-800 text-white text-xs font-bold tracking-wider uppercase border border-red-600 flex items-center space-x-2 shadow-lg transition-transform hover:scale-[1.02]"
                      >
                        <FileCheck className="w-4 h-4 text-red-300" />
                        <span>Present Contradictory Evidence</span>
                      </button>
                      <span className="text-xs text-neutral-400">
                        Match a discovered clue against this statement to break their lie.
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-neutral-500 text-xs">
                  <div>
                    <HelpCircle className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
                    <p>Select an interrogation topic above to press the suspect.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal: Present Evidence Selector */}
      {showPresentEvidenceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-noir-900 border border-neutral-700 rounded-lg max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-noir-800 pb-3">
              <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider">
                SELECT EVIDENCE TO CONTRADICT SUSPECT STATEMENT
              </h3>
              <button
                onClick={() => setShowPresentEvidenceModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400 font-sans">
              Choose an evidence item from your case locker that refutes the suspect's claim. Warning:
              presenting unrelated evidence will increase suspect hostility and provoke a lawyer walkout.
            </p>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {discoveredEvidenceIds.map((clueId) => {
                const clue = caseData.evidence[clueId];
                if (!clue) return null;

                return (
                  <button
                    key={clueId}
                    onClick={() => handlePresentEvidence(clueId)}
                    className="w-full text-left p-3 rounded bg-noir-850 hover:bg-noir-800 border border-neutral-800 hover:border-amber-600/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{clue.title}</span>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 px-1.5 py-0.5 rounded bg-noir-950">
                        {clue.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-sans line-clamp-2">
                      {clue.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

