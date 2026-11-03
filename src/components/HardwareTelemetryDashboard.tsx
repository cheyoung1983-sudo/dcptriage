'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import {
  Activity,
  Zap,
  Flame,
  Gauge,
  Play,
  Pause,
  RotateCcw,
  Download,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sliders,
  ChevronRight,
  Info
} from 'lucide-react';
import { useTelemetry, TelemetryPoint } from '@/lib/TelemetryContext';
import { useToast } from './Toast';

// Custom Synchronized Tooltip
function SynchronizedTelemetryTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload as TelemetryPoint | undefined;
  if (!data) return null;

  const isThermalAlert = data.temperature >= 45.0;
  const isShortCircuit = data.current >= 4.0 || data.voltage < 3.0;

  return (
    <div className="bg-slate-900/95 border border-slate-700/80 backdrop-blur-md rounded-xl p-3.5 shadow-2xl font-mono text-xs space-y-2 min-w-[210px] pointer-events-none z-50">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 font-bold text-slate-200">
          <Clock size={12} className="text-cyan-400" />
          {data.time}
        </span>
        <span className="text-[10px] uppercase font-bold text-slate-500">
          {data.pdProfile || 'Live'}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Voltage:
          </span>
          <span className="font-bold text-cyan-300 tabular-nums">
            {data.voltage.toFixed(2)} V
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Current:
          </span>
          <span className="font-bold text-emerald-300 tabular-nums">
            {data.current.toFixed(2)} A
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Power:
          </span>
          <span className="font-bold text-purple-300 tabular-nums">
            {data.power.toFixed(2)} W
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Core Temp:
          </span>
          <span className={`font-bold tabular-nums ${isThermalAlert ? 'text-rose-400 font-extrabold animate-pulse' : 'text-amber-300'}`}>
            {data.temperature.toFixed(1)} °C
          </span>
        </div>
      </div>

      {(isThermalAlert || isShortCircuit) && (
        <div className="pt-1.5 border-t border-rose-500/30 text-[10px] font-bold text-rose-400 flex items-center gap-1">
          <AlertTriangle size={12} />
          <span>{isThermalAlert ? 'Thermal Lockout Limit Exceeded' : 'Potential Rail Short Detected'}</span>
        </div>
      )}
    </div>
  );
}

