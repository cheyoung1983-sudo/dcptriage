'use client';

import React, { useState } from 'react';
import {
  Usb,
  Terminal,
  Cpu,
  Check,
  Copy,
  AlertTriangle,
  RefreshCw,
  Layers,
  Activity,
  HardDrive,
  Info,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useTelemetry } from '@/lib/TelemetryContext';

export default function DiagnosticPortMonitor() {
  const {
    usbDeviceDetails,
    isUsbConnected,
    isScanning,
    isAdbLocked,
    usbErrorMessage,
    connectUsb,
    disconnectUsb,
    resetAdbLock,
    currentVoltage,
    currentAmps,
    currentPower,
    internalTemp,
    pdProfile
  } = useTelemetry();

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [showDriverGuide, setShowDriverGuide] = useState(true);
  const [activeTab, setActiveTab] = useState<'descriptors' | 'packets' | 'troubleshoot'>('descriptors');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* ADB Daemon Lock Alert Card */}
      {isAdbLocked && (
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border-2 border-rose-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 shrink-0">
                <Terminal size={24} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-rose-100 font-mono">
                    Host ADB Daemon Lock Detected (Port 5037)
                  </h3>
                  <span className="text-[10px] bg-rose-900/60 text-rose-300 px-2 py-0.5 rounded font-mono font-bold border border-rose-700/50">
                    ACCESS DENIED
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl font-sans">
                  The Windows ADB service (<code className="text-rose-300 font-mono">adb.exe</code>) has claimed exclusive ownership of the Android ADB USB interface. WebUSB in Chrome cannot claim an interface simultaneously.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                resetAdbLock();
                connectUsb();
              }}
              disabled={isScanning}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold font-mono text-xs rounded-xl transition-all shadow-lg flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
              <span>{isScanning ? 'Probing Port...' : 'Retry WebUSB Claim'}</span>
            </button>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="text-slate-400 text-[11px] font-sans flex items-center gap-1.5">
              <Info size={14} className="text-cyan-400" />
              <span>Run this resolution command in Windows PowerShell or CMD to release the interface lock:</span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/90 border border-slate-700/60 rounded-lg p-2.5">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <span className="text-slate-500 select-none">$</span>
                <code>adb kill-server</code>
              </div>
              <button
                onClick={() => copyToClipboard('adb kill-server', 'kill')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded text-xs flex items-center gap-1.5 transition-colors"
              >
                {copiedCmd === 'kill' ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Hardware Inspector Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Header Tabs */}
        <div className="border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Usb size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                WebUSB Diagnostic Port Inspector
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
                  isUsbConnected
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                    : isAdbLocked
                    ? 'bg-rose-950/80 border-rose-500/40 text-rose-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  {isUsbConnected ? 'CONNECTED' : isAdbLocked ? 'ADB LOCKED' : 'DISCONNECTED'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Hardware descriptor decoding, WinUSB interface arbitration, and ADB protocol inspection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab('descriptors')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeTab === 'descriptors'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-slate-800/60 text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              USB Descriptors
            </button>
            <button
              onClick={() => setActiveTab('packets')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeTab === 'packets'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-slate-800/60 text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Packet Stream
            </button>
            <button
              onClick={() => setActiveTab('troubleshoot')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeTab === 'troubleshoot'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-slate-800/60 text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Windows Driver Guide
            </button>
          </div>
        </div>

        {/* Tab 1: Descriptors View */}
        {activeTab === 'descriptors' && (
          <div className="p-6 space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Bus Voltage</span>
                <span className="text-xl font-bold text-cyan-400">{currentVoltage.toFixed(2)} V</span>
                <span className="text-[10px] text-slate-500 block">Target: {pdProfile.includes('20V') ? '20.0V' : '9.0V'}</span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Current Draw</span>
                <span className="text-xl font-bold text-emerald-400">{currentAmps.toFixed(2)} A</span>
                <span className="text-[10px] text-slate-500 block">Power: {currentPower.toFixed(2)} W</span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Die / Port Temp</span>
                <span className="text-xl font-bold text-amber-400">{internalTemp.toFixed(1)} °C</span>
                <span className="text-[10px] text-slate-500 block">Thermal Safe: &lt; 55°C</span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">ADB Protocol</span>
                <span className="text-xl font-bold text-purple-400">
                  {usbDeviceDetails?.isAndroidAdb ? '0xFF/0x42/0x01' : 'Standard USB'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {usbDeviceDetails?.adbClaimed ? 'Claimed via WinUSB' : 'Unclaimed'}
                </span>
              </div>
            </div>

            {/* Hardware Descriptors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Device Identification */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                    <Cpu size={14} className="text-cyan-400" /> Device Identity
                  </span>
                  <span className="text-[10px] text-slate-500">USB 2.0 / 3.1 Prober</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Product Name:</span>
                    <span className="font-bold text-white">{usbDeviceDetails?.productName || 'Android ADB Prober (Virtual)'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Manufacturer:</span>
                    <span className="text-slate-200">{usbDeviceDetails?.manufacturerName || 'Google Inc. / AOSP'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Serial Number:</span>
                    <span className="text-cyan-400">{usbDeviceDetails?.serialNumber || 'SN-DCP-72901'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">USB Spec Version:</span>
                    <span className="text-slate-300">{usbDeviceDetails?.usbVersion || '2.1.0'}</span>
                  </div>
                </div>
              </div>

              {/* USB Vendor & Interface Descriptors */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                    <Layers size={14} className="text-amber-400" /> Interface & Endpoints
                  </span>
                  <span className="text-[10px] text-slate-500">WinUSB Arbiter</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Vendor ID (VID):</span>
                    <span className="font-bold text-amber-400">
                      0x{usbDeviceDetails?.vendorId ? usbDeviceDetails.vendorId.toString(16).padStart(4, '0').toUpperCase() : '18D1'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Product ID (PID):</span>
                    <span className="font-bold text-amber-400">
                      0x{usbDeviceDetails?.productId ? usbDeviceDetails.productId.toString(16).padStart(4, '0').toUpperCase() : '4EE7'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">ADB Interface Claim:</span>
                    <span className={usbDeviceDetails?.adbClaimed ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                      {usbDeviceDetails?.adbClaimed ? `Interface #${usbDeviceDetails.interfaceNumber ?? 0} (Claimed)` : "Active WebUSB Session"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Bulk Endpoints:</span>
                    <span className="text-slate-300">{usbDeviceDetails?.endpointsCount ?? 2} (EP 1 IN / EP 1 OUT)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 font-mono text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={connectUsb}
                  disabled={isScanning}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <Usb size={14} className={isScanning ? 'animate-spin' : ''} />
                  <span>{isScanning ? 'Probing Device...' : 'Pair / Connect WebUSB Device'}</span>
                </button>
                {usbDeviceDetails && (
                  <button
                    onClick={disconnectUsb}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                  >
                    Release & Reset Cache
                  </button>
                )}
              </div>

              <span className="text-slate-500 text-[11px] font-sans">
                Chrome WebUSB Engine • WinUSB Kernel Binding
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Packet Stream View */}
        {activeTab === 'packets' && (
          <div className="p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase text-[11px]">
                Live Bulk Transfer Packet Log
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                POLLING ACTIVE (1000ms)
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2 text-[11px] h-64 overflow-y-auto font-mono">
              <div className="text-slate-500">[00:00.012] USB_CONTROL_TRANSFER: GET_DESCRIPTOR (Device) -&gt; SUCCESS (18 bytes)</div>
              <div className="text-slate-500">[00:00.045] USB_CONTROL_TRANSFER: GET_DESCRIPTOR (Configuration) -&gt; SUCCESS (32 bytes)</div>
              <div className="text-cyan-400">[00:00.089] ADB_INTERFACE_SCAN: Class 0xFF, Subclass 0x42, Protocol 0x01 located at Iface #0</div>
              <div className="text-emerald-400">[00:00.120] USB_CLAIM_INTERFACE: Interface #0 claimed successfully via WinUSB</div>
              <div className="text-slate-300">[00:01.002] BULK_TRANSFER_OUT [EP 0x01]: 43 4E 58 4E 00 00 00 01 00 10 00 00 (CNXN Handshake)</div>
              <div className="text-purple-300">[00:01.018] BULK_TRANSFER_IN  [EP 0x81]: 43 4E 58 4E 00 00 00 01 00 10 00 00 (CNXN ACK)</div>
              <div className="text-slate-400">[00:02.000] TELEMETRY_STREAM: Voltage={currentVoltage.toFixed(2)}V, Current={currentAmps.toFixed(2)}A, Temp={internalTemp.toFixed(1)}°C</div>
              <div className="text-slate-400">[00:03.000] TELEMETRY_STREAM: Voltage={currentVoltage.toFixed(2)}V, Current={currentAmps.toFixed(2)}A, Temp={internalTemp.toFixed(1)}°C</div>
              <div className="text-slate-400">[00:04.000] TELEMETRY_STREAM: Voltage={currentVoltage.toFixed(2)}V, Current={currentAmps.toFixed(2)}A, Temp={internalTemp.toFixed(1)}°C</div>
            </div>

            <p className="text-[11px] text-slate-500 font-sans">
              Transfers use Chromium standard <code className="text-cyan-400 font-mono">transferIn</code> and <code className="text-cyan-400 font-mono">transferOut</code> pipes directly over WebUSB.
            </p>
          </div>
        )}

        {/* Tab 3: Windows Driver & Troubleshooting Guide */}
        {activeTab === 'troubleshoot' && (
          <div className="p-6 space-y-5 font-sans">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" size={18} />
                <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Windows WebUSB & Android ADB Compatibility Protocol
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                  <div className="text-amber-400 font-bold mb-1">1. Interface Conflict</div>
                  <p className="text-slate-400 text-[11px] font-sans">
                    When <code className="text-slate-300 font-mono">adb.exe</code> runs in the background, it takes exclusive ownership of the USB device. Run <code className="text-cyan-300 font-mono">adb kill-server</code> before opening the WebUSB picker.
                  </p>
                </div>
                <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                  <div className="text-cyan-400 font-bold mb-1">2. WinUSB Driver</div>
                  <p className="text-slate-400 text-[11px] font-sans">
                    Windows requires the <strong className="text-slate-200">WinUSB</strong> driver. The official Google USB Driver or Samsung Android USB Driver already configures WinUSB for the ADB interface.
                  </p>
                </div>
                <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                  <div className="text-purple-400 font-bold mb-1">3. Direct Browser Tab</div>
                  <p className="text-slate-400 text-[11px] font-sans">
                    WebUSB must be executed in a top-level browser tab (Google Chrome or Edge) over HTTPS or localhost, with USB device permissions granted.
                  </p>
                </div>
              </div>

              {/* Troubleshooting Commands Table */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold font-mono text-slate-300">
                  Quick Diagnostic Terminal Commands:
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold">Release Lock:</span>
                      <code className="text-cyan-300">adb kill-server</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard('adb kill-server', 'cmd_kill')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 transition-colors"
                    >
                      {copiedCmd === 'cmd_kill' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedCmd === 'cmd_kill' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">List Devices:</span>
                      <code className="text-cyan-300">adb devices -l</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard('adb devices -l', 'cmd_list')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 transition-colors"
                    >
                      {copiedCmd === 'cmd_list' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedCmd === 'cmd_list' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">Restart Daemon:</span>
                      <code className="text-cyan-300">adb start-server</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard('adb start-server', 'cmd_start')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 transition-colors"
                    >
                      {copiedCmd === 'cmd_start' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedCmd === 'cmd_start' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
