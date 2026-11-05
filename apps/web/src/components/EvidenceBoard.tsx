import React, { useState, useRef } from 'react';
import { useGameStore, BoardPin } from '../store/gameStore';
import { Pin, X, Link as LinkIcon, Plus } from 'lucide-react';

export const EvidenceBoard: React.FC = () => {
  const {
    caseData,
    boardPins,
    boardStrings,
    connectingPinId,
    discoveredEvidenceIds,
    addPinToBoard,
    updatePinPosition,
    removePin,
    startStringConnection,
    completeStringConnection,
    cancelStringConnection,
    removeString,
    setActiveView
  } = useGameStore();

  const boardRef = useRef<HTMLDivElement>(null);
  const [draggingPinId, setDraggingPinId] = useState<string | null>(null);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Discovered evidence not yet pinned to the board
  const unpinnedClues = discoveredEvidenceIds.filter(
    (id) => !boardPins.some((p) => p.clueId === id)
  );

  const handleMouseDown = (e: React.MouseEvent, pin: BoardPin) => {
    e.stopPropagation();
    if (connectingPinId) {
      completeStringConnection(pin.id);
      return;
    }

    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const pinPxX = (pin.x / 100) * rect.width;
    const pinPxY = (pin.y / 100) * rect.height;

    setDraggingPinId(pin.id);
    setSelectedPinId(pin.id);
    setDragOffset({
      x: e.clientX - (rect.left + pinPxX),
      y: e.clientY - (rect.top + pinPxY)
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingPinId || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left - dragOffset.x;
    const rawY = e.clientY - rect.top - dragOffset.y;

    const pctX = Math.max(5, Math.min(95, (rawX / rect.width) * 100));
    const pctY = Math.max(5, Math.min(90, (rawY / rect.height) * 100));

    updatePinPosition(draggingPinId, pctX, pctY);
  };

  const handleMouseUp = () => {
    setDraggingPinId(null);
  };

  const getPinCenter = (pinId: string): { x: number; y: number } | null => {
    const pin = boardPins.find((p) => p.id === pinId);
    if (!pin) return null;
    return { x: pin.x, y: pin.y };
  };

  return (
    <div
      className="relative w-full h-full flex flex-col corkboard-bg select-none overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={() => {
        if (connectingPinId) cancelStringConnection();
      }}
    >
      {/* Board Top Toolbar */}
      <div className="z-30 flex items-center justify-between px-6 py-3 bg-noir-950/85 backdrop-blur border-b border-noir-800 text-neutral-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
            <h2 className="text-sm font-bold tracking-widest uppercase text-amber-500">
              TACTILE EVIDENCE CORKBOARD — CASE #{caseData.caseNumber}
            </h2>
          </div>
          <span className="text-xs text-neutral-400 border-l border-neutral-700 pl-4">
            {boardPins.length} Pinned Leads | {boardStrings.length} Red String Connections
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {connectingPinId ? (
            <div className="flex items-center space-x-2 bg-red-950/80 border border-red-500 px-3 py-1 rounded text-xs text-red-200 animate-pulse">
              <LinkIcon className="w-3.5 h-3.5 text-red-400" />
              <span>Click target lead to pin red yarn string</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  cancelStringConnection();
                }}
                className="ml-2 underline text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <span className="text-xs text-neutral-400 hidden sm:inline">
              Drag cards to organize | Click "Connect Yarn" to link clues
            </span>
          )}

          <button
            onClick={() => setActiveView('desk')}
            className="px-3 py-1.5 bg-noir-800 hover:bg-noir-700 text-xs font-semibold rounded border border-neutral-700 text-neutral-300 transition-colors"
          >
            Return to Desk
          </button>
        </div>
      </div>

      {/* Main Corkboard Surface */}
      <div
        ref={boardRef}
        className="relative flex-1 w-full h-full overflow-hidden p-8 cursor-crosshair"
      >
        {/* SVG Layer for Red Yarn Strings */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <filter id="stringShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>
          {boardStrings.map((str) => {
            const start = getPinCenter(str.fromPinId);
            const end = getPinCenter(str.toPinId);
            if (!start || !end) return null;

            // Generate slight parabolic dip for hanging yarn gravity
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2 + 3.5; // Natural sag

            return (
              <g key={str.id} className="pointer-events-auto group cursor-pointer">
                {/* Invisible thicker hit area for clicking */}
                <path
                  d={`M ${start.x}% ${start.y}% Q ${midX}% ${midY}% ${end.x}% ${end.y}%`}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="14"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Cut this string connection?')) {
                      removeString(str.id);
                    }
                  }}
                />
                {/* Visual wool yarn string */}
                <path
                  d={`M ${start.x}% ${start.y}% Q ${midX}% ${midY}% ${end.x}% ${end.y}%`}
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#stringShadow)"
                  className="transition-all group-hover:stroke-amber-400 group-hover:stroke-[3.5]"
                />
              </g>
            );
          })}
        </svg>

        {/* Pinned Clue Cards */}
        {boardPins.map((pin) => {
          const clue = caseData.evidence[pin.clueId];
          if (!clue) return null;

          const isConnectingSource = connectingPinId === pin.id;
          const isSelected = selectedPinId === pin.id;

          return (
            <div
              key={pin.id}
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                transform: `translate(-50%, -15px) rotate(${pin.rotation}deg)`
              }}
              onMouseDown={(e) => handleMouseDown(e, pin)}
              onClick={(e) => e.stopPropagation()}
              className={`absolute z-20 w-64 p-3 rounded bg-dossier-card text-dossier-ink border border-dossier-border shadow-paper transition-shadow cursor-grab active:cursor-grabbing ${
                isConnectingSource
                  ? 'ring-4 ring-red-500 shadow-2xl'
                  : isSelected
                    ? 'ring-2 ring-amber-500'
                    : 'hover:shadow-2xl'
              }`}
            >
              {/* Pushpin Head */}
              <div
                className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-pin transition-transform ${
                  isConnectingSource ? 'bg-amber-400 scale-125' : 'bg-red-700 hover:scale-110'
                }`}
                title="Pushpin Anchor"
              >
                <div className="w-2 h-2 rounded-full bg-white/60" />
              </div>

              {/* Card Header & Category Badge */}
              <div className="flex items-start justify-between mt-1 mb-1.5 border-b border-dossier-border pb-1">
                <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-800">
                  {clue.category.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startStringConnection(pin.id);
                    }}
                    title="Connect Yarn String"
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-700"
                  >
                    <LinkIcon className="w-3 h-3 text-red-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePin(pin.id);
                    }}
                    title="Unpin Card"
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <h4 className="text-xs font-bold leading-tight text-neutral-900 mb-1">
                {clue.title}
              </h4>
              <p className="text-[11px] leading-snug text-neutral-700 font-sans line-clamp-3">
                {clue.description}
              </p>

              {/* Pillar Indicators */}
              <div className="mt-2 pt-1 border-t border-dashed border-dossier-border flex flex-wrap gap-1 text-[9px] font-mono">
                {clue.provesMotiveFor && (
                  <span className="px-1 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                    MOTIVE
                  </span>
                )}
                {(clue.provesOpportunityFor || clue.disprovesAlibiFor) && (
                  <span className="px-1 py-0.2 rounded bg-blue-100 text-blue-900 font-bold border border-blue-300">
                    OPPORTUNITY
                  </span>
                )}
                {clue.provesMeansFor && (
                  <span className="px-1 py-0.2 rounded bg-rose-100 text-rose-900 font-bold border border-rose-300">
                    MEANS/FORENSICS
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Tray for Unpinned Discovered Evidence */}
      {unpinnedClues.length > 0 && (
        <div className="z-30 bg-noir-950/90 border-t border-noir-800 p-3 px-6 flex items-center space-x-4 overflow-x-auto">
          <span className="text-xs font-bold uppercase text-amber-400 whitespace-nowrap flex items-center space-x-1">
            <Plus className="w-3.5 h-3.5" />
            <span>Unpinned Clues Tray ({unpinnedClues.length}):</span>
          </span>
          <div className="flex items-center space-x-3 overflow-x-auto py-1">
            {unpinnedClues.map((clueId) => {
              const clue = caseData.evidence[clueId];
              if (!clue) return null;
              return (
                <button
                  key={clueId}
                  onClick={() => addPinToBoard(clueId)}
                  className="flex-shrink-0 flex items-center space-x-2 px-3 py-1.5 rounded bg-noir-850 hover:bg-noir-750 border border-neutral-700 text-xs text-neutral-200 transition-colors"
                >
                  <Pin className="w-3 h-3 text-red-500" />
                  <span className="truncate max-w-[200px]">{clue.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
