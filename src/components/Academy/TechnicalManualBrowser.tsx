'use client';

import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  FileText, 
  ChevronRight, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Cpu,
  Download
} from 'lucide-react';

const MANUAL_DATA = [
  { 
    id: 'man-ip14-pro', 
    title: 'iPhone 14 Pro Technical Service Manual', 
    version: '2.4',
    category: 'Apple',
    sections: ['Safety Protocols', 'Component Locations', 'Torque Specs', 'TrueDepth Calibration']
  },
  { 
    id: 'man-s24-ultra', 
    title: 'Galaxy S24 Ultra Assembly Guide', 
    version: '1.1',
    category: 'Samsung',
    sections: ['Screen Separation', 'Battery Adhesive Handling', 'Thermal Pad Locations']
  },
  { 
    id: 'man-micro-ref', 
    title: 'SMD Component Reference & Pinout Database', 
    version: '4.0',
    category: 'Reference',
    sections: ['PMIC Pinouts', 'Tristar/Hydra Mapping', 'BGA Pad Standards']
  },
  { 
    id: 'man-compliance', 
    title: 'WA HB 1483 Compliance & NIST Wipe Guide', 
    version: '2026.1',
    category: 'Compliance',
    sections: ['Right to Repair Disclosures', 'Sanitization SHA-256 Proofs']
  },
];

export default function TechnicalManualBrowser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManual, setSelectedManual] = useState<typeof MANUAL_DATA[0] | null>(null);

  const filtered = MANUAL_DATA.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[500px]">
      {/* Sidebar: Search & List */}
      <div className="w-full lg:w-72 bg-slate-950/50 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text"
              placeholder="Search Manuals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-all w-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.map((manual) => (
            <button
              key={manual.id}
              onClick={() => setSelectedManual(manual)}
              className={`w-full text-left p-3 rounded-xl transition-all group ${
                selectedManual?.id === manual.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{manual.category}</span>
                <span className="text-[9px] font-mono">v{manual.version}</span>
              </div>
              <p className="text-xs font-bold leading-snug">{manual.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-900 overflow-y-auto p-6 lg:p-8">
        {selectedManual ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <BookOpen size={18} />
                  </div>
                  <h3 className="text-xl font-black text-white">{selectedManual.title}</h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span>Author: D&CP Engineering</span>
                  <span>•</span>
                  <span>Revision: {selectedManual.version}</span>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700">
                <Download size={14} /> Full PDF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedManual.sections.map((section, idx) => (
                <button 
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500/50 hover:bg-slate-900 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-slate-500 group-hover:text-blue-400 flex items-center justify-center transition-colors">
                      <FileText size={16} />
                    </div>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{section}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>

            <div className="p-5 bg-blue-600/5 border border-blue-500/20 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-blue-400">
                <ShieldCheck size={18} />
                <h4 className="text-sm font-bold">Verified Technician Access Required</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Some schematic layers in this manual are restricted to Level 3 Bench Technicians. Internal pinouts for U7100 and associated VDD_MAIN traces are available via the <strong className="text-white">Interactive Boardview</strong> link below.
              </p>
              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors">
                Launch Boardview Simulation <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-500">
            <div className="w-16 h-16 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-700">
              <BookOpen size={32} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-300">Select a Technical Manual</h4>
              <p className="text-xs max-w-xs mx-auto mt-1 leading-relaxed">
                Search or browse the authorized D&CP library for assembly guides, schematics, and compliance protocols.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
