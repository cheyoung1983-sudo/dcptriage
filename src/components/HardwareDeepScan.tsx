'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, ShieldCheck, X } from 'lucide-react';
import { playSuccessChime, playWarningTone } from '@/lib/audio';

interface HardwareDeepScanProps {
  isOpen: boolean;
  onClose: () => void;
  deviceName: string;
}

export function HardwareDeepScan({ isOpen, onClose, deviceName }: HardwareDeepScanProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState<number[]>([0, 0, 0, 0, 0]);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = [
    "Battery Health & Voltage Calibration",
    "Screen Digitizer & Touch Matrix Probe",
    "Port Integrity & High-Speed Data Lines",
    "Thermal Sensors & Core Diode Check",
    "NAND Flash Integrity & CRC Verification"
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setStepProgress([0, 0, 0, 0, 0]);
      setIsCompleted(false);
      return;
    }

    let step = 0;
    let progress = 0;

    const interval = setInterval(() => {
      progress += 5;
      if (progress <= 100) {
        setStepProgress(prev => {
          const next = [...prev];
          next[step] = progress;
          return next;
        });

        if (progress === 100) {
          // Play success chime or occasional warning tone test
          if (step === 2 && Math.random() < 0.2) {
            playWarningTone();
          } else {
            playSuccessChime();
          }
        }
      } else {
        if (step < steps.length - 1) {
          step++;
          setCurrentStep(step);
          progress = 0;
        } else {
          clearInterval(interval);
          setIsCompleted(true);
        }
      }
    }, 70);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full relative shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Hardware Deep Scan in Progress</h3>
              <p className="text-xs text-slate-400">Target Device: <strong className="text-cyan-400">{deviceName}</strong></p>
            </div>
          </div>
          {isCompleted && (
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {steps.map((label, index) => {
            const prog = stepProgress[index];
            const isDone = prog === 100;
            const isCurrent = index === currentStep && !isCompleted;

            return (
              <div key={index} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isDone ? 'text-emerald-400 font-bold' : isCurrent ? 'text-cyan-300' : 'text-slate-500'}`}>
                    {index + 1}. {label}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">{prog}%</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-100 ${isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`}
                    style={{ width: `${prog}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            {!isCompleted ? (
              <>
                <Loader2 size={14} className="animate-spin text-cyan-400" />
                <span>Executing diagnostic telemetry sequence...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-emerald-400 font-bold">All 5 Hardware Checks Passed Successfully</span>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            disabled={!isCompleted}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg"
          >
            {isCompleted ? "Complete & View Report" : "Scanning..."}
          </button>
        </div>
      </div>
    </div>
  );
}
