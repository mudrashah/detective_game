import React from 'react';
import { useGameStore } from '../store/gameStore';
import {
  FileText,
  Pin,
  Terminal,
  UserCheck,
  MapPin,
  Gavel,
  Lightbulb,
  Volume2,
  VolumeX,
  Clock
} from 'lucide-react';
import { EvidenceBoard } from './EvidenceBoard';
import { CaseFileViewer } from './CaseFileViewer';
import { InterrogationRoom } from './InterrogationRoom';
import { TerminalView } from './TerminalView';
import { LocationCanvass } from './LocationCanvass';
import { IndictmentModal } from './IndictmentModal';

export const DeskShell: React.FC = () => {
  const {
    caseData,
    activeView,
    setActiveView,
    lampOn,
    toggleLamp,
    muted,
    toggleAudio,
    hoursRemaining,
    discoveredEvidenceIds,
    boardPins,
    boardStrings
  } = useGameStore();

  return (
    <div className="relative w-screen h-screen bg-noir-950 text-neutral-100 flex flex-col overflow-hidden font-mono select-none">
      {/* Global Ambient Lighting from Lamp */}
      {lampOn && (
        <div className="absolute top-0 right-1/4 w-[750px] h-[550px] rounded-full pointer-events-none bg-amber-500/10 blur-[130px] z-10 transition-opacity duration-700" />
      )}

      {/* Top Permanent Desk Navigation Bar */}
      <header className="z-40 h-14 bg-noir-950/95 backdrop-blur border-b border-noir-800 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <h1 className="text-xs font-bold tracking-widest uppercase text-amber-500">
              METRO HOMICIDE DIVISION — LOS ANGELES
            </h1>
          </div>
          <span className="text-xs text-neutral-500 border-l border-neutral-800 pl-4">
            INCIDENT #{caseData.caseNumber}
          </span>
        </div>

        {/* Center Clock: 48-Hour Arraignment Timer */}
        <div className="flex items-center space-x-2 bg-noir-900 border border-neutral-800 px-3.5 py-1 rounded text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-neutral-400 font-sans">ARRAIGNMENT CLOCK:</span>
          <span className="font-bold text-amber-400">{hoursRemaining}:00 HOURS REMAINING</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Quick Desk Items Bar */}
          <nav className="hidden lg:flex items-center space-x-1 mr-4">
            <button
              onClick={() => setActiveView('desk')}
              className={`px-3 py-1 rounded transition-colors ${
                activeView === 'desk'
                  ? 'bg-amber-500 text-noir-950 font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-noir-900'
              }`}
            >
              Desk View
            </button>
            <button
              onClick={() => setActiveView('corkboard')}
              className={`px-3 py-1 rounded transition-colors ${
                activeView === 'corkboard'
                  ? 'bg-amber-500 text-noir-950 font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-noir-900'
              }`}
            >
              Evidence Board ({boardPins.length})
            </button>
            <button
              onClick={() => setActiveView('casefile')}
              className={`px-3 py-1 rounded transition-colors ${
                activeView === 'casefile'
                  ? 'bg-amber-500 text-noir-950 font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-noir-900'
              }`}
            >
              Case File
            </button>
            <button
              onClick={() => setActiveView('interrogation')}
              className={`px-3 py-1 rounded transition-colors ${
                activeView === 'interrogation'
                  ? 'bg-amber-500 text-noir-950 font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-noir-900'
              }`}
            >
              Interrogation
            </button>
            <button
              onClick={() => setActiveView('terminal')}
              className={`px-3 py-1 rounded transition-colors ${
                activeView === 'terminal'
                  ? 'bg-amber-500 text-noir-950 font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-noir-900'
              }`}
            >
              CAD Terminal
            </button>
          </nav>

          {/* Lamp Toggle */}
          <button
            onClick={toggleLamp}
            title={lampOn ? 'Turn off desk lamp' : 'Turn on desk lamp'}
            className={`p-2 rounded border transition-colors ${
              lampOn
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-noir-900 border-neutral-800 text-neutral-500'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
          </button>

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            title={muted ? 'Unmute tactical audio' : 'Mute tactical audio'}
            className={`p-2 rounded border transition-colors ${
              !muted
                ? 'bg-noir-850 border-neutral-700 text-neutral-300'
                : 'bg-noir-900 border-neutral-800 text-neutral-600'
            }`}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="relative flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {activeView === 'corkboard' && <EvidenceBoard />}
        {activeView === 'casefile' && <CaseFileViewer />}
        {activeView === 'interrogation' && <InterrogationRoom />}
        {activeView === 'terminal' && <TerminalView />}
        {activeView === 'canvass' && <LocationCanvass />}
        {activeView === 'indictment' && <IndictmentModal />}

        {/* Default: Tactile Desk Workstation Layout */}
        {activeView === 'desk' && (
          <div className="relative w-full h-full wood-desk-bg p-8 flex flex-col justify-between overflow-y-auto">
            {/* Top Row: Corkboard Preview on Wall & Lamp */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start max-w-7xl mx-auto w-full">
              {/* Interactive Corkboard Card (Wall preview) */}
              <div
                onClick={() => setActiveView('corkboard')}
                className="md:col-span-8 h-64 corkboard-bg rounded-lg border-4 border-amber-950 shadow-2xl p-4 relative cursor-pointer group transition-transform hover:scale-[1.01]"
              >
                <div className="absolute top-2 left-3 flex items-center space-x-2 text-[10px] font-bold text-amber-300 tracking-wider uppercase bg-black/60 px-2 py-0.5 rounded">
                  <Pin className="w-3 h-3 text-red-500" />
                  <span>TACTILE EVIDENCE CORKBOARD (CLICK TO ZOOM)</span>
                </div>

                {/* Preview Mini Pins & Strings */}
                <div className="h-full flex items-center justify-around pt-6">
                  {boardPins.slice(0, 3).map((pin) => (
                    <div
                      key={pin.id}
                      className="w-44 bg-dossier-card p-2 rounded shadow-md border border-dossier-border text-dossier-ink text-[10px] transform -rotate-1 group-hover:rotate-0 transition-transform"
                    >
                      <div className="w-3 h-3 rounded-full bg-red-600 mx-auto -mt-3.5 mb-1 shadow" />
                      <strong className="block truncate text-neutral-900">
                        {caseData.evidence[pin.clueId]?.title}
                      </strong>
                      <span className="text-neutral-500 block truncate text-[9px]">
                        {caseData.evidence[pin.clueId]?.category}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-2 right-3 text-[10px] text-amber-200/80 bg-noir-950/80 px-2.5 py-1 rounded">
                  {boardPins.length} pinned clues | {boardStrings.length} yarn connections
                </div>
              </div>

              {/* MDT CAD Terminal Monitor */}
              <div
                onClick={() => setActiveView('terminal')}
                className="md:col-span-4 h-64 bg-noir-900 rounded-lg border-4 border-neutral-800 shadow-2xl p-4 flex flex-col justify-between cursor-pointer group hover:border-crt-green/50 transition-colors relative crt-scanlines"
              >
                <div className="flex items-center justify-between text-xs text-crt-green border-b border-crt-green/20 pb-2">
                  <span className="font-bold flex items-center space-x-1.5">
                    <Terminal className="w-4 h-4" />
                    <span>MHD TERMINAL 04</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-crt-green animate-pulse" />
                </div>

                <div className="text-[11px] text-crt-green/80 font-mono space-y-1.5 py-2">
                  <p className="text-white font-bold">&gt; DEPT OF TRANSPORTATION: ONLINE</p>
                  <p>&gt; CSLI CELL SITE LOCATION: READY</p>
                  <p>&gt; AFIS BALLISTICS CRIME LAB: ACTIVE</p>
                  <p className="text-amber-400">&gt; SUBPOENAS PENDING: 3 AVAILABLE</p>
                </div>

                <div className="pt-2 border-t border-crt-green/20 text-center">
                  <span className="text-[10px] text-crt-green uppercase font-bold tracking-wider group-hover:underline">
                    Access Subpoenas & Lab &rarr;
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Physical Desk Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full pt-6">
              {/* Item 1: Physical Manila Case Folder */}
              <div
                onClick={() => setActiveView('casefile')}
                className="bg-dossier-bg text-neutral-900 p-5 rounded-md border-2 border-dossier-border shadow-paper cursor-pointer group hover:-translate-y-1 transition-transform relative"
              >
                <div className="stamp-classified text-[10px] py-0.5 px-2 absolute top-3 right-3">
                  CONFIDENTIAL
                </div>
                <div className="flex items-center space-x-2 text-amber-900 mb-2">
                  <FileText className="w-5 h-5 text-amber-800" />
                  <span className="text-xs font-bold uppercase tracking-wider">OFFICIAL CASE BINDER</span>
                </div>
                <h3 className="text-sm font-bold text-neutral-900 mt-2">
                  Case #{caseData.caseNumber}
                </h3>
                <p className="text-xs text-neutral-700 font-sans mt-1 line-clamp-2">
                  Julian Mercer Homicide: Coroner Autopsy & Evidence Locker.
                </p>
                <span className="block mt-4 text-[10px] text-amber-950 font-bold uppercase group-hover:underline">
                  Inspect Dossier ({discoveredEvidenceIds.length} Clues) &rarr;
                </span>
              </div>

              {/* Item 2: Interrogation Suite Door */}
              <div
                onClick={() => setActiveView('interrogation')}
                className="bg-noir-900 text-neutral-100 p-5 rounded-md border-2 border-neutral-800 shadow-2xl cursor-pointer group hover:-translate-y-1 transition-transform hover:border-amber-600/50"
              >
                <div className="flex items-center space-x-2 text-amber-500 mb-2">
                  <UserCheck className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    INTERROGATION ROOM B
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-2">Question Suspects</h3>
                <p className="text-xs text-neutral-400 font-sans mt-1">
                  Menu-based interrogation. Confront Raymond Calderon, Elena Cruz, and Tyler Vance.
                </p>
                <span className="block mt-4 text-[10px] text-amber-400 font-bold uppercase group-hover:underline">
                  Enter Interrogation &rarr;
                </span>
              </div>

              {/* Item 3: Police Cruiser Radio / Scene Canvassing */}
              <div
                onClick={() => setActiveView('canvass')}
                className="bg-noir-900 text-neutral-100 p-5 rounded-md border-2 border-neutral-800 shadow-2xl cursor-pointer group hover:-translate-y-1 transition-transform hover:border-blue-600/50"
              >
                <div className="flex items-center space-x-2 text-blue-400 mb-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    LA CANVASSING & SCENES
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-2">Travel & Search</h3>
                <p className="text-xs text-neutral-400 font-sans mt-1">
                  Echo Park boathouse, Downtown Arts District loft, Silver Lake escrow office.
                </p>
                <span className="block mt-4 text-[10px] text-blue-400 font-bold uppercase group-hover:underline">
                  Dispatch Canvass Team &rarr;
                </span>
              </div>

              {/* Item 4: District Attorney Indictment Folder */}
              <div
                onClick={() => setActiveView('indictment')}
                className="bg-red-950/70 text-red-100 p-5 rounded-md border-2 border-red-700 shadow-2xl cursor-pointer group hover:-translate-y-1 transition-transform hover:border-red-500"
              >
                <div className="flex items-center space-x-2 text-red-400 mb-2">
                  <Gavel className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    DISTRICT ATTORNEY INDICTMENT
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-2">Arraign Suspect</h3>
                <p className="text-xs text-red-300 font-sans mt-1">
                  Submit proof of Motive, Opportunity, and Means to secure a 1st-degree conviction.
                </p>
                <span className="block mt-4 text-[10px] text-red-400 font-bold uppercase group-hover:underline">
                  File Formal Charges &rarr;
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
