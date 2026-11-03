import { useState } from 'react';
import { ShieldAlert, Lock, Activity, CheckCircle2, AlertTriangle, RefreshCw, Server, Zap } from 'lucide-react';

export default function TriageSecurityResearchModal() {
  const [testMode, setTestMode] = useState<'normal' | 'spam' | 'oversized' | 'telemetry_out_of_bounds'>('normal');
  const [simResult, setSimResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async (mode: string) => {
    setLoading(true);
    setSimResult(null);

    let payload: any = {
      deviceModel: 'iPhone 15 Pro',
      symptomDescription: 'Device does not charge, battery drains rapidly.',
      telemetry: {
        batteryHealthPercentage: 88,
        batteryTempCelsius: 32,
        ammeterDrawAmps: 3.2,
        isShortToGround: true
      }
    };

    if (mode === 'oversized') {
      payload.symptomDescription = 'A'.repeat(1200); // Exceeds 1000 char cap
    } else if (mode === 'telemetry_out_of_bounds') {
      payload.telemetry.ammeterDrawAmps = 55.0; // Exceeds 20A limit
    }

    try {
      const res = await fetch('/api/ai/smart-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setSimResult({
        status: res.status,
        ok: res.ok,
        data
      });
    } catch (err: any) {
      setSimResult({
        status: 500,
        ok: false,
        data: { error: err.message }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Triage Tool Misuse & Abuse Prevention Research</h3>
            <p className="text-xs font-medium text-slate-500">D&CP Spokane Laboratory Security & Rate-Limiting Governance (Rev 4.2)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          Active Protection: Capped @ 15 req/min
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Activity className="w-4 h-4 text-blue-600" />
            1. Rate Limiting (Capping)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All triage and AI diagnostic requests are governed by a sliding window rate limiter. Clients are restricted to a maximum of <strong className="text-slate-900">15 requests per minute per IP</strong>, returning HTTP 429 when exceeded.
          </p>
          <div className="text-[11px] font-mono bg-white p-2 rounded-xl border border-slate-200 text-slate-700">
            Window: 60s | Max: 15 reqs/IP
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Lock className="w-4 h-4 text-emerald-600" />
            2. Payload Bounding & Sanitization
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Input notes and symptom descriptions are strictly bounded to <strong className="text-slate-900">1,000 characters</strong> maximum to prevent memory exhaustion, token abuse, or prompt injection payloads.
          </p>
          <div className="text-[11px] font-mono bg-white p-2 rounded-xl border border-slate-200 text-slate-700">
            String Limit: 1,000 chars max
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Zap className="w-4 h-4 text-amber-600" />
            3. Physical Telemetry Validation
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Diagnostic telemetry is validated against physical safety envelopes: Ammeter current draw (0–20A), battery health (0–100%), and temperature (-40°C to 120°C).
          </p>
          <div className="text-[11px] font-mono bg-white p-2 rounded-xl border border-slate-200 text-slate-700">
            Ammeter: 0–20A | Health: 0–100%
          </div>
        </div>
      </div>

      {/* Interactive Abuse Prevention Testbed */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-base">Live Security Sandbox & Abuse Simulation</h4>
            <p className="text-xs text-slate-400">Test how the API handles normal input versus abuse or out-of-bounds payloads.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => runSimulation('normal')}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              {loading && testMode === 'normal' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Test Valid Payload
            </button>
            <button
              onClick={() => runSimulation('oversized')}
              disabled={loading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Test Oversized Payload (&gt;1000c)
            </button>
            <button
              onClick={() => runSimulation('telemetry_out_of_bounds')}
              disabled={loading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Test Out-of-Bounds Telemetry
            </button>
          </div>
        </div>

        {simResult && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Simulation Response Status:</span>
              <span className={`px-2 py-0.5 rounded font-bold ${simResult.ok ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                HTTP {simResult.status} {simResult.ok ? 'SUCCESS (Allowed)' : 'BLOCKED (Rejected Safely)'}
              </span>
            </div>
            <pre className="text-slate-300 overflow-x-auto max-h-40 p-2">
              {JSON.stringify(simResult.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