export function HardwareTelemetryDashboard() {
  const {
    currentVoltage,
    currentAmps,
    currentPower,
    internalTemp,
    telemetryHistory,
    pdProfile,
    setPdProfile,
    isStreaming,
    setIsStreaming,
    clearHistory
  } = useTelemetry();

  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [windowSeconds, setWindowSeconds] = useState<15 | 30 | 60>(30);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter history to the selected sliding window
  const chartData = useMemo(() => {
    if (!telemetryHistory || telemetryHistory.length === 0) return [];
    return telemetryHistory.slice(-windowSeconds);
  }, [telemetryHistory, windowSeconds]);

  // Derived state for safety badges & telemetry diagnostics
  const isThermalRunawayRisk = internalTemp >= 45.0;
  const isShortCircuitActive = pdProfile === 'SHORT_GROUND' || currentAmps >= 4.0 || currentVoltage < 3.0;

  // Calculate impedance R = V / I
  const calculatedImpedance = currentAmps > 0.05
    ? (currentVoltage / currentAmps).toFixed(2)
    : 'High-Z';

  // Export current telemetry window to CSV
  const handleExportCsv = () => {
    if (chartData.length === 0) {
      showToast('No telemetry samples available to export', 'error');
      return;
    }
    const headers = 'Timestamp,Voltage_V,Current_A,Power_W,Temperature_C,PD_Profile\n';
    const rows = chartData
      .map(p => `"${p.time}",${p.voltage},${p.current},${p.power},${p.temperature},"${p.pdProfile}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DCP-Telemetry-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${chartData.length} telemetry records to CSV`, 'success');
  };

  const handleToggleStreaming = () => {
    const nextState = !isStreaming;
    setIsStreaming(nextState);
    showToast(nextState ? 'Resumed live telemetry stream' : 'Paused telemetry stream for waveform inspection', 'info');
  };

  const handleClearBuffer = () => {
    clearHistory();
    showToast('Telemetry buffer cleared', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Critical Safety Lockout Alert Banner */}
      {isThermalRunawayRisk && (
        <div className="bg-rose-950/80 border-2 border-rose-500 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Flame size={22} className="animate-bounce" />
            </div>
            <div>
              <div className="text-sm font-black text-rose-200 tracking-wide font-mono flex items-center gap-2">
                CRITICAL SAFETY LOCKOUT: THERMAL THRESHOLD EXCEEDED ({internalTemp.toFixed(1)}°C)
              </div>
              <p className="text-xs text-rose-300/80 font-sans mt-0.5">
                Statutory RCW 19.415 & NIST SP 800-88 R1 safety cutoff active. Core battery cell temperature exceeds the 45.0°C thermal runaway ceiling. Halt charging and probing immediately.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPdProfile('5V_STANDARD')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shrink-0 transition-colors font-mono"
          >
            Emergency 5V Safe Drop
          </button>
        </div>
      )}

      {/* Real-Time Live KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Voltage Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xl group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Zap size={14} className="text-cyan-400" />
              Bus Voltage (VBUS)
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
              isShortCircuitActive
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
            }`}>
              {isShortCircuitActive ? 'DROP FAULT' : 'PD ACTIVE'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight tabular-nums" suppressHydrationWarning>
              {currentVoltage.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-cyan-400 font-mono uppercase">VDC</span>
          </div>
          <div className="mt-2.5 text-[11px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Target: {pdProfile === '20V_MACBOOK' ? '20.0V' : pdProfile === '5V_STANDARD' ? '5.0V' : '9.0V'}</span>
            <span className="text-cyan-400/90 font-bold">Ripple: &lt;45mV</span>
          </div>
        </div>

        {/* Current Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xl group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Gauge size={14} className="text-emerald-400" />
              Ammeter Draw
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
              currentAmps >= 4.0
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 animate-pulse'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            }`}>
              {currentAmps >= 4.0 ? 'SHORT SURGE' : 'SCALING'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight tabular-nums" suppressHydrationWarning>
              {currentAmps.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono uppercase">Amps</span>
          </div>
          <div className="mt-2.5 text-[11px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Limit: 4.00A Cutoff</span>
            <span className="text-emerald-400/90 font-bold">Z: {calculatedImpedance} Ω</span>
          </div>
        </div>

        {/* Power Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xl group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Activity size={14} className="text-purple-400" />
              Power Dissipation
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border bg-purple-500/15 text-purple-300 border-purple-500/30">
              {pdProfile === '20V_MACBOOK' ? 'HIGH WATT' : 'FAST CHARGE'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight tabular-nums" suppressHydrationWarning>
              {currentPower.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-purple-400 font-mono uppercase">Watts</span>
          </div>
          <div className="mt-2.5 text-[11px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Rating: Class 2 PD</span>
            <span className="text-purple-400/90 font-bold">P_max: 65W</span>
          </div>
        </div>

        {/* Temperature Card */}
        <div className={`border rounded-2xl p-5 relative overflow-hidden shadow-xl transition-all ${
          isThermalRunawayRisk
            ? 'bg-rose-950/60 border-rose-500/60'
            : 'bg-slate-900 border-slate-800 hover:border-amber-500/40'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Flame size={14} className={isThermalRunawayRisk ? 'text-rose-400 animate-pulse' : 'text-amber-400'} />
              Internal Temp
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
              isThermalRunawayRisk
                ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}>
              {isThermalRunawayRisk ? 'LOCKOUT' : 'NOMINAL'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black font-mono tracking-tight tabular-nums ${
              isThermalRunawayRisk ? 'text-rose-400' : 'text-white'
            }`} suppressHydrationWarning>
              {internalTemp.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-amber-400 font-mono uppercase">°C</span>
          </div>
          <div className="mt-2.5 text-[11px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Ceiling: 45.0°C</span>
            <span className={isThermalRunawayRisk ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {isThermalRunawayRisk ? 'HALT' : 'SAFE'}
            </span>
          </div>
        </div>
      </div>

      {/* Stream Controls & Profile Selector Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Stream Toggle & Window Selector */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={handleToggleStreaming}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md ${
              isStreaming
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause size={14} />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>Resume Live Stream</span>
              </>
            )}
          </button>

          {/* Window Length Filter */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            <span className="text-slate-500 px-2 text-[10px] uppercase font-bold">Window:</span>
            {([15, 30, 60] as const).map((secs) => (
              <button
                key={secs}
                onClick={() => setWindowSeconds(secs)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  windowSeconds === secs
                    ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {secs}s
              </button>
            ))}
          </div>

          <button
            onClick={handleClearBuffer}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            title="Clear live waveform buffer"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Center: Power Delivery (PD) Profile Segmented Control */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full lg:w-auto">
          <span className="text-slate-500 px-2 text-[10px] font-mono uppercase font-bold shrink-0">
            PD Profile:
          </span>
          {[
            { id: '9V_FAST', label: '9V Fast Charge' },
            { id: '5V_STANDARD', label: '5V Standard' },
            { id: '20V_MACBOOK', label: '20V MacBook' },
            { id: 'SHORT_GROUND', label: 'Short Test' }
          ].map((prof) => {
            const isSelected = pdProfile === prof.id;
            return (
              <button
                key={prof.id}
                onClick={() => setPdProfile(prof.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? prof.id === 'SHORT_GROUND'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                      : 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {prof.label}
              </button>
            );
          })}
        </div>

        {/* Right: Export & Buffer Health */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <div className="text-[11px] font-mono text-slate-400 hidden sm:flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span>{chartData.length} pts (1.0 Hz)</span>
          </div>

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download size={13} className="text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Synchronized Recharts 2x2 Telemetry Waveforms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Voltage Waveform (Cyan) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                VBUS Line Potential (Volts)
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Target: {pdProfile === '20V_MACBOOK' ? '20.0V' : pdProfile === '5V_STANDARD' ? '5.1V' : '9.0V'} nominal · Sync ID: telemetry
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
              {currentVoltage.toFixed(2)} V
            </span>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  syncId="hardwareTelemetry"
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="voltageGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#64748B"
                    tick={{ fontSize: 10, fontFamily: 'monospace' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    tick={{ fontSize: 10, fontFamily: 'monospace' }}
                    domain={[0, (dataMax: number) => Math.max(12, Math.ceil(dataMax + 2))]}
                    tickLine={false}
                    unit="V"
                  />
                  <Tooltip content={<SynchronizedTelemetryTooltip />} />
                  <ReferenceLine
                    y={pdProfile === '20V_MACBOOK' ? 20.0 : pdProfile === '5V_STANDARD' ? 5.0 : 9.0}
                    stroke="#06B6D4"
                    strokeDasharray="4 4"
                    label={{ value: 'Target V', position: 'top', fill: '#06B6D4', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <ReferenceLine
                    y={4.5}
                    stroke="#EF4444"
                    strokeDasharray="3 3"
                    label={{ value: 'Brownout 4.5V', position: 'insideBottomLeft', fill: '#EF4444', fontSize: 9, fontFamily: 'monospace' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="voltage"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#voltageGradient)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-950/50 animate-pulse rounded-xl" />
            )}
          </div>
        </div>

        {/* Chart 2: Ammeter Current Waveform (Emerald) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                Ammeter Current Consumption (Amps)
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Nominal Boot: 0.8A–2.2A · Short Circuit Cutoff: &gt;4.0A
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
              {currentAmps.toFixed(2)} A
            </span>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  syncId="hardwareTelemetry"
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#64748B"
                    tick={{ fontSize: 10, fontFamily: 'monospace' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    tick={{ fontSize: 10, fontFamily: 'monospace' }}
                    domain={[0, (dataMax: number) => Math.max(3.5, Math.ceil(dataMax + 0.8))]}
                    tickLine={false}
                    unit="A"
                  />
                  <Tooltip content={<SynchronizedTelemetryTooltip />} />
                  <ReferenceLine
                    y={2.0}
                    stroke="#10B981"
                    strokeDasharray="4 4"
                    label={{ value: '2.0A Nominal', position: 'top', fill: '#10B981', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <ReferenceLine
                    y={4.0}
                    stroke="#EF4444"
                    strokeDasharray="3 3"
                    label={{ value: '4.0A Short Threshold', position: 'insideTopLeft', fill: '#EF4444', fontSize: 9, fontFamily: 'monospace' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#currentGradient)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-950/50 animate-pulse rounded-xl" />
            )}
          </div>
        </div>

        {/* Chart 3: Power Output (Purple) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                Active Wattage Delivery (Watts)
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Dynamic product of VBUS x Amps · Fast Charge Threshold: 18W
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded">
              {currentPower.toFixed(2)} W
            </span>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  syncId="hardwareTelemetry"
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#64748B"
                    tick={{ fontSize: 10, fontFamily: 'monospace' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    tick={{ fontSize: 10, fontFamily: 'monospace' }}
                    domain={[0, (dataMax: number) => Math.max(25, Math.ceil(dataMax + 5))]}
                    tickLine={false}
                    unit="W"
                  />
                  <Tooltip content={<SynchronizedTelemetryTooltip />} />
                  <ReferenceLine
                    y={18.0}
                    stroke="#8B5CF6"
                    strokeDasharray="4 4"
                    label={{ value: '18W PD Limit', position: 'top', fill: '#8B5CF6', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="power"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#powerGradient)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-950/50 animate-pulse rounded-xl" />
            )}
          </div>
        </div>

        {/* Chart 4: Thermal Profile Core (Amber/Rose) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2 font-mono">
                <span className={`w-2.5 h-2.5 rounded-full ${isThermalRunawayRisk ? 'bg-rose-400 animate-pulse' : 'bg-amber-400'}`}></span>
                Thermal Core Sensor (°C)
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                NIST SP 800-88 Safe Ceiling: 45.0°C · Rework Zone: 200°C–400°C
              </p>
            </div>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
              isThermalRunawayRisk
                ? 'text-rose-300 bg-rose-950/80 border-rose-500 animate-pulse'
                : 'text-amber-300 bg-amber-950/60 border-amber-500/30'
            }`}>
              {internalTemp.toFixed(1)} °C
            </span>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  syncId="hardwareTelemetry"
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isThermalRunawayRisk ? '#EF4444' : '#F59E0B'} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={isThermalRunawayRisk ? '#EF4444' : '#F59E0B'} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#64748B"
                    tick={{ fontSize: 10, fontFamily: 'monospace' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    tick={{ fontSize: 10, fontFamily: 'monospace' }}
                    domain={[25, 75]}
                    tickLine={false}
                    unit="°C"
                  />
                  <Tooltip content={<SynchronizedTelemetryTooltip />} />
                  <ReferenceLine
                    y={45.0}
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{ value: '45.0°C CRITICAL LOCKOUT', position: 'top', fill: '#EF4444', fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }}
                  />
                  <ReferenceLine
                    y={35.0}
                    stroke="#F59E0B"
                    strokeDasharray="3 3"
                    label={{ value: '35°C Baseline', position: 'insideBottomLeft', fill: '#F59E0B', fontSize: 9, fontFamily: 'monospace' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    stroke={isThermalRunawayRisk ? '#EF4444' : '#F59E0B'}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#tempGradient)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-950/50 animate-pulse rounded-xl" />
            )}
          </div>
        </div>
      </div>

      {/* Advanced Telemetry Telemetry Status Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 size={14} />
            <span className="font-bold text-slate-200">S2C Mapping Engine v4.2</span>
          </div>
          <span>•</span>
          <div>Sampling: <strong className="text-slate-200">1000ms / 1.0Hz</strong></div>
          <span>•</span>
          <div>Active Contract: <strong className="text-cyan-400">{pdProfile}</strong></div>
          <span>•</span>
          <div>Impedance: <strong className="text-purple-300">{calculatedImpedance} Ω</strong></div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          <ShieldCheck size={14} className="text-cyan-400" />
          <span>NIST SP 800-88 R1 & RCW 19.415 Compliant</span>
        </div>
      </div>
    </div>
  );
}
