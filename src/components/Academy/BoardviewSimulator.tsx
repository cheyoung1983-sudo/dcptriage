'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Layers, 
  Zap, 
  Maximize2, 
  Minimize2, 
  Crosshair, 
  Info,
  Thermometer,
  ShieldAlert,
  Cpu,
  Monitor
} from 'lucide-react';

interface ComponentPad {
  ref: string;
  pin: string;
  net: string;
  x: number;
  y: number;
  expectedV: number;
  measuredV?: number;
  isIC?: boolean;
}

interface BoardModel {
  name: string;
  revision: string;
  pads: ComponentPad[];
  traces: { d: string }[];
}

const BOARDS: Record<string, BoardModel> = {
  'ip14-pro': {
    name: 'iPhone 14 Pro',
    revision: '820-02536-A',
    pads: [
      { ref: 'U7100', pin: '24', net: 'PPBUS_G3H', x: 120, y: 180, expectedV: 0.450, isIC: true },
      { ref: 'U7100', pin: '27', net: 'CSOP', x: 140, y: 180, expectedV: 0.380 },
      { ref: 'C7125', pin: '1', net: 'PPBUS_G3H', x: 120, y: 220, expectedV: 0.450 },
      { ref: 'A16', pin: 'M1', net: 'VDD_CPU', x: 250, y: 150, expectedV: 0.280, isIC: true },
      { ref: 'L7100', pin: '1', net: 'PPBUS_G3H_REG', x: 200, y: 180, expectedV: 0.445 },
    ],
    traces: [
      { d: 'M 80 150 L 120 180 L 200 180' },
      { d: 'M 120 180 L 120 220' },
    ]
  },
  's24-ultra': {
    name: 'Galaxy S24 Ultra',
    revision: 'SM-S928-V1',
    pads: [
      { ref: 'PM8550', pin: '1', net: 'VPH_PWR', x: 150, y: 250, expectedV: 0.410, isIC: true },
      { ref: 'C3010', pin: '1', net: 'VPH_PWR', x: 180, y: 250, expectedV: 0.410 },
      { ref: 'U1024', pin: 'A4', net: 'USB_CON_P', x: 400, y: 300, expectedV: 0.520, isIC: true },
      { ref: 'SD8G3', pin: 'B2', net: 'VDD_CORE', x: 250, y: 100, expectedV: 0.210, isIC: true },
    ],
    traces: [
      { d: 'M 150 250 L 180 250' },
      { d: 'M 400 300 L 350 200 L 250 100' },
    ]
  },
  'mbp-m2': {
    name: 'MacBook Pro M2',
    revision: '820-02382-05',
    pads: [
      { ref: 'U8100', pin: '1', net: 'PPBUS_AON', x: 100, y: 100, expectedV: 0.480, isIC: true },
      { ref: 'U8100', pin: '24', net: 'PP3V3_S5_AON', x: 120, y: 100, expectedV: 0.350 },
      { ref: 'CD3217', pin: 'B1', net: 'USB_C_XA_CC1', x: 420, y: 80, expectedV: 0.580, isIC: true },
      { ref: 'M2_CHIP', pin: 'G1', net: 'PPVDD_GPU_S0', x: 250, y: 220, expectedV: 0.150, isIC: true },
    ],
    traces: [
      { d: 'M 100 100 L 120 100' },
      { d: 'M 420 80 L 350 150 L 250 220' },
    ]
  }
};

