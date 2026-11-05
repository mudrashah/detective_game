import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { MapPin, ArrowLeft, Search, CheckCircle, Clock } from 'lucide-react';

export const LocationCanvass: React.FC = () => {
  const {
    caseData,
    unlockedLocationIds,
    visitedLocationIds,
    searchLocation,
    hoursRemaining,
    setActiveView
  } = useGameStore();

  const [activeLocationId, setActiveLocationId] = useState<string>(unlockedLocationIds[0]);
  const [searchOutput, setSearchOutput] = useState<{
    evidence: string[];
    characters: string[];
  } | null>(null);

  const currentLocation = caseData.locations[activeLocationId];

  const handleCanvass = (locId: string) => {
    searchLocation(locId);
    const loc = caseData.locations[locId];
    if (loc) {
      setSearchOutput({
        evidence: loc.searchClueIds,
        characters: loc.residentCharacterIds
      });
    }
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
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>CRIME SCENE & LOCATION CANVASSING — LOS ANGELES COUNTY</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs text-amber-400 bg-noir-850 px-3 py-1 rounded border border-noir-700">
          <Clock className="w-3.5 h-3.5" />
          <span>Clock: {hoursRemaining} Hours Until Arraignment Deadline</span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Location List */}
        <div className="w-96 bg-noir-900 border-r border-noir-800 p-6 flex flex-col space-y-3 overflow-y-auto">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Discovered Locations ({unlockedLocationIds.length}):
          </h3>

          {unlockedLocationIds.map((locId) => {
            const loc = caseData.locations[locId];
            if (!loc) return null;

            const isSelected = activeLocationId === locId;
            const isVisited = visitedLocationIds.includes(locId);

            return (
              <button
                key={locId}
                onClick={() => {
                  setActiveLocationId(locId);
                  setSearchOutput(null);
                }}
                className={`text-left p-4 rounded-lg border transition-all text-xs ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg'
                    : isVisited
                      ? 'bg-noir-850 border-neutral-800 text-neutral-300 hover:border-neutral-600'
                      : 'bg-noir-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white">{loc.name}</span>
                  {isVisited ? (
                    <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-bold">
                      <CheckCircle className="w-3 h-3" />
                      <span>CANVASSED</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-bold">UNSEARCHED</span>
                  )}
                </div>

                <p className="text-[11px] text-neutral-400 font-sans">
                  {loc.fictionalAddress} ({loc.neighborhood})
                </p>
                <span className="inline-block mt-2 text-[10px] uppercase font-bold text-neutral-400 px-1.5 py-0.5 rounded bg-noir-950">
                  {loc.type.replace('_', ' ')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Location Detail & Search Action */}
        {currentLocation && (
          <div className="flex-1 p-8 bg-noir-950 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6 max-w-3xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
                  {currentLocation.neighborhood}
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">{currentLocation.name}</h2>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  {currentLocation.fictionalAddress} | GPS: {currentLocation.coordinates.lat},{' '}
                  {currentLocation.coordinates.lng}
                </p>
              </div>

              {/* Description Card */}
              <div className="p-5 rounded-lg bg-noir-900 border border-noir-800 text-xs leading-relaxed text-neutral-300 font-sans">
                {currentLocation.description}
              </div>

              {/* Search Output / Found Items */}
              {searchOutput && (
                <div className="p-5 rounded-lg bg-emerald-950/40 border border-emerald-600 text-xs space-y-3">
                  <h4 className="font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>CANVASS SEARCH COMPLETED</span>
                  </h4>

                  {searchOutput.evidence.length > 0 ? (
                    <div className="space-y-1">
                      <span className="text-neutral-300 font-bold text-[11px] block">
                        Physical Evidence Secured:
                      </span>
                      {searchOutput.evidence.map((cId) => (
                        <div key={cId} className="p-2 rounded bg-noir-900/80 border border-emerald-800 font-mono text-emerald-200">
                          + {caseData.evidence[cId]?.title}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-400 font-sans">
                      No further physical evidence recovered at this location.
                    </p>
                  )}

                  {searchOutput.characters.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-emerald-800/60">
                      <span className="text-neutral-300 font-bold text-[11px] block">
                        Persons of Interest Identified:
                      </span>
                      {searchOutput.characters.map((cId) => (
                        <div key={cId} className="p-2 rounded bg-noir-900/80 border border-emerald-800 font-mono text-emerald-200">
                          * {caseData.characters[cId]?.name} ({caseData.characters[cId]?.occupation})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Canvass Execution Button */}
            <div className="pt-6 border-t border-noir-800 flex items-center space-x-4">
              <button
                onClick={() => handleCanvass(currentLocation.id)}
                className="px-6 py-3 rounded bg-amber-600 hover:bg-amber-500 text-noir-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg transition-transform hover:scale-[1.02]"
              >
                <Search className="w-4 h-4" />
                <span>
                  {visitedLocationIds.includes(currentLocation.id)
                    ? 'Re-Canvass Location (-2 Hours)'
                    : 'Dispatch Team to Canvass Scene (-2 Hours)'}
                </span>
              </button>
              <span className="text-xs text-neutral-400 font-sans">
                Transit and forensic grid search consumes 2 hours of the arraignment clock.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
