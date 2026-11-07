'use client';

import React, { useState } from 'react';
import {
  Usb,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Terminal,
  Cpu,
  Info,
  Lock,
  Unlock,
  AlertTriangle
} from 'lucide-react';
import { useTelemetry } from '@/lib/TelemetryContext';

export default function UsbConnectionStatus() {
  const {
    usbDeviceDetails,
    isUsbConnected,
    isScanning,
    isAdbLocked,
    usbErrorMessage,
    connectUsb,
    disconnectUsb,
    resetAdbLock
  } = useTelemetry();

  const [isRequesting, setIsRequesting] = useState(false);

  // Explicit user-initiated onClick handler wrapping navigator.usb.requestDevice via connectUsb()
  const handleRequestDeviceAccess = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsRequesting(true);
    try {
      // If ADB lock was active, reset it first or attempt request directly
      if (isAdbLocked) {
        resetAdbLock();
      }
      await connectUsb();
    } catch (err: any) {
      console.error('USB request device access error:', err);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
        isUsbConnected ? 'bg-emerald-500/10' : isAdbLocked ? 'bg-rose-500/10' : 'bg-cyan-500/10'
      }`} />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        {/* Status indicator and info */}
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
            isUsbConnected
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10'
              : isAdbLocked
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-lg shadow-rose-500/10'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
          }`}>
            {isUsbConnected ? (
              <ShieldCheck size={28} className="animate-pulse" />
            ) : isAdbLocked ? (
              <ShieldAlert size={28} />
            ) : (
              <Usb size={28} />
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-lg font-bold text-white font-mono tracking-wide">
                USB Connection Status
              </h3>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
                isUsbConnected
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-400'
                  : isAdbLocked
                  ? 'bg-rose-950/90 border-rose-500/50 text-rose-400'
                  : 'bg-slate-800/90 border-slate-700 text-amber-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  isUsbConnected ? 'bg-emerald-400 animate-ping' : isAdbLocked ? 'bg-rose-400' : 'bg-amber-400'
                }`} />
                {isUsbConnected ? 'Authorized & Connected' : isAdbLocked ? 'ADB Daemon Locked' : 'Awaiting Connection'}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {isUsbConnected
                ? `Successfully paired with ${usbDeviceDetails?.productName || 'Diagnostic Target'}. WebUSB hardware telemetry stream active.`
                : isAdbLocked
                ? 'Host ADB daemon is holding the USB interface lock. Run `adb kill-server` or click retry below.'
                : 'Click "Request Device Access" below to trigger the browser WebUSB hardware picker within a user gesture.'}
            </p>

            {/* Device metadata badges if connected */}
            {isUsbConnected && usbDeviceDetails && (
              <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-mono text-slate-300">
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 flex items-center gap-1.5">
                  <Cpu size={13} className="text-cyan-400" />
                  Product: <strong className="text-white">{usbDeviceDetails.productName}</strong>
                </span>
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 flex items-center gap-1.5">
                  <span className="text-slate-500">VID:</span>
                  <strong className="text-emerald-400">0x{usbDeviceDetails.vendorId.toString(16).toUpperCase()}</strong>
                </span>
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 flex items-center gap-1.5">
                  <span className="text-slate-500">PID:</span>
                  <strong className="text-emerald-400">0x{usbDeviceDetails.productId.toString(16).toUpperCase()}</strong>
                </span>
                {usbDeviceDetails.serialNumber && (
                  <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 flex items-center gap-1.5">
                    <span className="text-slate-500">SN:</span>
                    <strong className="text-amber-400">{usbDeviceDetails.serialNumber}</strong>
                  </span>
                )}
              </div>
            )}

            {usbErrorMessage && (
              <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 rounded-lg p-2 font-mono mt-1">
                ⚠️ {usbErrorMessage}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto justify-end">
          {isUsbConnected ? (
            <button
              onClick={() => disconnectUsb()}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold font-mono text-xs rounded-xl transition-all shadow-lg border border-slate-700 flex items-center gap-2"
            >
              <XCircle size={16} className="text-rose-400" />
              <span>Disconnect USB Device</span>
            </button>
          ) : (
            <button
              onClick={handleRequestDeviceAccess}
              disabled={isScanning || isRequesting}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 text-white font-bold font-mono text-xs rounded-xl transition-all shadow-xl shadow-cyan-600/20 border border-cyan-400/30 flex items-center gap-2.5 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={16} className={isScanning || isRequesting ? 'animate-spin' : ''} />
              <span>{isScanning || isRequesting ? 'Requesting Permission...' : 'Request Device Access'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
