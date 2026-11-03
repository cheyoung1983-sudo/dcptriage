'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, AlertCircle, Zap, RefreshCw, Usb, ShieldCheck, AlertTriangle, FolderGit2, GitBranch } from 'lucide-react';
import { useTelemetry } from '@/lib/TelemetryContext';
import GitHubRepoModal from './GitHubRepoModal';

export function TelemetryHeader({ onOpenCli }: { onOpenCli?: () => void }) {
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [gitHubStatus, setGitHubStatus] = useState<{ configured: boolean; repo?: string; username?: string } | null>(null);

  const fetchGitHubStatus = () => {
    fetch('/api/github/status')
      .then((res) => res.json())
      .then((data) => {
        setGitHubStatus({
          configured: Boolean(data.configured),
          repo: data.config?.repo || data.repo?.full_name || 'cheyoung1983-sudo/dcptriage',
          username: data.user?.login || data.user?.username
        });
      })
      .catch(() => {
        setGitHubStatus({ configured: false });
      });
  };

  useEffect(() => {
    fetchGitHubStatus();
  }, []);
  const {
    isUsbConnected,
    usbDeviceDetails,
    connectUsb,
    isScanning,
    disconnectUsb,
    isDisconnectedUnexpectedly
  } = useTelemetry();

  const [isBulkEnabled, setIsBulkEnabled] = React.useState(false);
  const onToggleBulk = () => setIsBulkEnabled(!isBulkEnabled);

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/95 border-b border-cyan-500/30 backdrop-blur-md shadow-2xl transition-all">
      {/* Hardware Error Recovery Banner */}
      {isDisconnectedUnexpectedly && !isUsbConnected && (
        <div className="bg-amber-500/20 border-b border-amber-500/50 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-amber-400 animate-bounce shrink-0" />
            <div>
              <span className="font-bold text-amber-100 uppercase tracking-wider">Hardware Error: USB Link Interrupted</span>
              <p className="text-[11px] text-amber-300/80 font-sans mt-0.5">
                Physical connection lost. Please re-attach the diagnostic ammeter / USB prober. Auto-resume will trigger once VID/PID matches.
              </p>
            </div>
          </div>
          <button
            onClick={connectUsb}
            disabled={isScanning}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center gap-1.5"
          >
            <Usb size={14} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? 'Re-attaching...' : 'Reconnect Prober'}</span>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Brand & System Identifiers */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/20">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-base tracking-tight font-mono">
                    DISPLAY & CELL PROS
                  </span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold border border-cyan-500/30">
                    DIAGNOSTICS SUITE
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                  <span className="text-emerald-400">Spokane Bench #04</span>
                  <span className="text-slate-600">•</span>
                  <span>WA Code 3202</span>
                  <span className="text-slate-600">•</span>
                  <span>UBI: 605 985 265</span>
                </div>
              </div>
            </div>

            {/* Mobile Connection Indicator */}
            <div className="lg:hidden">
              <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 ${isUsbConnected ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300' : 'bg-red-950 border border-red-500/40 text-red-300'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isUsbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                {isUsbConnected ? 'USB LIVE' : 'NO DEVICE'}
              </span>
            </div>
          </div>

          {/* Real-Time Hardware Telemetry Controls */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5 w-full lg:w-auto">
            {/* GitHub Repo Connection Status Pill & Modal Trigger */}
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                gitHubStatus?.configured
                  ? 'bg-purple-950/80 border-purple-500/50 text-purple-300 hover:bg-purple-900/60 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                  : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:border-purple-500/50 hover:bg-purple-950/30'
              }`}
              title="Manage GitHub Repository Sync & CI/CD"
            >
              <FolderGit2 size={13} className={gitHubStatus?.configured ? 'text-purple-400' : 'text-slate-400'} />
              <span className="font-bold">
                {gitHubStatus?.configured ? 'GitHub:' : 'Connect Repo'}
              </span>
              {gitHubStatus?.configured ? (
                <span className="text-purple-400/90 font-mono text-[11px] truncate max-w-[120px] sm:max-w-[170px]">
                  {gitHubStatus.repo?.split('/')[1] || gitHubStatus.repo}
                </span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            {/* Live Connection Status Pill */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              isUsbConnected
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : isDisconnectedUnexpectedly
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                : 'bg-red-950/80 border-red-500/50 text-red-300'
            }`}>
              {isUsbConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-bold">USB Online</span>
                  {usbDeviceDetails && (
                    <span className="text-emerald-400/80 font-normal">
                      (VID: 0x{usbDeviceDetails.vendorId.toString(16).padStart(4, '0')} | PID: 0x{usbDeviceDetails.productId.toString(16).padStart(4, '0')})
                    </span>
                  )}
                </>
              ) : isDisconnectedUnexpectedly ? (
                <>
                  <AlertTriangle size={14} className="text-amber-400 animate-bounce" />
                  <span className="font-bold">Link Interrupted</span>
                </>
              ) : (
                <>
                  <AlertCircle size={14} className="text-red-400 animate-bounce" />
                  <span className="font-bold">USB Disconnected</span>
                </>
              )}
            </div>

            {/* Bulk Prober Toggle */}
            <button
              onClick={onToggleBulk}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all border flex items-center gap-1.5 ${
                isBulkEnabled
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-600/30'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-850'
              }`}
              title="Iterate diagnostics across all paired WebUSB devices"
            >
              <RefreshCw size={13} className={isBulkEnabled ? 'animate-spin' : ''} />
              <span>Bulk Prober: {isBulkEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Hardware Connect / Scan Button */}
            <button
              onClick={connectUsb}
              disabled={isScanning}
              className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-slate-800 disabled:to-slate-850 text-white shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              <Usb size={14} className={isScanning ? 'animate-spin' : ''} />
              <span>{isScanning ? 'Probing Port...' : '🔌 Connect USB Prober'}</span>
            </button>

            {/* Forget / Reset Cache */}
            {usbDeviceDetails && (
              <button
                onClick={disconnectUsb}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-red-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
                title="Forget current device cache"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* GitHub Repository Connection & CI/CD Modal */}
      <GitHubRepoModal
        isOpen={isGitHubModalOpen}
        onClose={() => {
          setIsGitHubModalOpen(false);
          fetchGitHubStatus();
        }}
        onOpenCli={onOpenCli}
      />
    </header>
  );
}
