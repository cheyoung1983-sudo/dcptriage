'use client';

import React, { useState } from 'react';
import {
  Activity,
  Terminal,
  Zap,
  BookOpen,
  ShieldCheck,
  FileText,
  QrCode,
  Cpu,
  FolderGit2
} from 'lucide-react';
import { TelemetryHeader } from './TelemetryHeader';
import DiagnosticPortMonitor from './DiagnosticPortMonitor';
import { HardwareTriageIntake } from './HardwareTriageIntake';
import { HardwareDeepScan } from './HardwareDeepScan';
import { HardwareScanChart } from './HardwareScanChart';
import { HardwareDiagnosticLogs } from './HardwareDiagnosticLogs';
import SmartTriage from './SmartTriage';
import ElevenLabsWidget from './ElevenLabsWidget';
import { RepairAcademySuite } from './Academy/RepairAcademySuite';
import DataSanitizationCertificate from './DataSanitizationCertificate';
import RepairDeviceLabelQR from './RepairDeviceLabelQR';
import QrScannerModal from './QrScannerModal';
import { TelemetryProvider, useTelemetry } from '@/lib/TelemetryContext';
import { HardwareTelemetryDashboard } from './HardwareTelemetryDashboard';
import GitHubCLISourceCenter from './GitHubCLISourceCenter';
import { ToastProvider } from './Toast';

