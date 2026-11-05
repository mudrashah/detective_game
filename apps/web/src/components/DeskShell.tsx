import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { EvidenceBoard } from './EvidenceBoard';
import { CaseFileViewer } from './CaseFileViewer';
import { InterrogationRoom } from './InterrogationRoom';
import { TerminalView } from './TerminalView';
import { LocationCanvass } from './LocationCanvass';
import { IndictmentModal } from './IndictmentModal';
import { soundManager } from '../audio/soundManager';

export const DeskShell: React.FC = () => {
  const {
    caseData,
    activeView,
    setActiveView,
    setSelectedCharacter,
    discoveredEvidenceIds,
    muted,
    toggleAudio
  } = useGameStore();

  // Active clue inspection modal when clicked on corkboard
  const [inspectedClueId, setInspectedClueId] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState<boolean>(false);

  // Live ticking countdown for "UNTIL ARRAIGNMENT"
  const [secondsRemaining, setSecondsRemaining] = useState<number>(47 * 3600 + 59 * 60 + 42);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatClock = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((totalSecs % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSecs % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleClueClick = (clueId: string) => {
    soundManager.playPaperRustle();
    setInspectedClueId(clueId);
  };

  const handleSuspectClick = (characterId: string) => {
    soundManager.playClick();
    setSelectedCharacter(characterId);
    setActiveView('interrogation');
  };

  return (
    <div className="relative min-h-screen w-full noir-desk-bg text-[#f0ede6] font-mono flex flex-col select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION BAR
      ───────────────────────────────────────────────────────────── */}
      <header className="h-12 border-b border-[#22201c] bg-[#0c0b0a] flex items-center justify-between px-6 z-30">
        {/* Left: Branding */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#d85040]" />
          <span className="tracking-[0.18em] text-[#caa87e] font-bold text-[11px]">
            MHD · LOS ANGELES
          </span>
        </div>

        {/* Center: Tabs */}
        <nav className="flex items-center space-x-7 text-xs font-medium">
          <button
            onClick={() => setActiveView('desk')}
            className={`pb-1 transition-all ${
              activeView === 'desk'
                ? 'text-[#f0ede6] border-b-2 border-[#ff9a26] font-bold'
                : 'text-[#8a857d] hover:text-[#f0ede6]'
            }`}
          >
            Desk
          </button>
          <button
            onClick={() => setActiveView('corkboard')}
            className={`pb-1 transition-all ${
              activeView === 'corkboard'
                ? 'text-[#f0ede6] border-b-2 border-[#ff9a26] font-bold'
                : 'text-[#8a857d] hover:text-[#f0ede6]'
            }`}
          >
            Evidence
          </button>
          <button
            onClick={() => setActiveView('casefile')}
            className={`pb-1 transition-all ${
              activeView === 'casefile'
                ? 'text-[#f0ede6] border-b-2 border-[#ff9a26] font-bold'
                : 'text-[#8a857d] hover:text-[#f0ede6]'
            }`}
          >
            Case File
          </button>
          <button
            onClick={() => setActiveView('interrogation')}
            className={`pb-1 transition-all ${
              activeView === 'interrogation'
                ? 'text-[#f0ede6] border-b-2 border-[#ff9a26] font-bold'
                : 'text-[#8a857d] hover:text-[#f0ede6]'
            }`}
          >
            Interrogation
          </button>
          <button
            onClick={() => setActiveView('terminal')}
            className={`pb-1 transition-all ${
              activeView === 'terminal'
                ? 'text-[#f0ede6] border-b-2 border-[#ff9a26] font-bold'
                : 'text-[#8a857d] hover:text-[#f0ede6]'
            }`}
          >
            Terminal
          </button>
        </nav>

        {/* Right: Controls */}
        <div className="flex items-center space-x-3 text-[11px]">
          <button
            onClick={() => setHintVisible(!hintVisible)}
            className="px-2.5 py-1 border border-[#ff9a26]/70 rounded-sm text-[#ff9a26] hover:bg-[#ff9a26]/10 font-bold tracking-wider transition-colors"
          >
            HINT
          </button>
          <button
            onClick={toggleAudio}
            className="px-2.5 py-1 border border-[#33302b] rounded-sm text-[#8a857d] hover:text-[#f0ede6] hover:border-[#555048] tracking-wider transition-colors"
          >
            {muted ? 'SOUND OFF' : 'SOUND ON'}
          </button>
        </div>
      </header>

      {/* Hint Alert Popdown */}
      {hintVisible && (
        <div className="bg-[#2a1e12] border-b border-[#ff9a26]/40 px-6 py-2.5 text-xs text-[#fed7aa] flex items-center justify-between z-20">
          <span>
            💡 <strong>Lead Advisory:</strong> Subpoena DOT traffic cameras at Glendale & Park Ave
            via Terminal 04 to break Raymond Calderon's restaurant alibi.
          </span>
          <button
            onClick={() => setHintVisible(false)}
            className="text-[#f97316] hover:text-white ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-6 flex flex-col justify-between">
        {activeView === 'corkboard' && <EvidenceBoard />}
        {activeView === 'casefile' && <CaseFileViewer />}
        {activeView === 'interrogation' && <InterrogationRoom />}
        {activeView === 'terminal' && <TerminalView />}
        {activeView === 'canvass' && <LocationCanvass />}
        {activeView === 'indictment' && <IndictmentModal />}

        {/* DEFAULT VIEW: The Exact Layout from Image 1, 2 & 3 */}
        {activeView === 'desk' && (
          <div className="flex flex-col space-y-6">
            {/* ─────────────────────────────────────────────────────────────
                2. INCIDENT HEADER & ARRAIGNMENT STATS
            ───────────────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between">
              {/* Left Title */}
              <div>
                <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#d85040] block mb-1">
                  INCIDENT #{caseData.caseNumber} · OPEN
                </span>
                <h1 className="text-4xl lg:text-[46px] font-bold text-[#f0ede6] font-typewriter tracking-tight leading-none mb-2">
                  The Mercer File
                </h1>
                <p className="text-xs text-[#8a857d] font-sans leading-relaxed">
                  Julian Mercer, 41, real-estate broker. Pulled from Echo Park Lake at 06:10.
                  <br />
                  The 911 caller knew his name.
                </p>
              </div>

              {/* Right Stats & Digital Timer */}
              <div className="flex items-center space-x-8">
                {/* Evidence Count */}
                <div className="text-right">
                  <span className="text-[10px] tracking-[0.14em] text-[#8a857d] font-bold uppercase block">
                    EVIDENCE
                  </span>
                  <div className="text-lg font-typewriter tracking-wider">
                    <span className="text-[#f0ede6] font-bold">
                      {discoveredEvidenceIds.length}
                    </span>
                    <span className="text-[#555048]"> / 8</span>
                  </div>
                </div>

                {/* Subpoenas Count */}
                <div className="text-right">
                  <span className="text-[10px] tracking-[0.14em] text-[#8a857d] font-bold uppercase block">
                    SUBPOENAS
                  </span>
                  <div className="text-lg font-typewriter tracking-wider">
                    <span className="text-[#f0ede6] font-bold">
                      {discoveredEvidenceIds.includes('ev_cctv_calderon_car') ? '3' : '2'}
                    </span>
                    <span className="text-[#555048]"> / 3</span>
                  </div>
                </div>

                {/* Digital Arraignment Clock Box */}
                <div className="bg-[#12110f] border border-[#262420] rounded px-4 py-2 text-right shadow-md">
                  <span className="text-[9px] tracking-[0.18em] text-[#8a857d] font-bold uppercase block">
                    UNTIL ARRAIGNMENT
                  </span>
                  <span className="text-2xl font-bold font-digital tracking-wider text-[#ff9a26] leading-none block mt-0.5">
                    {formatClock(secondsRemaining)}
                  </span>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                3. MAIN CONTENT: CORKBOARD (LEFT) & SIDEBAR CARDS (RIGHT)
            ───────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* ── LEFT: THE CORKBOARD (Col 8) ── */}
              <div className="lg:col-span-8 bg-[#4c3321] cork-texture rounded border-[6px] border-[#2c1a11] shadow-2xl relative min-h-[420px] p-6 flex flex-col justify-between overflow-hidden">
                {/* SVG Yarn Strings connecting clues */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  <defs>
                    <filter id="corkStringShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.5" />
                    </filter>
                  </defs>

                  {/* String 1: Polaroid (approx 135px, 95px) to Exhibit A (approx 320px, 92px) */}
                  <line
                    x1="135"
                    y1="95"
                    x2="320"
                    y2="92"
                    stroke="#d85040"
                    strokeWidth="2"
                    strokeLinecap="round"
                    filter="url(#corkStringShadow)"
                  />

                  {/* String 2: Exhibit A (approx 320px, 92px) to Exhibit B (approx 515px, 115px) */}
                  <line
                    x1="320"
                    y1="92"
                    x2="515"
                    y2="115"
                    stroke="#d85040"
                    strokeWidth="2"
                    strokeLinecap="round"
                    filter="url(#corkStringShadow)"
                  />

                  {/* String 3: Exhibit A (approx 320px, 92px) to Exhibit C (approx 350px, 290px) */}
                  <line
                    x1="320"
                    y1="92"
                    x2="350"
                    y2="290"
                    stroke="#d85040"
                    strokeWidth="2"
                    strokeLinecap="round"
                    filter="url(#corkStringShadow)"
                  />
                </svg>

                {/* Top Row of Corkboard Clues */}
                <div className="relative z-20 flex items-start justify-between pt-2">
                  {/* Clue 1: Polaroid Photo (J. Mercer) */}
                  <div
                    onClick={() => handleClueClick('ev_coroner_prelim')}
                    className="w-32 bg-[#faf7f2] p-2 pb-3 rounded-sm shadow-md border border-[#e4ded5] transform -rotate-2 hover:rotate-0 transition-transform cursor-pointer relative"
                  >
                    {/* Red Pushpin */}
                    <div className="absolute -top-1.5 left-14 w-3.5 h-3.5 rounded-full bg-[#d85040] pin-shadow z-30" />
                    {/* Hatched Photo Placeholder */}
                    <div className="w-full h-24 hatched-placeholder border border-[#d6cfc2] flex items-center justify-center">
                      <span className="text-[10px] text-[#8c8273] font-mono">victim photo</span>
                    </div>
                    <span className="block text-center text-[11px] font-typewriter text-[#22211f] mt-2 font-bold">
                      J. Mercer
                    </span>
                  </div>

                  {/* Clue 2: Exhibit A (Lined Paper - 911 Dispatch) */}
                  <div
                    onClick={() => handleClueClick('ev_dispatch')}
                    className="w-48 lined-paper p-3 rounded-sm shadow-md border border-[#e4ded5] transform rotate-1 hover:rotate-0 transition-transform cursor-pointer relative"
                  >
                    {/* Red Pushpin */}
                    <div className="absolute -top-1.5 left-20 w-3.5 h-3.5 rounded-full bg-[#d85040] pin-shadow z-30" />
                    <span className="text-[9px] font-bold text-[#d85040] tracking-widest uppercase block mb-1">
                      EXHIBIT A
                    </span>
                    <h4 className="text-xs font-bold text-[#22211f] leading-snug font-typewriter">
                      911 Dispatch Audio &amp; CAD Log
                    </h4>
                    <span className="text-[10px] text-[#6b655b] block mt-1 font-mono">
                      Call logged 23:42
                    </span>
                  </div>

                  {/* Clue 3: Exhibit B (Medical Examiner) */}
                  <div
                    onClick={() => handleClueClick('ev_coroner_prelim')}
                    className="w-48 bg-[#faf7f2] p-3 rounded-sm shadow-md border border-[#e4ded5] transform -rotate-1 hover:rotate-0 transition-transform cursor-pointer relative"
                  >
                    {/* Red Pushpin */}
                    <div className="absolute -top-1.5 left-4 w-3.5 h-3.5 rounded-full bg-[#d85040] pin-shadow z-30" />
                    <span className="text-[9px] font-bold text-[#d85040] tracking-widest uppercase block mb-1">
                      EXHIBIT B
                    </span>
                    <h4 className="text-xs font-bold text-[#22211f] leading-snug font-typewriter">
                      Medical Examiner – Preliminary
                    </h4>
                    <span className="text-[10px] text-[#6b655b] block mt-1 font-mono">
                      TOD 21:30–22:15
                    </span>
                  </div>
                </div>

                {/* Bottom Row of Corkboard Clues */}
                <div className="relative z-20 flex items-end justify-between mt-8">
                  {/* Clue 4: Yellow Sticky Note */}
                  <div
                    onClick={() => handleClueClick('ev_dispatch')}
                    className="w-36 bg-[#fef08a] text-[#713f12] p-3 rounded-sm shadow-sm border border-[#fde047] transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer"
                  >
                    <p className="text-[11px] font-typewriter leading-tight">
                      Who called 911 — and from where?
                    </p>
                  </div>

                  {/* Clue 5: Exhibit C (Encrypted Phone) */}
                  <div
                    onClick={() => handleClueClick('ev_victim_phone')}
                    className="w-48 bg-[#faf7f2] p-3 rounded-sm shadow-md border border-[#e4ded5] transform rotate-1 hover:rotate-0 transition-transform cursor-pointer relative"
                  >
                    {/* Red Pushpin */}
                    <div className="absolute -top-1.5 left-20 w-3.5 h-3.5 rounded-full bg-[#d85040] pin-shadow z-30" />
                    <span className="text-[9px] font-bold text-[#d85040] tracking-widest uppercase block mb-1">
                      EXHIBIT C
                    </span>
                    <h4 className="text-xs font-bold text-[#22211f] leading-snug font-typewriter">
                      Victim's Encrypted Phone
                    </h4>
                    <span className="text-[10px] text-[#6b655b] block mt-1 font-mono">
                      Locked · 3 missed calls
                    </span>
                  </div>

                  {/* Clue 6: Dashed placeholder (5 MORE TO FIND) */}
                  <div className="w-36 h-20 border border-dashed border-[#a37d57]/60 rounded-sm flex items-center justify-center p-2 text-center">
                    <span className="text-[10px] tracking-widest text-[#caa87e]/80 uppercase font-bold">
                      5 MORE TO FIND
                    </span>
                  </div>
                </div>

                {/* Bottom-left Pill Button */}
                <div className="relative z-20 mt-4">
                  <button
                    onClick={() => setActiveView('corkboard')}
                    className="bg-[#1a1715]/90 border border-[#3d3732] px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-[#d5cec5] hover:text-white hover:border-[#665e56] transition-colors"
                  >
                    CLICK A CLUE TO EXAMINE
                  </button>
                </div>
              </div>

              {/* ── RIGHT COLUMN: PERSONS OF INTEREST + TERMINAL 04 (Col 4) ── */}
              <div className="lg:col-span-4 flex flex-col space-y-5">
                {/* ── CARD 1: PERSONS OF INTEREST ── */}
                <div className="bg-[#f4efe4] text-[#22211f] rounded border border-[#dfd7c8] shadow-lg p-5">
                  <div className="flex items-center justify-between border-b border-[#e2d9c8] pb-2 mb-3">
                    <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#6b6357]">
                      PERSONS OF INTEREST
                    </span>
                    <span className="text-xs font-bold text-[#6b6357]">3</span>
                  </div>

                  <div className="space-y-4">
                    {/* Suspect 1: Raymond Calderon */}
                    <div
                      onClick={() => handleSuspectClick('char_suspect_calderon')}
                      className="cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3">
                        {/* Hatched Mugshot */}
                        <div className="w-10 h-10 rounded-sm hatched-placeholder border border-[#d2c9b8] flex items-center justify-center flex-shrink-0">
                          <span className="text-[8px] text-[#7a7266] font-mono">mugshot</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold font-typewriter group-hover:text-[#b91c1c] transition-colors">
                              Raymond Calderon
                            </h4>
                            <span className="text-[10px] font-bold text-[#d85040] uppercase">
                              HIGH
                            </span>
                          </div>
                          <span className="text-[11px] text-[#6b6357] block truncate">
                            Business partner · "R.C."
                          </span>
                          {/* Progress Bar (Red) */}
                          <div className="w-full bg-[#ded6c5] h-1 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-[#d85040] h-full w-[78%]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Suspect 2: Elena Cruz */}
                    <div
                      onClick={() => handleSuspectClick('char_suspect_elena')}
                      className="cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-sm hatched-placeholder border border-[#d2c9b8] flex items-center justify-center flex-shrink-0">
                          <span className="text-[8px] text-[#7a7266] font-mono">mugshot</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold font-typewriter group-hover:text-[#d97706] transition-colors">
                              Elena Cruz
                            </h4>
                            <span className="text-[10px] font-bold text-[#d97706] uppercase">
                              MED
                            </span>
                          </div>
                          <span className="text-[11px] text-[#6b6357] block truncate">
                            Estranged wife
                          </span>
                          {/* Progress Bar (Amber/Orange) */}
                          <div className="w-full bg-[#ded6c5] h-1 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-[#d97706] h-full w-[46%]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Suspect 3: Tyler Vance */}
                    <div
                      onClick={() => handleSuspectClick('char_suspect_tyler')}
                      className="cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-sm hatched-placeholder border border-[#d2c9b8] flex items-center justify-center flex-shrink-0">
                          <span className="text-[8px] text-[#7a7266] font-mono">mugshot</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold font-typewriter group-hover:text-[#4b5563] transition-colors">
                              Tyler Vance
                            </h4>
                            <span className="text-[10px] font-bold text-[#8a857d] uppercase">
                              LOW
                            </span>
                          </div>
                          <span className="text-[11px] text-[#6b6357] block truncate">
                            Boathouse attendant
                          </span>
                          {/* Progress Bar (Grey) */}
                          <div className="w-full bg-[#ded6c5] h-1 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-[#8a857d] h-full w-[22%]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── CARD 2: TERMINAL 04 ── */}
                <div className="bg-[#081009] border border-[#14381b] rounded shadow-lg p-5 flex flex-col justify-between font-mono text-xs">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#14381b] pb-2 mb-3">
                      <span className="text-[#34d399] font-bold tracking-wider">
                        &gt;_ TERMINAL 04
                      </span>
                      <span className="text-[#10b981] text-[10px] tracking-widest font-bold">
                        LINKED
                      </span>
                    </div>

                    {/* Status rows */}
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[#4ade80]">DEPT OF TRANSPORTATION</span>
                        <span className="text-[#ff9a26] font-bold">ONLINE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#4ade80]">CSLI CELL-SITE</span>
                        <span className="text-[#ff9a26] font-bold">READY</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#4ade80]">AFIS / BALLISTICS</span>
                        <span className="text-[#ff9a26] font-bold">ACTIVE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#4ade80]">SUBPOENAS</span>
                        <span className="text-[#ff9a26] font-bold">3 AVAIL</span>
                      </div>
                    </div>

                    <div className="mt-3 text-[#4ade80] text-[11px] flex items-center space-x-1">
                      <span>&gt; awaiting request</span>
                      <span className="w-1.5 h-3 bg-[#4ade80] animate-pulse inline-block" />
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => setActiveView('terminal')}
                    className="w-full mt-4 py-2 bg-[#0e1d11] hover:bg-[#142818] border border-[#1e4626] rounded text-[#4ade80] text-[11px] font-bold tracking-wider uppercase transition-colors"
                  >
                    REQUEST SUBPOENA / LAB →
                  </button>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                4. BOTTOM ROW: FOUR TABBED DOSSIER CARDS (IMAGE 3)
            ───────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-3">
              {/* Card 01: Case Binder */}
              <div
                onClick={() => setActiveView('casefile')}
                className="relative bg-[#dfc596] text-[#2d2417] p-5 pt-6 rounded border border-[#c4a670] folder-shadow cursor-pointer group hover:-translate-y-1 transition-transform"
              >
                {/* Tab */}
                <div className="absolute -top-3 left-4 bg-[#dfc596] border-t border-l border-r border-[#c4a670] px-3 py-0.5 rounded-t text-[9px] font-bold tracking-widest text-[#5c4a31] uppercase">
                  01 · FILE
                </div>
                {/* Stamp */}
                <div className="stamp-confidential text-[9px] absolute top-4 right-4">
                  CONFIDENTIAL
                </div>
                <h3 className="text-base font-bold font-typewriter text-[#221c13]">Case Binder</h3>
                <p className="text-[11px] text-[#5c4a31] font-sans mt-1 leading-snug">
                  Autopsy, scene photos and the evidence locker.
                </p>
                <span className="block mt-4 text-[10px] font-bold tracking-wider text-[#221c13] uppercase group-hover:underline">
                  INSPECT DOSSIER →
                </span>
              </div>

              {/* Card 02: Interrogate */}
              <div
                onClick={() => setActiveView('interrogation')}
                className="relative bg-[#dfc596] text-[#2d2417] p-5 pt-6 rounded border border-[#c4a670] folder-shadow cursor-pointer group hover:-translate-y-1 transition-transform"
              >
                {/* Tab */}
                <div className="absolute -top-3 left-4 bg-[#dfc596] border-t border-l border-r border-[#c4a670] px-3 py-0.5 rounded-t text-[9px] font-bold tracking-widest text-[#5c4a31] uppercase">
                  02 · ROOM B
                </div>
                <h3 className="text-base font-bold font-typewriter text-[#221c13]">Interrogate</h3>
                <p className="text-[11px] text-[#5c4a31] font-sans mt-1 leading-snug">
                  Put your evidence in front of Calderon, Cruz and Vance.
                </p>
                <span className="block mt-4 text-[10px] font-bold tracking-wider text-[#221c13] uppercase group-hover:underline">
                  ENTER ROOM →
                </span>
              </div>

              {/* Card 03: Canvass Scenes */}
              <div
                onClick={() => setActiveView('canvass')}
                className="relative bg-[#dfc596] text-[#2d2417] p-5 pt-6 rounded border border-[#c4a670] folder-shadow cursor-pointer group hover:-translate-y-1 transition-transform"
              >
                {/* Tab */}
                <div className="absolute -top-3 left-4 bg-[#dfc596] border-t border-l border-r border-[#c4a670] px-3 py-0.5 rounded-t text-[9px] font-bold tracking-widest text-[#5c4a31] uppercase">
                  03 · FIELD
                </div>
                <h3 className="text-base font-bold font-typewriter text-[#221c13]">Canvass Scenes</h3>
                <p className="text-[11px] text-[#5c4a31] font-sans mt-1 leading-snug">
                  Echo Park boathouse, Arts District loft, Silver Lake escrow office.
                </p>
                <span className="block mt-4 text-[10px] font-bold tracking-wider text-[#221c13] uppercase group-hover:underline">
                  DISPATCH TEAM →
                </span>
              </div>

              {/* Card 04: File Charges (Deep Red) */}
              <div
                onClick={() => setActiveView('indictment')}
                className="relative bg-[#7a1d1d] text-[#fee2e2] p-5 pt-6 rounded border border-[#631515] folder-shadow cursor-pointer group hover:-translate-y-1 transition-transform"
              >
                {/* Tab */}
                <div className="absolute -top-3 left-4 bg-[#7a1d1d] border-t border-l border-r border-[#631515] px-3 py-0.5 rounded-t text-[9px] font-bold tracking-widest text-[#fecaca] uppercase">
                  04 · D.A.
                </div>
                <h3 className="text-base font-bold font-typewriter text-white">File Charges</h3>
                <p className="text-[11px] text-[#fca5a5] font-sans mt-1 leading-snug">
                  Prove all three to secure a first-degree conviction.
                </p>
                <div className="flex items-center space-x-1.5 mt-3">
                  <span className="px-1.5 py-0.5 rounded border border-[#ef4444]/60 text-[9px] font-bold font-mono">
                    MOTIVE
                  </span>
                  <span className="px-1.5 py-0.5 rounded border border-[#ef4444]/60 text-[9px] font-bold font-mono">
                    OPPORTUNITY
                  </span>
                  <span className="px-1.5 py-0.5 rounded border border-[#ef4444]/60 text-[9px] font-bold font-mono">
                    MEANS
                  </span>
                </div>
                <span className="block mt-3 text-[10px] font-bold tracking-wider text-[#fecaca] uppercase">
                  0 / 3 PROVEN
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────
          5. MODAL: EXAMINE CLUE DETAIL (WHEN CLICKED ON CORKBOARD)
      ───────────────────────────────────────────────────────────── */}
      {inspectedClueId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#faf7f2] text-[#22211f] border border-[#d6cfc2] rounded-md max-w-lg w-full p-6 space-y-4 shadow-2xl relative font-mono">
            {/* Red Pushpin */}
            <div className="w-4 h-4 rounded-full bg-[#d85040] pin-shadow mx-auto -mt-8 mb-2" />

            <div className="flex items-center justify-between border-b border-[#d6cfc2] pb-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#d85040]">
                {caseData.evidence[inspectedClueId]?.category}
              </span>
              <button
                onClick={() => setInspectedClueId(null)}
                className="text-[#6b655b] hover:text-[#22211f] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <h3 className="text-base font-bold font-typewriter text-[#22211f]">
              {caseData.evidence[inspectedClueId]?.title}
            </h3>

            <p className="text-xs text-[#443e38] font-sans leading-relaxed">
              {caseData.evidence[inspectedClueId]?.description}
            </p>

            <div className="pt-3 border-t border-[#d6cfc2] flex items-center justify-between">
              <button
                onClick={() => {
                  setInspectedClueId(null);
                  setActiveView('casefile');
                }}
                className="text-[11px] font-bold text-[#b91c1c] uppercase hover:underline"
              >
                View in Full Dossier →
              </button>
              <button
                onClick={() => setInspectedClueId(null)}
                className="px-3 py-1 bg-[#22211f] text-white text-xs rounded hover:bg-[#3d3732]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
