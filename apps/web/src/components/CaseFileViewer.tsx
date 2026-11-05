import React from 'react';
import { useGameStore } from '../store/gameStore';
import { FileText, ShieldAlert, PhoneCall, DollarSign, Microscope, ArrowLeft } from 'lucide-react';

export const CaseFileViewer: React.FC = () => {
  const {
    caseData,
    selectedCaseFileTab,
    setSelectedCaseFileTab,
    discoveredEvidenceIds,
    setActiveView
  } = useGameStore();

  const tabs = [
    { id: 'incident', label: 'INCIDENT & 911 CAD', icon: ShieldAlert },
    { id: 'autopsy', label: 'CORONER AUTOPSY', icon: FileText },
    { id: 'phone', label: 'PHONE & SURVEILLANCE', icon: PhoneCall },
    { id: 'dossier', label: 'FINANCIAL AUDIT', icon: DollarSign },
    { id: 'forensics', label: 'CRIME LAB FORENSICS', icon: Microscope }
  ] as const;

  const prelimAutopsy = caseData.evidence['ev_coroner_prelim'];
  const victimPhone = caseData.evidence['ev_victim_phone'];
  const auditDossier = caseData.evidence['ev_audit_dossier'];
  const weaponForensics = caseData.evidence['ev_forensic_ballistics_dna'];
  const cctvEvidence = caseData.evidence['ev_cctv_calderon_car'];
  const cellPingEvidence = caseData.evidence['ev_cell_ping_calderon'];

  return (
    <div className="relative w-full h-full flex flex-col bg-noir-950 text-neutral-200 select-none overflow-hidden">
      {/* Top Header */}
      <div className="z-20 flex items-center justify-between px-6 py-3 bg-noir-900 border-b border-noir-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveView('desk')}
            className="flex items-center space-x-1.5 px-3 py-1 bg-noir-800 hover:bg-noir-700 text-xs font-semibold rounded border border-neutral-700 text-neutral-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Desk</span>
          </button>
          <div className="h-4 w-px bg-neutral-700 mx-2" />
          <span className="stamp-classified text-xs py-0.5 px-2">CONFIDENTIAL</span>
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
            OFFICIAL CASE DOSSIER — #{caseData.caseNumber}
          </span>
        </div>

        <span className="text-xs text-neutral-400">
          Deceased: <strong className="text-white">Julian Mercer (44)</strong> | Metro Homicide Division
        </span>
      </div>

      {/* Main Binder Layout */}
      <div className="flex-1 flex overflow-hidden p-6 max-w-6xl mx-auto w-full">
        {/* Left Side: Manila Tabs Navigation */}
        <div className="w-64 flex flex-col space-y-1 pr-3 pt-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedCaseFileTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCaseFileTab(tab.id)}
                className={`flex items-center space-x-3 px-4 py-3 text-left rounded-l-md font-mono text-xs font-bold transition-all border-l-4 ${
                  isActive
                    ? 'bg-dossier-bg text-neutral-900 border-amber-600 shadow-md translate-x-1'
                    : 'bg-noir-900 text-neutral-400 border-transparent hover:bg-noir-850 hover:text-neutral-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-700' : 'text-neutral-500'}`} />
                <span className="tracking-wider">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: The Paper Dossier Sheet */}
        <div className="flex-1 bg-dossier-bg text-neutral-900 rounded-r-lg rounded-bl-lg p-8 shadow-2xl border border-dossier-border overflow-y-auto font-mono text-sm relative">
          {/* Metal Binder Rings on the Left Edge */}
          <div className="absolute left-2 top-10 flex flex-col space-y-28 pointer-events-none">
            <div className="w-3 h-3 rounded-full bg-neutral-700 shadow-inner border border-neutral-900" />
            <div className="w-3 h-3 rounded-full bg-neutral-700 shadow-inner border border-neutral-900" />
            <div className="w-3 h-3 rounded-full bg-neutral-700 shadow-inner border border-neutral-900" />
          </div>

          {/* Tab 1: Incident & CAD */}
          {selectedCaseFileTab === 'incident' && (
            <div className="pl-6 space-y-6">
              <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight uppercase text-neutral-900">
                    LOS ANGELES POLICE SERVICE — METRO HOMICIDE
                  </h2>
                  <p className="text-xs text-neutral-600 font-sans">
                    Initial Dispatch Incident Report | Form 03-MHD
                  </p>
                </div>
                <div className="stamp-evidence">EVIDENCE SEALED</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-dossier-aged/40 p-4 rounded border border-dossier-border">
                <div>
                  <span className="text-neutral-500 block">Incident Number:</span>
                  <span className="font-bold text-neutral-900">{caseData.caseNumber}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Time Call Received:</span>
                  <span className="font-bold text-neutral-900">
                    {caseData.dispatchReport.incidentTime}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Reporting Party:</span>
                  <span className="font-bold text-neutral-900">
                    {caseData.dispatchReport.reportingParty}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">First Responding Unit:</span>
                  <span className="font-bold text-neutral-900">
                    {caseData.dispatchReport.initialUnitDispatched}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-700 mb-1">
                  Computer Aided Dispatch (CAD) Audio Transcript:
                </h3>
                <div className="p-4 bg-neutral-100 rounded border border-neutral-300 font-sans text-xs leading-relaxed text-neutral-800">
                  {caseData.dispatchReport.operatorNotes}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-700 mb-1">
                  Case Briefing:
                </h3>
                <p className="text-xs leading-relaxed text-neutral-800 font-sans">
                  {caseData.briefDescription}
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Coroner Autopsy */}
          {selectedCaseFileTab === 'autopsy' && (
            <div className="pl-6 space-y-6">
              <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight uppercase text-neutral-900">
                    COUNTY OF LOS ANGELES — MEDICAL EXAMINER-CORONER
                  </h2>
                  <p className="text-xs text-neutral-600 font-sans">
                    Autopsy Protocol & Pathological Findings
                  </p>
                </div>
                <div className="stamp-classified">OFFICIAL ME REPORT</div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs bg-dossier-aged/40 p-4 rounded border border-dossier-border">
                <div>
                  <span className="text-neutral-500 block">Deceased:</span>
                  <span className="font-bold text-neutral-900">Mercer, Julian</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Age / Sex:</span>
                  <span className="font-bold text-neutral-900">44 / Male</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Estimated TOD Window:</span>
                  <span className="font-bold text-rose-800">22:15 – 22:45 (Oct 18)</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-700 mb-1">
                  Anatomical Findings & Pathologist Notes:
                </h3>
                <div className="p-4 bg-neutral-100 rounded border border-neutral-300 font-sans text-xs leading-relaxed text-neutral-800 space-y-2">
                  <p>{prelimAutopsy?.description}</p>
                  <p className="text-neutral-600 text-[11px] pt-2 border-t border-neutral-200">
                    <strong>Wound Signature:</strong> Concentrated hexagonal blunt impact fracturing
                    parietal bone. Water aspirated post-mortem into pleural cavity indicates victim
                    died before being rolled into the canal reeds.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Phone & Surveillance */}
          {selectedCaseFileTab === 'phone' && (
            <div className="pl-6 space-y-6">
              <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight uppercase text-neutral-900">
                    TECHNICAL INVESTIGATION — DIGITAL & TELEMETRY
                  </h2>
                  <p className="text-xs text-neutral-600 font-sans">
                    Call Detail Records (CDR), Cell Site Location Info (CSLI) & DOT Cameras
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-neutral-100 rounded border border-neutral-300">
                  <h3 className="font-bold text-xs uppercase text-neutral-800 mb-2">
                    {victimPhone?.title}
                  </h3>
                  <p className="font-sans text-xs leading-relaxed text-neutral-700">
                    {victimPhone?.description}
                  </p>
                </div>

                {discoveredEvidenceIds.includes('ev_cctv_calderon_car') ? (
                  <div className="p-4 bg-amber-50 rounded border border-amber-300">
                    <h3 className="font-bold text-xs uppercase text-amber-900 mb-2">
                      {cctvEvidence?.title}
                    </h3>
                    <p className="font-sans text-xs leading-relaxed text-neutral-800">
                      {cctvEvidence?.description}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-200/50 rounded border border-dashed border-neutral-400 text-xs text-neutral-500 italic">
                    [DOT Traffic Camera Footage not yet subpoenaed. Request via MDT Terminal on the
                    desk.]
                  </div>
                )}

                {discoveredEvidenceIds.includes('ev_cell_ping_calderon') ? (
                  <div className="p-4 bg-blue-50 rounded border border-blue-300">
                    <h3 className="font-bold text-xs uppercase text-blue-900 mb-2">
                      {cellPingEvidence?.title}
                    </h3>
                    <p className="font-sans text-xs leading-relaxed text-neutral-800">
                      {cellPingEvidence?.description}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-200/50 rounded border border-dashed border-neutral-400 text-xs text-neutral-500 italic">
                    [Emergency CSLI Cell Tower Warrant pending. Submit judicial warrant request via
                    terminal.]
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Financial Audit */}
          {selectedCaseFileTab === 'dossier' && (
            <div className="pl-6 space-y-6">
              <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight uppercase text-neutral-900">
                    FINANCIAL CRIMES & ESCROW AUDIT RECORDS
                  </h2>
                  <p className="text-xs text-neutral-600 font-sans">
                    Subpoenaed Escrow Ledgers & Wire Transfers
                  </p>
                </div>
              </div>

              {discoveredEvidenceIds.includes('ev_audit_dossier') ? (
                <div className="p-5 bg-neutral-100 rounded border border-neutral-300 space-y-3">
                  <h3 className="font-bold text-xs uppercase text-neutral-900">
                    {auditDossier?.title}
                  </h3>
                  <p className="font-sans text-xs leading-relaxed text-neutral-800">
                    {auditDossier?.description}
                  </p>
                  <div className="text-[11px] p-3 bg-red-50 border border-red-200 text-red-900 rounded font-sans">
                    <strong>Critical Legal Finding:</strong> Establishes direct \$2,400,000 embezzlement
                    motive against Raymond Calderon. Filing was scheduled to trigger federal arrest
                    warrants.
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-neutral-200/50 rounded border border-dashed border-neutral-400 text-xs text-neutral-500 text-center italic">
                  [Audit dossier locked. Search the victim's workplace loft in Downtown Arts
                  District to recover this document.]
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Forensics */}
          {selectedCaseFileTab === 'forensics' && (
            <div className="pl-6 space-y-6">
              <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight uppercase text-neutral-900">
                    SCIENTIFIC INVESTIGATION DIVISION (SID) — CRIME LAB
                  </h2>
                  <p className="text-xs text-neutral-600 font-sans">
                    Physical Evidence, Ballistics & AFIS Latent Print Analysis
                  </p>
                </div>
                <div className="stamp-evidence">LAB CERTIFIED</div>
              </div>

              {discoveredEvidenceIds.includes('ev_culvert_weapon') && (
                <div className="p-4 bg-neutral-100 rounded border border-neutral-300">
                  <h3 className="font-bold text-xs uppercase text-neutral-900 mb-1">
                    {caseData.evidence['ev_culvert_weapon']?.title}
                  </h3>
                  <p className="font-sans text-xs leading-relaxed text-neutral-800">
                    {caseData.evidence['ev_culvert_weapon']?.description}
                  </p>
                </div>
              )}

              {discoveredEvidenceIds.includes('ev_forensic_ballistics_dna') ? (
                <div className="p-4 bg-emerald-50 rounded border border-emerald-300 space-y-2">
                  <h3 className="font-bold text-xs uppercase text-emerald-950">
                    {weaponForensics?.title}
                  </h3>
                  <p className="font-sans text-xs leading-relaxed text-neutral-800">
                    {weaponForensics?.description}
                  </p>
                  <div className="text-[11px] p-2 bg-emerald-100 rounded border border-emerald-300 text-emerald-900 font-sans">
                    <strong>Forensic Pillar Satisfied:</strong> AFIS 10-point latent thumbprint in
                    victim's blood ties Raymond Calderon directly to the murder weapon.
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-neutral-200/50 rounded border border-dashed border-neutral-400 text-xs text-neutral-500 text-center italic">
                  [Expedited AFIS fingerprint & trace report pending. Send the dredged theodolite
                  to the Crime Lab via the MDT terminal.]
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

