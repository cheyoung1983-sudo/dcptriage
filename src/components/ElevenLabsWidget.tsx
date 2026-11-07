'use client';
import React from 'react';
export default function ElevenLabsWidget({ agentId }: { agentId?: string }) {
  return <div className="p-3 bg-slate-950 rounded-lg text-xs text-cyan-400 font-mono">ElevenLabs Voice Widget ({agentId}) Active</div>;
}
