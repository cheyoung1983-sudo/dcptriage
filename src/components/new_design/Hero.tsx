'use client';

import React from 'react';
import { Van, Box, ChevronRight } from 'lucide-react';

export function Hero({ selectHeroMode, openBookingModal }: { selectHeroMode: (mode: 'onsite' | 'mailin') => void, openBookingModal: (title: string) => void }) {
  return (
    <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden bg-slate-950">
      {/* Background Ambient Glow Circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/15 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-cyan-500/15 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Precision Device Repair <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-cyan-200 to-emerald-400">
              Engineered for Velocity.
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Smarter OEM screen replacements, board-level micro-soldering, and computer tuning. Serviced <strong className="text-white">on-site at your door in Spokane</strong> or delivered via <strong className="text-white">white-glove ESD mail-in kits</strong> nationwide.
          </p>
        </div>

        {/* Dual Service Mode Selector Cards */}
        <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div onClick={() => selectHeroMode('onsite')} className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700 hover:border-cyan-500/60 cursor-pointer relative overflow-hidden group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-cyan-400">
                <Van />
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Local Spokane
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Spokane On-Site Mobile Visit</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Our certified technician comes directly to your home or office in a fully-equipped mobile lab. Complete repairs in 25–45 minutes.
            </p>
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Check Spokane Coverage & Book</span>
              <ChevronRight size={14} />
            </div>
          </div>

          <div onClick={() => selectHeroMode('mailin')} className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700 hover:border-violet-500/60 cursor-pointer relative overflow-hidden group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
                <Box />
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Nationwide USA
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">White-Glove ESD Mail-In Kit</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              We ship a custom 32-ECT foam mailer with ESD protection and a Pay-On-Use return shipping label. Zero postage risk.
            </p>
            <div className="flex items-center justify-between text-xs font-semibold text-violet-400 group-hover:translate-x-1 transition-transform">
              <span>Order ESD Kit & Track Ticket</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
