import { useState } from 'react';
import { Calculator, Smartphone, Zap, Cpu, Layers, ArrowRight, ShieldCheck, Receipt, AlertCircle } from 'lucide-react';
import { ServiceTier, Manufacturer } from '../types';
import { repairsForTier, REPAIR_LABELS } from '../lib/customer-quote';
import type { RepairType } from '../lib/tiers';
import { useCustomerQuote } from '../hooks/useCustomerQuote';
import CustomerQuoteSummary from './CustomerQuoteSummary';
import TriageSecurityResearchModal from './TriageSecurityResearchModal';

const ISSUES = [
  { 
    id: 'charging',
    label: 'Battery & Power Systems',
    complexity: 'Tier 1',
    tier: ServiceTier.TIER_1_POWER,
    icon: Zap,
  },
  { 
    id: 'display',
    label: 'Display & Visual Systems',
    complexity: 'Tier 2',
    tier: ServiceTier.TIER_2_DISPLAY,
    icon: Layers,
  },
  { 
    id: 'board',
    label: 'Logic Board & Micro-Soldering',
    complexity: 'Tier 3',
    tier: ServiceTier.TIER_3_BOARD,
    icon: Cpu,
  }
];

const MODELS: Record<Manufacturer, string[]> = {
  [Manufacturer.APPLE]: ['iPhone 15 Pro Max', 'iPhone 15', 'iPhone 14 Pro', 'iPhone 13', 'iPad Pro M2'],
  [Manufacturer.SAMSUNG]: ['Galaxy S24 Ultra', 'Galaxy S23', 'Galaxy Z Fold 5', 'Galaxy Tab S9'],
  [Manufacturer.OTHER]: ['Google Pixel 8 Pro', 'OnePlus 12', 'Other Device']
};

export default function RepairEstimateCalculator() {
  const [manufacturer, setManufacturer] = useState<Manufacturer>(Manufacturer.APPLE);
  const [model, setModel] = useState(MODELS[Manufacturer.APPLE][0]);
  const [selectedIssue, setSelectedIssue] = useState(ISSUES[0]);
  const [repairType, setRepairType] = useState<RepairType | ''>('');
  const [mobileService, setMobileService] = useState(false);
  const validRepair = repairsForTier(selectedIssue.tier).includes(repairType as RepairType) ? repairType : '';
  const quoteState = useCustomerQuote({ device_model: model, repair_type: validRepair,
    mobile_service: mobileService, service_tier: selectedIssue.tier });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
          <Calculator className="w-3.5 h-3.5" />
          Precision Pricing Logic
        </div>
        <h2 className="text-4xl md:text-5xl font-playfair font-black text-slate-900 tracking-tight">
          Repair Estimate Calculator
        </h2>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">
          Generate an immediate engineering estimate for your device restoration. Select your hardware model, specific repair, and mobile or lab service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Device Selection */}
          <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Device Configuration</h3>
                <p className="text-xs font-medium text-slate-400">Select the hardware unit for triage</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Manufacturer</label>
                <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                  {(Object.keys(MODELS) as Manufacturer[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setManufacturer(m);
                        setModel(MODELS[m][0]);
                      }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        manufacturer === m 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Model Selection</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-slate-900 outline-none font-bold text-sm transition-all appearance-none"
                >
                  {MODELS[manufacturer].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Issue Diagnosis */}
          <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Issue Diagnosis</h3>
                <p className="text-xs font-medium text-slate-400">Identify the primary failure state</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ISSUES.map((issue) => {
                const tierData = issue;
                const Icon = issue.icon;
                const isActive = selectedIssue.id === issue.id;
                return (
                  <button
                    key={issue.id}
                    onClick={() => { setSelectedIssue(issue); setRepairType(''); }}
                    className={`p-6 rounded-[2rem] border-2 text-left transition-all space-y-4 ${
                      isActive 
                        ? 'bg-blue-50/50 border-blue-600 shadow-lg shadow-blue-500/10' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                        isActive ? 'bg-blue-600/10 text-blue-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {tierData.complexity}
                      </span>
                    </div>
                    <div className="space-y-1">

                      <h4 className={`font-bold text-sm ${isActive ? 'text-blue-900' : 'text-slate-900'}`}>
                        {tierData.label}
                      </h4>

                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="bg-white border border-slate-100 rounded-3xl p-8 space-y-4">
            <label className="block">Specific repair
              <select aria-label="Specific repair" value={validRepair} onChange={e => setRepairType(e.target.value as RepairType)} className="block w-full p-3 border rounded-xl">
                <option value="">Select a repair</option>
                {repairsForTier(selectedIssue.tier).map(r => <option key={r} value={r}>{REPAIR_LABELS[r]}</option>)}
              </select>
            </label>
            <label className="flex gap-2"><input type="checkbox" checked={mobileService} onChange={e => setMobileService(e.target.checked)} />Mobile / on-site service</label>
            <p className="text-xs">Rush service and data recovery require technician review; they are not priced as automatic add-ons.</p>
          </section>
        </div>

        {/* Quote Result Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-6">
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl space-y-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <ShieldCheck className="w-32 h-32" />
              </div>

              <div className="space-y-4 relative z-10">
                <h4 className="font-bold">Restoration Estimate</h4>
                <CustomerQuoteSummary state={quoteState} />
              </div>

              <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 group relative z-10">
                Proceed to Triage
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-200/50 space-y-4">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-slate-400" />
                <h5 className="font-bold text-slate-900 text-sm">Transparency Protocol</h5>
              </div>
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                Estimates use confirmed server pricing, before sales tax. Final billing may fluctuate based on parts provenance and real-time telemetry findings during Phase 2 (Diagnostic Triage).
                <br /><br />
                <span className="font-bold text-slate-900">WA RCW 19.415 Compliant Laboratory Pricing.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Triage Tool Abuse Prevention & Research Panel */}
        <div className="pt-8">
          <TriageSecurityResearchModal />
        </div>
      </div>
    </div>
  );
}