export default function BoardviewSimulator({ modelId = 'ip14-pro', targetNet }: { modelId?: string; targetNet?: string }) {
  const board = useMemo(() => BOARDS[modelId] || BOARDS['ip14-pro'], [modelId]);
  
  const [searchTerm, setSearchTerm] = useState(targetNet || '');
  const [showTraces, setShowTraces] = useState(true);
  const [selectedPad, setSelectedPad] = useState<ComponentPad | null>(null);
  const [isSimulatingShort, setIsSimulatingShort] = useState(false);

  const getDiodeColor = (expected: number, measured?: number) => {
    if (measured === undefined) return 'stroke-cyan-500/40 fill-cyan-500/10';
    const relError = Math.abs(measured - expected) / expected;
    if (measured <= 0.005 || relError > 0.15) return 'stroke-red-500 fill-red-500/20 animate-pulse';
    if (relError > 0.05) return 'stroke-amber-500 fill-amber-500/20';
    return 'stroke-emerald-500 fill-emerald-500/20';
  };

  const filteredPads = useMemo(() => {
    if (!searchTerm) return board.pads;
    return board.pads.filter(p => 
      p.net.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.ref.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, board]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[550px]">
      {/* Header / Controls */}
      <div className="bg-slate-950/50 border-b border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Monitor size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-none">{board.name} Schematic</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1">PCB Revision: {board.revision}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text"
              placeholder="Search Net (e.g. PPBUS)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 transition-all w-full sm:w-48"
            />
          </div>
          
          <button 
            onClick={() => setShowTraces(!showTraces)}
            className={`p-2 rounded-lg transition-all ${showTraces ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            title="Toggle Traces"
          >
            <Layers size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-950 overflow-hidden cursor-crosshair">
        {/* SVG Drawing Canvas */}
        <svg viewBox="0 0 500 400" className="w-full h-full">
          {/* Traces Layer */}
          {showTraces && (
            <g id="layer-traces" className="opacity-30">
              {board.traces.map((t, i) => (
                <path key={i} d={t.d} stroke="#1E293B" strokeWidth="4" fill="none" />
              ))}
            </g>
          )}

          {/* Active Net Highlights */}
          {searchTerm && (
            <g id="layer-nets">
              {filteredPads.map((pad, idx) => (
                <motion.line
                  key={`net-${idx}`}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  x1={pad.x} y1={pad.y} x2={250} y2={200}
                  stroke={isSimulatingShort ? "#EF4444" : "#38BDF8"}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="opacity-20"
                />
              ))}
            </g>
          )}

          {/* Components / Pads Layer */}
          <g id="layer-components">
            {board.pads.map((pad, idx) => {
              const isTarget = searchTerm && (
                pad.net.toLowerCase().includes(searchTerm.toLowerCase()) || 
                pad.ref.toLowerCase().includes(searchTerm.toLowerCase())
              );
              const colorClass = getDiodeColor(pad.expectedV, pad.measuredV);

              return (
                <g 
                  key={idx} 
                  className="cursor-pointer group"
                  onClick={() => setSelectedPad(pad)}
                >
                  {pad.isIC ? (
                    <rect
                      x={pad.x - 15}
                      y={pad.y - 15}
                      width={30}
                      height={30}
                      rx={4}
                      className={`transition-all duration-300 stroke-2 ${colorClass} ${isTarget ? 'opacity-100 scale-110' : 'opacity-40'}`}
                    />
                  ) : (
                    <circle
                      cx={pad.x}
                      cy={pad.y}
                      r={isTarget ? 8 : 4}
                      className={`transition-all duration-300 stroke-2 ${colorClass} ${isTarget ? 'opacity-100 scale-110' : 'opacity-40'}`}
                    />
                  )}
                  {(isTarget || pad.isIC) && (
                    <text 
                      x={pad.x} 
                      y={pad.y - 20} 
                      textAnchor="middle" 
                      className="text-[9px] font-mono fill-slate-400 font-bold pointer-events-none uppercase tracking-tighter"
                    >
                      {pad.ref}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Pad Detail Card */}
        <AnimatePresence>
          {selectedPad && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-4 right-4 w-64 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl space-y-3 z-10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedPad.ref} - Pin {selectedPad.pin}</h4>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                    {selectedPad.net}
                  </span>
                </div>
                <button onClick={() => setSelectedPad(null)} className="text-slate-500 hover:text-white">
                  <Minimize2 size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <p className="text-slate-500 uppercase">Expected</p>
                  <p className="text-white font-bold">{selectedPad.expectedV.toFixed(3)}V</p>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <p className="text-slate-500 uppercase">Measured</p>
                  <p className="text-emerald-400 font-bold">---</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsSimulatingShort(!isSimulatingShort)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    isSimulatingShort ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Zap size={12} /> {isSimulatingShort ? 'Short Detected' : 'Inject Voltage'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg px-3 py-2 flex items-center gap-4 text-[10px] font-mono font-bold">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-400">Drift</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-slate-400">Short/Open</span>
          </div>
        </div>
      </div>
    </div>
  );
}

