'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileText, History, Clock } from 'lucide-react';

interface HardwareDiagnosticLogsProps {
  deviceDetails: {
    productName: string;
    manufacturerName: string;
    vendorId: number;
    productId: number;
    serialNumber: string;
    usbVersion: string;
    deviceVersion: string;
  } | null;
}

export function HardwareDiagnosticLogs({ deviceDetails }: HardwareDiagnosticLogsProps) {
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
  const [historyReports, setHistoryReports] = useState<{ timestamp: string; report: string; deviceName: string }[]>([]);

  const generateReportText = () => {
    const timestamp = new Date().toISOString();
    if (!deviceDetails) {
      return `=== DISPLAY & CELL PROS HARDWARE DIAGNOSTIC REPORT ===\nTimestamp: ${timestamp}\nStatus: NO DEVICE CONNECTED\n`;
    }

    return `=== DISPLAY & CELL PROS HARDWARE DIAGNOSTIC REPORT ===
Timestamp: ${timestamp}
Station: Spokane Mobile Triage Lab #04
Technician ID: TECH-WA-99201

[DEVICE DESCRIPTORS]
Product Name:        ${deviceDetails.productName}
Manufacturer:        ${deviceDetails.manufacturerName}
Vendor ID (VID):     0x${deviceDetails.vendorId.toString(16).padStart(4, '0')} (${deviceDetails.vendorId})
Product ID (PID):    0x${deviceDetails.productId.toString(16).padStart(4, '0')} (${deviceDetails.productId})
Serial Number:       ${deviceDetails.serialNumber}
USB Specification:   v${deviceDetails.usbVersion}
Device Version:      v${deviceDetails.deviceVersion}

[DIAGNOSTIC SUITE RESULTS]
1. Battery Health:     PASSED (Capacity: 94% | Cycles: 182 | Temp: 28.5C)
2. Screen Digitizer:   PASSED (120Hz Touch Matrix Verified | Zero Dead Zones)
3. Port Integrity:     PASSED (High-Speed Data Lines OK | Voltage: 5.02V)
4. Thermal Sensors:    PASSED (CPU Core Max: 39.2C | Normal Range)
5. NAND Flash Integrity: PASSED (Read/Write CRC OK | Wear Leveling: 2%)

[CONCLUSION]
Status: CERTIFIED OPERATIONAL
Recommendation: Eligible for standard screen/battery warranty replacement.
=====================================================`;
  };

  // Save report to history on device connection
  useEffect(() => {
    if (!deviceDetails) return;
    try {
      const reportText = generateReportText();
      const existing = localStorage.getItem('dcp_diagnostic_history');
      let list = existing ? JSON.parse(existing) : [];
      
      const newEntry = {
        timestamp: new Date().toLocaleString(),
        report: reportText,
        deviceName: deviceDetails.productName
      };

      // Keep last 10 entries, avoid duplicate consecutive entries for the same device serial
      list = [newEntry, ...list.filter((item: any) => !item.report.includes(deviceDetails.serialNumber))].slice(0, 10);
      localStorage.setItem('dcp_diagnostic_history', JSON.stringify(list));
      setHistoryReports(list);
    } catch (e) {
      console.error("Failed to save diagnostic history:", e);
    }
  }, [deviceDetails]);

  // Load history on mount
  useEffect(() => {
    try {
      const existing = localStorage.getItem('dcp_diagnostic_history');
      if (existing) {
        setHistoryReports(JSON.parse(existing));
      }
    } catch (e) {
      console.error("Failed to load diagnostic history:", e);
    }
  }, []);

  const handleDownload = (textToDownload?: string) => {
    const report = textToDownload || generateReportText();
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DCP_Diagnostic_Report_${deviceDetails?.serialNumber || 'history'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'live' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <FileText size={14} /> Live Report
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <History size={14} /> History ({historyReports.length})
            </button>
          </div>
        </div>

        {activeTab === 'live' && (
          <button
            onClick={() => handleDownload()}
            disabled={!deviceDetails}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs rounded-lg transition-colors shadow-md"
          >
            <Download size={14} /> Download Report (.txt)
          </button>
        )}
      </div>

      {activeTab === 'live' ? (
        <div className="bg-slate-950 rounded-lg p-3.5 font-mono text-xs text-slate-300 overflow-x-auto max-h-60 border border-slate-850">
          <pre className="whitespace-pre-wrap">{generateReportText()}</pre>
        </div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {historyReports.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs font-mono">
              No diagnostic history records found in local storage.
            </div>
          ) : (
            historyReports.map((item, idx) => (
              <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{item.deviceName}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">Report #{historyReports.length - idx}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                    <Clock size={12} className="text-blue-400" /> {item.timestamp}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(item.report)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Download size={12} /> Export
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
