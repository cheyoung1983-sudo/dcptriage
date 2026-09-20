"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('./Navbar').then(mod => mod.Navbar), { ssr: false });
const Footer = dynamic(() => import('./Footer').then(mod => mod.Footer), { ssr: false });
const AIAssistantModalManager = dynamic(() => import('./AIAssistantModalManager').then(mod => mod.AIAssistantModalManager), { ssr: false });

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      <Footer />

      <AIAssistantModalManager />
    </div>
  );
}
