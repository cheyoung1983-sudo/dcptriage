"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  User, Database, AlertCircle, Wifi, Terminal, Activity,
  MapPin, Settings, ShieldCheck, Cpu, RefreshCw, Plus, FileText,
  Trash2, Mail, Eye, EyeOff, Globe, Server, Check, CheckCircle2,
  TrendingUp, DollarSign, Zap, ShoppingCart, ChevronUp, ChevronDown,
  LogOut, Search
} from 'lucide-react';
import { RdsDiagnosticPanel } from '../../components/RdsDiagnosticPanel';
import CacheManagement from '../../components/CacheManagement';
import { HardwareScanChart } from '../../components/HardwareScanChart';
import TicketTemplatesPanel from '../../components/TicketTemplatesPanel';
import { HardwareDiagnosticLogs } from '../../components/HardwareDiagnosticLogs';
import { HardwareDeepScan } from '../../components/HardwareDeepScan';
import { ToastContainer, Toast } from '../../components/ToastNotification';
import { RepairTicket, POSLog, QuoteResponse, TicketTemplate } from '@/lib/types';

export default function LabPortal() {
  const auth0User = { name: "Technician", email: "tech@displaycellpros.com", picture: "" };
  const isAuth0Loading = false;
  const auth0Error = null;

  // Toast notifications state
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((title: string, message: string, type: "success" | "error" | "info" | "warning") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // State from App.tsx
  const [labTab, setLabTab] = useState<"triage" | "pos" | "tax" | "postgres" | "settings">("triage");
  const [diagnosticMode, setDiagnosticMode] = useState<"standard" | "thinking" | "vision">("standard");

  // Device/Quote state
  const [deviceBrand, setDeviceBrand] = useState<string>("Apple");
  const [deviceModel, setDeviceModel] = useState<string>("iPhone 14 Pro Max");
  const [deviceTier, setDeviceTier] = useState<"flagship" | "midrange" | "budget">("flagship");
  const [issueType, setIssueType] = useState<"screen" | "battery" | "button">("screen");
  const [customerName, setCustomerName] = useState<string>("Jane Miller");
  const [zipInput, setZipInput] = useState<string>("98101");
  const [isCorporate, setIsCorporate] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>("");
  const [includeBatteryUpsell, setIncludeBatteryUpsell] = useState<boolean>(false);
  const [selectedTier, setSelectedTier] = useState<"budget" | "professional" | "authorized">("professional");

  const [isCalculatingQuote, setIsCalculatingQuote] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse>({
    tiers: {
      budget: { subtotal: 210, discountAmount: 0, calculatedTax: 21.73, grandTotal: 231.73, extras: ["Aftermarket Quality", "90-Day Warranty"] },
      professional: { subtotal: 327, discountAmount: 0, calculatedTax: 33.84, grandTotal: 360.84, extras: ["Premium Soft OLED", "Lifetime Warranty", "Free Protective Shield"] },
      authorized: { subtotal: 471, discountAmount: 0, calculatedTax: 48.75, grandTotal: 519.75, extras: ["Genuine OEM Parts", "Lifetime Warranty", "Free Protective Shield"] }
    },
    taxInfo: { zipCode: "98101", city: "Seattle", rate: 0.1035 },
    discountInfo: { applied: false, percentage: 15, company: "" }
  });

  // Triage / Scan state
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState("");
  const [isReportExpanded, setIsReportExpanded] = useState(true);
  const [groundingSources, setGroundingSources] = useState<any[]>([]);
  const [deepDiagnosticResult, setDeepDiagnosticResult] = useState("");
  const [isDeepDiagnosing, setIsDeepDiagnosing] = useState(false);
  const [thinkingPrompt, setThinkingPrompt] = useState("");
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState("");

  // POS / DB state
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [posLogs, setPosLogs] = useState<POSLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [ticketCreationSuccess, setTicketCreationSuccess] = useState(false);
  const [taxVerifiedMessage, setTaxVerifiedMessage] = useState("");
  const [isValidZip, setIsValidZip] = useState(true);
  const [taxCity, setTaxCity] = useState("Seattle");
  const [taxRate, setTaxRate] = useState(0.1035);
  const [isTaxLoading, setIsTaxLoading] = useState(false);

  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Real-time Tax Lookup Handler with Toast Feedback
  const handleTaxLookup = useCallback(async (zip: string) => {
    const cleanedZip = zip.trim();
    if (!cleanedZip || cleanedZip.length < 5) {
      setIsValidZip(false);
      setTaxVerifiedMessage("Enter a valid 5-digit US Zip Code");
      addToast("Invalid Zip Code", "Please enter a valid 5-digit US ZIP code.", "error");
      return;
    }

    setIsTaxLoading(true);
    try {
      const res = await fetch("/api/tax-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zipCode: cleanedZip })
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        setIsValidZip(true);
        setTaxCity(data.city);
        setTaxRate(data.rate);
        setTaxVerifiedMessage(data.message);
        addToast(
          "Tax Rate Verified",
          `${data.city} (${data.zipCode}): ${(data.rate * 100).toFixed(2)}% sales tax rate applied.`,
          "success"
        );
      } else {
        setIsValidZip(false);
        setTaxCity(data.city || "Unknown");
        setTaxRate(data.rate || 0);
        setTaxVerifiedMessage(data.message || "Invalid or out-of-state Washington zip code.");
        addToast(
          "Tax Lookup Alert",
          data.message || `No Washington sales tax rate found for ZIP ${cleanedZip}.`,
          "warning"
        );
      }
    } catch (err) {
      console.error("Tax lookup failed:", err);
      setIsValidZip(false);
      addToast("Tax Lookup Failed", "Unable to retrieve tax data from server.", "error");
    } finally {
      setIsTaxLoading(false);
    }
  }, [addToast]);

  // Handle Zip Input Change with debounced validation trigger
  const handleZipInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setZipInput(val);
    if (val.trim().length === 5) {
      handleTaxLookup(val);
    }
  };

  // Mock handlers
  const handleVerifyB2B = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
  };

  const fetchDynamicQuote = async () => {
    // Implement or fetch from API
  };

  // State for connected USB device details & deep scan modal
  const [usbDeviceDetails, setUsbDeviceDetails] = useState<{
    productName: string;
    manufacturerName: string;
    vendorId: number;
    productId: number;
    serialNumber: string;
    usbVersion: string;
    deviceVersion: string;
  } | null>(null);

  const [isDeepScanOpen, setIsDeepScanOpen] = useState(false);
  const [isUsbConnectedLive, setIsUsbConnectedLive] = useState(false);
  const [isBulkDiagnosticsEnabled, setIsBulkDiagnosticsEnabled] = useState(false);
  const [bulkQueue, setBulkQueue] = useState<string[]>([]);

  const startBulkDiagnostics = async () => {
    const nav = navigator as any;
    if (!nav.usb) {
      addToast("WebUSB Unsupported", "Your browser does not support WebUSB.", "error");
      return;
    }

    try {
      const devices = await nav.usb.getDevices();
      if (!devices || devices.length === 0) {
        addToast("No Bulk Devices", "No previously authorized devices found for bulk scan. Connect a device first.", "warning");
        return;
      }

      const names = devices.map((d: any) => d.productName || "Generic USB Device");
      setBulkQueue(names);
      setIsDeepScanOpen(true);
      addToast("Bulk Diagnostics Started", `Sequencing deep scan across ${devices.length} authorized devices.`, "info");
    } catch (e) {
      console.error("Bulk scan error:", e);
      addToast("Bulk Scan Failed", "Unable to enumerate devices.", "error");
    }
  };

  // Hydrate USB device details from localStorage, check navigator.usb.getDevices(), and attach connect/disconnect listeners
  useEffect(() => {
    try {
      const cached = localStorage.getItem('dcp_last_usb_device');
      if (cached) {
        const parsed = JSON.parse(cached);
        setUsbDeviceDetails(parsed);
        setIsUsbConnectedLive(true);
      }

      const nav = navigator as any;
      if (nav && nav.usb) {
        nav.usb.getDevices().then(async (devices: any[]) => {
          if (devices && devices.length > 0) {
            const matchedDevice = devices[0];
            try {
              if (!matchedDevice.opened) {
                await matchedDevice.open();
                if (matchedDevice.configuration === null && matchedDevice.configurations.length > 0) {
                  await matchedDevice.selectConfiguration(matchedDevice.configurations[0].configurationValue);
                }
              }

              const details = {
                productName: matchedDevice.productName || "Authorized USB Device",
                manufacturerName: matchedDevice.manufacturerName || "Generic Manufacturer",
                vendorId: matchedDevice.vendorId,
                productId: matchedDevice.productId,
                serialNumber: matchedDevice.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
                usbVersion: `${matchedDevice.usbVersionMajor}.${matchedDevice.usbVersionMinor}.${matchedDevice.usbVersionSubminor}`,
                deviceVersion: `${matchedDevice.deviceVersionMajor}.${matchedDevice.deviceVersionMinor}.${matchedDevice.deviceVersionSubminor}`
              };

              setUsbDeviceDetails(details);
              setIsUsbConnectedLive(true);
              localStorage.setItem('dcp_last_usb_device', JSON.stringify(details));
            } catch (autoErr) {
              console.warn("Could not auto-open authorized USB device:", autoErr);
            }
          }
        }).catch((err: any) => {
          console.warn("Error calling getDevices:", err);
        });

        // Real-time USB disconnect & connect listeners
        const handleDisconnect = (event: any) => {
          console.warn("USB Device Disconnected:", event.device);
          setIsUsbConnectedLive(false);
          addToast("USB Disconnected", `Device ${event.device.productName || ""} was unplugged.`, "warning");
        };

        const handleConnect = (event: any) => {
          console.log("USB Device Connected:", event.device);
          setIsUsbConnectedLive(true);
          addToast("USB Connected", `Device ${event.device.productName || ""} attached.`, "success");
        };

        nav.usb.addEventListener('disconnect', handleDisconnect);
        nav.usb.addEventListener('connect', handleConnect);

        return () => {
          nav.usb.removeEventListener('disconnect', handleDisconnect);
          nav.usb.removeEventListener('connect', handleConnect);
        };
      }
    } catch (e) {
      console.error("Failed to load cached USB device:", e);
    }
  }, [addToast]);

  const clearUsbCache = () => {
    try {
      localStorage.removeItem('dcp_last_usb_device');
      setUsbDeviceDetails(null);
      setIsUsbConnectedLive(false);
      addToast("USB Cache Cleared", "Forgotten last connected USB device.", "info");
    } catch (e) {
      console.error("Failed to clear USB cache:", e);
    }
  };

  const startPhysicalUsbScan = async () => {
    const nav = navigator as any;
    if (!nav.usb) {
      addToast("WebUSB Unsupported", "Your browser does not support WebUSB.", "error");
      return;
    }

    setIsScanning(true);
    setScanStep("Requesting device access...");

    try {
      // Prompt user to select a device
      const device = await nav.usb.requestDevice({ filters: [] });
      setScanStep(`Opening connection to ${device.productName || "Unknown Device"}...`);
      
      try {
        await device.open();
        if (device.configuration === null && device.configurations.length > 0) {
          await device.selectConfiguration(device.configurations[0].configurationValue);
        }
      } catch (openErr) {
        console.warn("Could not open device or select configuration (permission or already open):", openErr);
      }

      const details = {
        productName: device.productName || "Unknown USB Device",
        manufacturerName: device.manufacturerName || "Generic Manufacturer",
        vendorId: device.vendorId,
        productId: device.productId,
        serialNumber: device.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        usbVersion: `${device.usbVersionMajor}.${device.usbVersionMinor}.${device.usbVersionSubminor}`,
        deviceVersion: `${device.deviceVersionMajor}.${device.deviceVersionMinor}.${device.deviceVersionSubminor}`
      };

      setUsbDeviceDetails(details);
      setIsUsbConnectedLive(true);
      setHasScanned(true);
      setScanProgress(100);

      // Save to localStorage
      try {
        localStorage.setItem('dcp_last_usb_device', JSON.stringify(details));
      } catch (storageErr) {
        console.warn("Failed to save USB device to localStorage:", storageErr);
      }

      addToast("Hardware Connected", `Successfully connected to ${details.productName} (VID: 0x${details.vendorId.toString(16).padStart(4, '0')} | PID: 0x${details.productId.toString(16).padStart(4, '0')}).`, "success");
      
      // Automatically trigger AI diagnostic analysis and open HardwareDeepScan modal
      setDeviceModel(details.productName);
      setIsDeepScanOpen(true);
      addToast("AI Diagnostic Triggered", `Running automated diagnostics for ${details.productName}...`, "info");
      
    } catch (err) {
      console.error("USB scan failed:", err);
      addToast("Scan Cancelled/Failed", "Unable to connect or retrieve device descriptors.", "error");
    } finally {
      setIsScanning(false);
      setScanStep("");
    }
  };

  const downloadPdfReport = () => {};
  const shareReportViaEmail = () => {};
  const createOfficialTicket = async () => {};
  const clearChatLogs = () => setMessages([]);
  const handleSendTriageChat = async (e: any, text?: string) => {};
  const handleRunThinkingDiagnostic = async (e: any) => {};
  const handleVisionDiagnostic = async () => {};
  const handleImageUploadChange = (e: any) => {};
  const fetchPOSLogs = async () => {};
  const handleApplyTemplate = (t: TicketTemplate) => {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Technician Authentication Status bar */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Authed: Technician
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-sm font-mono uppercase tracking-wider font-extrabold border border-emerald-500/30">LAB SESSION LOCKED</span>
            </h3>
            <p className="text-xs text-slate-400">
              Logged in with local technician credential. Backing up active Spokane WA tickets.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Offline mode: Logout disabled')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-600 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Disconnect
          </button>
        </div>
      </div>

      {/* Header section representing Lab identity */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest font-mono">D&CP INTELLIGENT LABORATORY INTERFACE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Interactive Diagnostics Lab Dashboard</h1>
          <p className="text-sm text-slate-400">Manage virtual hardware checks, Washington dest-tax compliance calculations, and live POS sync registries.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className={`border px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 ${isUsbConnectedLive ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-red-950/60 border-red-500/40 text-red-300'}`}>
            {isUsbConnectedLive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold">USB Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                <span className="font-bold">USB Disconnected</span>
              </>
            )}
          </div>
          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-400">Sync:</span> <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>
          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-3">
            <span className="text-slate-400">Latency:</span> <span className="text-blue-400 font-bold">12ms</span>
          </div>
          <button
            onClick={() => {
              const next = !isBulkDiagnosticsEnabled;
              setIsBulkDiagnosticsEnabled(next);
              if (next) startBulkDiagnostics();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all border flex items-center gap-2 ${isBulkDiagnosticsEnabled ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'}`}
          >
            <Cpu size={14} className={isBulkDiagnosticsEnabled ? 'animate-spin' : ''} />
            Bulk Diagnostics: {isBulkDiagnosticsEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-stretch">
        <aside className="col-span-12 lg:col-span-3 bg-slate-850/60 border border-slate-800 rounded-xl p-4 flex flex-col space-y-5">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 font-mono">Device Hardware Analyzer</p>
            <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 space-y-4 shadow-inner">
              <button
                type="button"
                disabled={isScanning}
                onClick={startPhysicalUsbScan}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-750 disabled:from-slate-700 disabled:to-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-lg"
              >
                {isScanning ? "PROBING HARDWARE..." : "🔌 Connect Phone (Cable)"}
              </button>

              {usbDeviceDetails && (
                <div className="mt-4 p-3 bg-slate-950 border border-cyan-500/30 rounded-lg text-xs space-y-2 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-cyan-400 font-mono">USB Connected</span>
                    <button
                      onClick={clearUsbCache}
                      className="text-[10px] text-slate-400 hover:text-red-400 underline font-mono cursor-pointer"
                      title="Clear cached device info"
                    >
                      Forget Device
                    </button>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="text-slate-300 truncate"><span className="text-slate-500">Device:</span> {usbDeviceDetails.productName}</div>
                    <div className="text-slate-300 truncate"><span className="text-slate-500">Mfr:</span> {usbDeviceDetails.manufacturerName}</div>
                    <div className="text-slate-300"><span className="text-slate-500">VID:</span> <span className="text-emerald-400">0x{usbDeviceDetails.vendorId.toString(16).padStart(4, '0')}</span></div>
                    <div className="text-slate-300"><span className="text-slate-500">PID:</span> <span className="text-emerald-400">0x{usbDeviceDetails.productId.toString(16).padStart(4, '0')}</span></div>
                    <div className="text-slate-300 truncate"><span className="text-slate-500">SN:</span> {usbDeviceDetails.serialNumber}</div>
                    <div className="text-slate-300"><span className="text-slate-500">USB Spec:</span> v{usbDeviceDetails.usbVersion}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <nav className="space-y-1">
            <button onClick={() => setLabTab("triage")} className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold ${labTab === "triage" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>
              <div className="flex items-center gap-2"><Terminal className="w-4 h-4" /> AI Diagnostic Console</div>
            </button>
            <button onClick={() => setLabTab("pos")} className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold ${labTab === "pos" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>
              <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> POS Ledger & Sync</div>
            </button>
            <button onClick={() => setLabTab("tax")} className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold ${labTab === "tax" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> WA Tax Agent</div>
            </button>
          </nav>

          <TicketTemplatesPanel onApplyTemplate={handleApplyTemplate} />
        </aside>

        <div className="col-span-12 lg:col-span-9">
          {labTab === "triage" && (
            <div className="space-y-6">
              <section className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
                 <h2 className="text-xl font-bold text-white mb-4">Strategic Value Matrix</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Budget */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <h4 className="text-slate-400 text-xs font-bold uppercase mb-2">Budget</h4>
                      <div className="text-2xl font-bold">${quote.tiers.budget.grandTotal.toFixed(2)}</div>
                    </div>
                    {/* Professional */}
                    <div className="bg-blue-600/10 p-4 rounded-xl border-2 border-blue-500 scale-105 shadow-2xl">
                      <h4 className="text-blue-400 text-xs font-bold uppercase mb-2">Professional</h4>
                      <div className="text-3xl font-bold text-white">${quote.tiers.professional.grandTotal.toFixed(2)}</div>
                    </div>
                    {/* Authorized */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <h4 className="text-slate-400 text-xs font-bold uppercase mb-2">Authorized</h4>
                      <div className="text-2xl font-bold">${quote.tiers.authorized.grandTotal.toFixed(2)}</div>
                    </div>
                 </div>
              </section>
              <HardwareScanChart deviceBrand={deviceBrand} deviceModel={deviceModel} issueType={issueType} />
              <HardwareDiagnosticLogs deviceDetails={usbDeviceDetails} />
            </div>
          )}

          {labTab === "postgres" && <RdsDiagnosticPanel />}
          {labTab === "settings" && <CacheManagement onAddToast={() => {}} />}
        </div>
      </div>

      <HardwareDeepScan
        isOpen={isDeepScanOpen}
        onClose={() => setIsDeepScanOpen(false)}
        deviceName={usbDeviceDetails?.productName || deviceModel}
      />
    </div>
  );
}
