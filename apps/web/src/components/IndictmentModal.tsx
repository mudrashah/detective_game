import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  Gavel,
  ArrowLeft,
  CheckCircle,
  AlertOctagon,
  RotateCcw
} from 'lucide-react';

export const IndictmentModal: React.FC = () => {
  const {
    caseData,
    discoveredEvidenceIds,
    unlockedCharacterIds,
    submitAccusation,
    lastAccusationResult,
    resetGame,
    setActiveView
  } = useGameStore();

  const suspects = unlockedCharacterIds
    .map((id) => caseData.characters[id])
    .filter((c) => c && c.role !== 'victim');

  const [selectedSuspectId, setSelectedSuspectId] = useState<string>(suspects[0]?.id || '');
  const [selectedMotiveId, setSelectedMotiveId] = useState<string>('');
  const [selectedOppId, setSelectedOppId] = useState<string>('');
  const [selectedMeansId, setSelectedMeansId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuspectId || !selectedMotiveId || !selectedOppId || !selectedMeansId) {
      alert('You must provide evidence for all three pillars (Motive, Opportunity, Means)!');
      return;
    }

    submitAccusation({
      accusedCharacterId: selectedSuspectId,
      motiveEvidenceId: selectedMotiveId,
      opportunityEvidenceId: selectedOppId,
      meansEvidenceId: selectedMeansId
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-noir-950 text-neutral-100 select-none overflow-hidden font-mono">
      {/* Top Header */}
      <div className="z-20 flex items-center justify-between px-6 py-3 bg-noir-900 border-b border-noir-800">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveView('desk')}
            className="flex items-center space-x-1.5 px-3 py-1 bg-noir-800 hover:bg-noir-700 text-xs font-semibold rounded border border-neutral-700 text-neutral-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Desk</span>
          </button>
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center space-x-2">
            <Gavel className="w-4 h-4 text-red-500" />
            <span>DISTRICT ATTORNEY SPECIAL TRIALS — FORMAL INDICTMENT SUBMISSION</span>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
        {lastAccusationResult ? (
          /* Verdict Display Screen */
          <div className="space-y-6">
            <div
              className={`p-8 rounded-lg border shadow-2xl ${
                lastAccusationResult.success
                  ? 'bg-emerald-950/40 border-emerald-500'
                  : lastAccusationResult.verdict === 'WRONGFUL_ARREST_DISASTER'
                    ? 'bg-rose-950/50 border-rose-600'
                    : 'bg-amber-950/40 border-amber-600'
              }`}
            >
              <div className="flex items-center space-x-3 mb-4">
                {lastAccusationResult.success ? (
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                ) : (
                  <AlertOctagon className="w-8 h-8 text-rose-500" />
                )}
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                    DISTRICT ATTORNEY OFFICIAL DETERMINATION:
                  </span>
                  <h2 className="text-xl font-bold text-white">
                    {lastAccusationResult.headline}
                  </h2>
                </div>
              </div>

              <p className="font-sans text-sm leading-relaxed text-neutral-200 mt-4">
                {lastAccusationResult.detailedAnalysis}
              </p>

              {lastAccusationResult.flaws.length > 0 && (
                <div className="mt-6 pt-4 border-t border-rose-900/60 space-y-2">
                  <span className="text-xs font-bold uppercase text-rose-400 block">
                    Prosecutorial & Evidentiary Deficiencies:
                  </span>
                  {lastAccusationResult.flaws.map((flaw, idx) => (
                    <div key={idx} className="text-xs text-rose-200 font-sans flex items-start space-x-2">
                      <span>•</span>
                      <span>{flaw}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setActiveView('desk')}
                className="px-5 py-2.5 rounded bg-noir-850 hover:bg-noir-800 text-neutral-300 border border-neutral-700 text-xs font-bold uppercase"
              >
                Back to Detective Desk
              </button>

              <button
                onClick={resetGame}
                className="px-5 py-2.5 rounded bg-amber-600 hover:bg-amber-500 text-noir-950 font-bold text-xs uppercase flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Re-Initialize Case</span>
              </button>
            </div>
          </div>
        ) : (
          /* Accusation Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-5 rounded-lg bg-noir-900 border border-noir-800 text-xs leading-relaxed text-neutral-300 font-sans">
              <strong className="text-amber-400 block mb-1">LEGAL ARRAIGNMENT ADVISORY:</strong>
              Before the District Attorney will sign a 1st-degree murder indictment, you must
              satisfy all three pillars of criminal jurisprudence beyond a reasonable doubt: Motive,
              Opportunity, and Means. Submitting false charges against an innocent citizen will result
              in an immediate civil rights lawsuit.
            </div>

            {/* Pillar 1: Select Suspect */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-amber-500 block">
                1. Target Suspect for Arrest Warrant:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {suspects.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setSelectedSuspectId(s.id)}
                    className={`p-3 rounded text-left border text-xs transition-all ${
                      selectedSuspectId === s.id
                        ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg'
                        : 'bg-noir-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold block text-sm">{s.name}</span>
                    <span className="text-[11px] font-sans text-neutral-400">{s.occupation}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pillar 2: Motive Evidence */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-amber-500 block">
                2. Legal Motive Evidence:
              </label>
              <select
                value={selectedMotiveId}
                onChange={(e) => setSelectedMotiveId(e.target.value)}
                className="w-full p-3 rounded bg-noir-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Select evidence proving motive --</option>
                {discoveredEvidenceIds.map((cId) => (
                  <option key={cId} value={cId}>
                    {caseData.evidence[cId]?.title} ({caseData.evidence[cId]?.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Pillar 3: Opportunity Evidence */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-amber-500 block">
                3. Opportunity Evidence (Scene Presence / Shattered Alibi during TOD):
              </label>
              <select
                value={selectedOppId}
                onChange={(e) => setSelectedOppId(e.target.value)}
                className="w-full p-3 rounded bg-noir-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Select evidence proving presence / shattering alibi --</option>
                {discoveredEvidenceIds.map((cId) => (
                  <option key={cId} value={cId}>
                    {caseData.evidence[cId]?.title} ({caseData.evidence[cId]?.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Pillar 4: Means / Forensics Evidence */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-amber-500 block">
                4. Means / Forensic Murder Weapon Connection:
              </label>
              <select
                value={selectedMeansId}
                onChange={(e) => setSelectedMeansId(e.target.value)}
                className="w-full p-3 rounded bg-noir-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Select forensic weapon / physical proof --</option>
                {discoveredEvidenceIds.map((cId) => (
                  <option key={cId} value={cId}>
                    {caseData.evidence[cId]?.title} ({caseData.evidence[cId]?.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Indictment Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 rounded bg-red-700 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-widest border border-red-500 shadow-2xl transition-transform hover:scale-[1.01] flex items-center justify-center space-x-2"
              >
                <Gavel className="w-4 h-4" />
                <span>Transmit Formal Charges to the District Attorney</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
