import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Terminal, Shield, ArrowLeft, Camera, Phone, Microscope, CheckCircle } from 'lucide-react';

export const TerminalView: React.FC = () => {
  const {
    discoveredEvidenceIds,
    requestSubpoena,
    requestForensicLab,
    setActiveView
  } = useGameStore();

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'MHD_SECURE_OS v4.19.8-rt [LA COUNTY BUREAU OF INVESTIGATION]',
    'TERMINAL 04 ONLINE | AUTH: DETECTIVE BADGE #4029',
    'TYPE COMMAND OR SELECT FROM THE EMERGENCY DISPATCH UTILITIES BELOW...'
  ]);

  const hasCCTV = discoveredEvidenceIds.includes('ev_cctv_calderon_car');
  const hasCellPing = discoveredEvidenceIds.includes('ev_cell_ping_calderon');
  const hasForensics = discoveredEvidenceIds.includes('ev_forensic_ballistics_dna');
  const hasWeapon = discoveredEvidenceIds.includes('ev_culvert_weapon');

  const addLog = (text: string) => {
    setTerminalLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
  };

  const handleRequestCCTV = () => {
    addLog('TRANSMITTING SUBPOENA TO LA CITY DEPT OF TRANSPORTATION...');
    const res = requestSubpoena('cctv_park_ave');
    if (res.success) {
      addLog(`SUCCESS: ${res.message}`);
      addLog('FOOTAGE DECRYPTED: Blue Lexus ES 350 CA Lic #7XYZ88 entering park perimeter at 22:10.');
    } else {
      addLog(`REJECTED: ${res.message}`);
    }
  };

  const handleRequestCellPing = () => {
    addLog('FILING EMERGENCY CSLI WARRANT WITH LA SUPERIOR COURT MAGISTRATE...');
    const res = requestSubpoena('calderon_cell_ping');
    if (res.success) {
      addLog(`WARRANT APPROVED: ${res.message}`);
      addLog('TELEMETRY CONFIRMED: Calderon handset pinged Echo Park North Tower sector 3 at 22:24.');
    } else {
      addLog(`DENIED BY JUDGE: ${res.message}`);
    }
  };

  const handleRequestCrimeLab = () => {
    addLog('DELIVERING EVIDENCE #EV-04 (BRASS THEODOLITE) TO CRIME LAB SID...');
    const res = requestForensicLab('ev_culvert_weapon');
    if (res.success) {
      addLog(`ANALYSIS COMPLETE: ${res.message}`);
      addLog('AFIS HIT: 10-point latent thumbprint match to Raymond Calderon on leveling screw.');
    } else {
      addLog(`ERROR: ${res.message}`);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-crt-bg text-crt-text select-none overflow-hidden font-mono crt-scanlines">
      {/* Top Header */}
      <div className="z-20 flex items-center justify-between px-6 py-3 bg-noir-950 border-b border-crt-green/30 text-xs">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveView('desk')}
            className="flex items-center space-x-1.5 px-3 py-1 bg-noir-900 hover:bg-noir-800 text-crt-green rounded border border-crt-green/40 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Desk</span>
          </button>
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-crt-green" />
            <span className="font-bold tracking-widest text-crt-green uppercase">
              METRO CAD TERMINAL — SECURE LAW ENFORCEMENT NETWORK
            </span>
          </div>
        </div>

        <span className="text-crt-green/70 text-[11px]">
          NODE: MHD-DTLA-04 | 48-HR CLOCK: ACTIVE
        </span>
      </div>

      {/* Main Terminal Interface */}
      <div className="flex-1 flex p-6 gap-6 overflow-hidden max-w-6xl mx-auto w-full">
        {/* Left: Terminal Output Screen */}
        <div className="flex-1 bg-black/90 p-6 rounded-lg border border-crt-green/40 shadow-crt flex flex-col justify-between overflow-hidden">
          <div className="overflow-y-auto space-y-2 pr-2 text-xs leading-relaxed font-mono">
            {terminalLogs.map((log, idx) => (
              <div
                key={idx}
                className={log.includes('SUCCESS') || log.includes('APPROVED') || log.includes('COMPLETE') ? 'text-amber-400 font-bold' : log.includes('DENIED') || log.includes('REJECTED') ? 'text-red-400 font-bold' : 'text-crt-text'}
              >
                {log}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-crt-green/20 flex items-center space-x-2 text-xs text-crt-green">
            <span className="animate-pulse">❯</span>
            <span className="text-neutral-400">READY FOR SUBPOENA / LAB DISPATCH QUERY...</span>
          </div>
        </div>

        {/* Right: Automated Actions Palette */}
        <div className="w-96 flex flex-col space-y-4">
          <div className="bg-noir-900/90 p-4 rounded-lg border border-crt-green/30 space-y-3">
            <h3 className="text-xs font-bold text-crt-green uppercase tracking-wider flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>JUDICIAL & FORENSIC REQUESTS:</span>
            </h3>

            {/* Request 1: DOT Traffic Camera */}
            <div className="p-3 rounded bg-black/60 border border-crt-green/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center space-x-1.5 text-white">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>DOT Traffic Camera Subpoena</span>
                </span>
                {hasCCTV && (
                  <span className="text-[10px] text-crt-green flex items-center space-x-1 font-bold">
                    <CheckCircle className="w-3 h-3" />
                    <span>OBTAINED</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Intersections: Glendale Blvd & Park Ave (Echo Park Lake perimeter).
              </p>
              <button
                disabled={hasCCTV}
                onClick={handleRequestCCTV}
                className={`w-full py-1.5 rounded text-xs font-bold uppercase tracking-wider border transition-colors ${
                  hasCCTV
                    ? 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
                    : 'bg-crt-green/20 hover:bg-crt-green/30 text-crt-green border-crt-green/40'
                }`}
              >
                {hasCCTV ? 'Footage Decrypted' : 'Subpoena Intersection Video'}
              </button>
            </div>

            {/* Request 2: CSLI Phone Tower Ping */}
            <div className="p-3 rounded bg-black/60 border border-crt-green/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center space-x-1.5 text-white">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Emergency CSLI Cell Warrant</span>
                </span>
                {hasCellPing && (
                  <span className="text-[10px] text-crt-green flex items-center space-x-1 font-bold">
                    <CheckCircle className="w-3 h-3" />
                    <span>WARRANT GRANTED</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Target: Raymond Calderon handset (requires probable cause via vehicle CCTV).
              </p>
              <button
                disabled={hasCellPing}
                onClick={handleRequestCellPing}
                className={`w-full py-1.5 rounded text-xs font-bold uppercase tracking-wider border transition-colors ${
                  hasCellPing
                    ? 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
                    : 'bg-crt-green/20 hover:bg-crt-green/30 text-crt-green border-crt-green/40'
                }`}
              >
                {hasCellPing ? 'Cell Records Attached' : 'Request Magistrate Warrant'}
              </button>
            </div>

            {/* Request 3: Scientific Investigation Lab */}
            <div className="p-3 rounded bg-black/60 border border-crt-green/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center space-x-1.5 text-white">
                  <Microscope className="w-3.5 h-3.5 text-rose-400" />
                  <span>Expedited Crime Lab AFIS Run</span>
                </span>
                {hasForensics && (
                  <span className="text-[10px] text-crt-green flex items-center space-x-1 font-bold">
                    <CheckCircle className="w-3 h-3" />
                    <span>AFIS MATCH</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Item: Antique nautical theodolite dredged from storm drain (Item #EV-04).
              </p>
              <button
                disabled={hasForensics || !hasWeapon}
                onClick={handleRequestCrimeLab}
                className={`w-full py-1.5 rounded text-xs font-bold uppercase tracking-wider border transition-colors ${
                  hasForensics
                    ? 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
                    : !hasWeapon
                      ? 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
                      : 'bg-crt-green/20 hover:bg-crt-green/30 text-crt-green border-crt-green/40'
                }`}
              >
                {hasForensics
                  ? 'Fingerprint Matched'
                  : !hasWeapon
                    ? 'Requires Murder Weapon'
                    : 'Submit to Ballistics Lab'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