function WorkstationContent() {
  const {
    usbDeviceDetails,
    isUsbConnected,
    isScanning,
    connectUsb,
    disconnectUsb
  } = useTelemetry();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'port_monitor' | 'intake' | 'deep_scan' | 'triage_ai' | 'academy' | 'sanitization' | 'labels_qr' | 'github_repo'
  >('dashboard');

  const [isBulkEnabled, setIsBulkEnabled] = useState(false);
  const [isDeepScanOpen, setIsDeepScanOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [recentTicketId, setRecentTicketId] = useState<string>('DSC-1049');

  const startPhysicalUsbScan = async () => {
    const details = await connectUsb();
    if (details) {
      setIsDeepScanOpen(true);
    }
  };

  const handleToggleBulk = async () => {
    setIsBulkEnabled(!isBulkEnabled);
  };

  const tabs = [
    { id: 'dashboard', label: 'Telemetry Dashboard', icon: Activity, color: 'text-emerald-400' },
    { id: 'github_repo', label: 'GitHub Repo & CI/CD', icon: FolderGit2, color: 'text-purple-400' },
    { id: 'port_monitor', label: 'Advanced Port Monitor', icon: Zap, color: 'text-amber-400' },
    { id: 'intake', label: 'Hardware Intake', icon: FileText, color: 'text-cyan-400' },
    { id: 'deep_scan', label: 'Deep Scan & Logs', icon: ShieldCheck, color: 'text-teal-400' },
    { id: 'triage_ai', label: 'Triage AI & Voice', icon: Terminal, color: 'text-purple-400' },
    { id: 'academy', label: 'Repair Academy', icon: BookOpen, color: 'text-blue-400' },
    { id: 'labels_qr', label: 'QR & Labels', icon: QrCode, color: 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      <TelemetryHeader onOpenCli={() => setActiveTab('github_repo')} />

      {/* Workstation Navigation Ribbon */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-2 sticky top-[69px] z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-2 no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-600/20 text-white border border-cyan-500/50 shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <Icon size={14} className={tab.color} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-slate-400 shrink-0">
            <span className="text-[11px] bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              ACTIVE TICKET: <strong className="text-cyan-400">{recentTicketId}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Workstation View Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-200">
            <HardwareTelemetryDashboard />
          </div>
        )}

        {activeTab === 'port_monitor' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-5 py-3">
              <div className="flex items-center gap-3">
                <Zap className="text-amber-400" size={20} />
                <div>
                  <h3 className="font-bold text-white text-sm">Advanced WebUSB Hardware Inspector</h3>
                  <p className="text-xs text-slate-400">
                    Raw packet analysis • Control transfer injection • Hardware descriptor probing
                  </p>
                </div>
              </div>
            </div>
            <DiagnosticPortMonitor />
          </div>
        )}

        {activeTab === 'intake' && (
          <div className="animate-in fade-in duration-200">
            <HardwareTriageIntake
              onTicketCreated={(id) => setRecentTicketId(id)}
            />
          </div>
        )}

        {activeTab === 'deep_scan' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Target Device</span>
                <div className="text-sm font-bold text-white truncate">{usbDeviceDetails?.productName || 'iPhone 14 Pro Max (Simulated)'}</div>
                <div className="text-xs text-cyan-400 font-mono">SN: {usbDeviceDetails?.serialNumber || 'SN-3910294'}</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Hardware Health Score</span>
                <div className="text-2xl font-black text-emerald-400 font-mono">98.4%</div>
                <div className="text-xs text-slate-400 font-mono">Zero Critical Voltage Drops</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Deep Scan Routine</span>
                  <div className="text-xs text-slate-300">5-Step Automated Prober</div>
                </div>
                <button
                  onClick={() => setIsDeepScanOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors font-mono"
                >
                  Execute Scan
                </button>
              </div>
            </div>

            <HardwareScanChart
              deviceBrand="Apple"
              deviceModel={usbDeviceDetails?.productName || "iPhone 14 Pro Max"}
              issueType="screen"
            />

            <HardwareDiagnosticLogs deviceDetails={usbDeviceDetails} />
          </div>
        )}

        {activeTab === 'triage_ai' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <SmartTriage />
              </div>
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <Terminal size={16} className="text-cyan-400" />
                        Virtual Ryan (ElevenLabs)
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">Voice Model: Eleven Flash v2.5 (&lt;400ms)</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                      ACTIVE
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Voice assistant executes L.E.A.R.N. intake protocol, classifies repairs into Tiers 1–3, calculates V4 pricing quotes, and alerts Lead Tech Ryan for Tier 3 micro-soldering escalations.
                  </p>

                  <ElevenLabsWidget agentId="dcp-voice-agent" />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Cpu size={14} className="text-amber-400" />
                    V4 Pricing Formula Engine
                  </h4>
                  <div className="p-3 bg-slate-950 rounded-lg text-slate-300 space-y-1.5 border border-slate-850">
                    <div><strong className="text-cyan-400">P_retail</strong> = ceil(C_parts x 1.8 + $75 Labor)</div>
                    <div className="text-[11px] text-slate-500">Mobile Driveway Trip Fee: +$25.00</div>
                    <div className="text-[11px] text-slate-500">Tier 3 Board Rework: $49 Initial Triage (Custom Quote)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'academy' && (
          <div className="animate-in fade-in duration-200">
            <RepairAcademySuite />
          </div>
        )}

        {activeTab === 'sanitization' && (
          <div className="animate-in fade-in duration-200">
            <DataSanitizationCertificate />
          </div>
        )}

        {activeTab === 'labels_qr' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RepairDeviceLabelQR
                ticketNumber={recentTicketId}
                customerName="Spokane Client"
                deviceModel={usbDeviceDetails?.productName || "iPhone 14 Pro Max"}
                serviceTier="Tier 3 (Board Rework)"
                assignedBin="ESD-VAULT-B14"
                createdDate={new Date().toLocaleDateString()}
              />

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2 mb-2">
                    <QrCode className="text-cyan-400" size={18} />
                    Bench Camera & Barcode Scanner
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Scan physical thermal device labels, client intake slips, or incoming 32-ECT ESD mail-in boxes to instantly load ticket telemetry and bench history.
                  </p>
                </div>

                <button
                  onClick={() => setIsQrScannerOpen(true)}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-600/20 font-mono"
                >
                  Open Camera Scanner Prober
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'github_repo' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <GitHubCLISourceCenter />
          </div>
        )}
      </main>

      <HardwareDeepScan
        isOpen={isDeepScanOpen}
        onClose={() => setIsDeepScanOpen(false)}
        deviceName={usbDeviceDetails?.productName || "iPhone 14 Pro Max"}
      />

      {isQrScannerOpen && (
        <QrScannerModal
          isOpen={isQrScannerOpen}
          onClose={() => setIsQrScannerOpen(false)}
          onScanSuccess={(code) => {
            setRecentTicketId(code);
            setIsQrScannerOpen(false);
          }}
        />
      )}
    </div>
  );
}

export function DiagnosticsWorkstation() {
  return (
    <ToastProvider>
      <TelemetryProvider>
        <WorkstationContent />
      </TelemetryProvider>
    </ToastProvider>
  );
}
