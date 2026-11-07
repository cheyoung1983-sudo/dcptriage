'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { Flame, Clock, Info, CheckCircle2 } from 'lucide-react';

const SAC305_DATA = [
  { time: 0, temp: 25, stage: 'Start' },
  { time: 30, temp: 100, stage: 'Preheat' },
  { time: 60, temp: 150, stage: 'Preheat' },
  { time: 90, temp: 165, stage: 'Soak' },
  { time: 150, temp: 180, stage: 'Soak' },
  { time: 180, temp: 217, stage: 'Reflow' },
  { time: 200, temp: 240, stage: 'Peak' },
  { time: 220, temp: 217, stage: 'Cooling' },
  { time: 250, temp: 150, stage: 'Cooling' },
  { time: 300, temp: 50, stage: 'End' },
];

export default function ThermalProfileChart() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <Flame size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">SAC305 Lead-Free Soldering Profile</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Peak: 235°C - 245°C • Liquidus: 217°C</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Preheat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Peak</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={SAC305_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#475569" 
              fontSize={10} 
              tickFormatter={(val) => `${val}s`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#475569" 
              fontSize={10} 
              tickFormatter={(val) => `${val}°C`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', fontSize: '10px' }}
              itemStyle={{ color: '#F59E0B' }}
            />
            <ReferenceLine y={217} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Liquidus (217°)', fill: '#EF4444', fontSize: 10 }} />
            <ReferenceArea x1={180} x2={220} fill="#EF4444" fillOpacity={0.05} />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#F59E0B" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTemp)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Preheat', range: '1.5-2.5°C/s', time: '60s' },
          { label: 'Soak', range: '150-180°C', time: '60-120s' },
          { label: 'Peak', range: '235-245°C', time: '10-20s' },
          { label: 'Cooling', range: '-2.0-4.0°C/s', time: 'Continuous' },
        ].map((phase, idx) => (
          <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{phase.label}</p>
            <p className="text-xs font-bold text-white">{phase.range}</p>
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
              <Clock size={10} /> {phase.time}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-start gap-3">
        <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-blue-300">Technician Insight: Thermal Mass</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Multi-layer ground planes act as large heat sinks. Ensure a minimum 90s soak at 160°C to equalize thermal mass before ramping to reflow, preventing "cold" joints.
          </p>
        </div>
      </div>
    </div>
  );
}
