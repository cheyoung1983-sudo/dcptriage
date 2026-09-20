"use client";

import React, { useState } from 'react';
import { AIAssistantWidget } from './AIAssistantWidget';
import { MessageSquare } from 'lucide-react';
import { ToastContainer, Toast } from './ToastNotification';

export function AIAssistantModalManager() {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [specs, setSpecs] = useState({
    brand: "Apple",
    model: "iPhone 14 Pro Max",
    tier: "flagship",
    issue: "screen"
  });

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      {isAiOpen && (
        <AIAssistantWidget
          onClose={() => setIsAiOpen(false)}
          onNavigateToLab={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/lab';
            }
          }}
          deviceBrand={specs.brand}
          deviceModel={specs.model}
          deviceTier={specs.tier}
          issueType={specs.issue}
          onUpdateSpecs={(newSpecs) => setSpecs(prev => ({ ...prev, ...newSpecs }))}
        />
      )}

      {!isAiOpen && (
        <button
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 hover:bg-blue-500 hover:scale-105 transition-all z-40 group"
        >
          <MessageSquare className="text-white h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        </button>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
