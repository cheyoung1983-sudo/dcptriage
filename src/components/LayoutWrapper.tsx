"use client";

import React from 'react';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 flex flex-col justify-between">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

