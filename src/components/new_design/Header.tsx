'use client';

import React from 'react';
import Link from 'next/link';
import { Bolt, Calculator, Box, MapPin, Layers, ArrowRight, Sliders } from 'lucide-react';

export function Header({ openBookingModal, toggleComparisonDrawer }: { openBookingModal: (title: string) => void, toggleComparisonDrawer: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-slate-900/65 backdrop-blur-md border border-slate-700/60 rounded-2xl px-5 py-3 flex items-center justify-between shadow-2xl">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-lg transition-transform group-hover:scale-105">
              <Bolt className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                Display<span className="text-cyan-400">Cell</span>Pros
              </span>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Spokane Mobile & Mail-In Depot
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#service-selector" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
              <Calculator size={14} className="text-cyan-400" /> Instant Estimator
            </a>
            <a href="#mailin-architecture" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
              <Box size={14} className="text-cyan-400" /> White-Glove Mail-In
            </a>
            <a href="#spokane-coverage" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
              <MapPin size={14} className="text-emerald-400" /> Spokane On-Site
            </a>
            <a href="#catalog-grid" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
              <Layers size={14} className="text-cyan-400" /> Repair Catalog
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button onClick={toggleComparisonDrawer} className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/60 hover:bg-slate-700 transition-all">
              <Sliders size={14} className="text-cyan-400" /> Compare Redesign
            </button>
            <button onClick={() => openBookingModal('General Diagnostic')} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2">
              <span>Book Repair</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
