'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { UsbDeviceDetails } from '@/types';
import { useWebUsb } from '@/hooks/useWebUsb';

interface TelemetryPoint {
  time: string;
  voltage: number;
  current: number;
  power: number;
  pdProfile: string;
}

interface TelemetryContextType {
  usbDeviceDetails: UsbDeviceDetails | null;
  isUsbConnected: boolean;
  isScanning: boolean;
  isDisconnectedUnexpectedly: boolean;
  connectUsb: () => Promise<UsbDeviceDetails | undefined>;
  disconnectUsb: () => void;
  
  // Telemetry Data
  currentVoltage: number;
  currentAmps: number;
  currentPower: number;
  internalTemp: number;
  telemetryHistory: TelemetryPoint[];
  pdProfile: '5V_STANDARD' | '9V_FAST' | '20V_MACBOOK' | 'SHORT_GROUND';
  setPdProfile: (profile: '5V_STANDARD' | '9V_FAST' | '20V_MACBOOK' | 'SHORT_GROUND') => void;
  isStreaming: boolean;
  setIsStreaming: (is: boolean) => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const {
    usbDeviceDetails,
    isUsbConnectedLive,
    isScanning,
    isDisconnectedUnexpectedly,
    connectUsb,
    handleClearCache
  } = useWebUsb();

  const [pdProfile, setPdProfile] = useState<'5V_STANDARD' | '9V_FAST' | '20V_MACBOOK' | 'SHORT_GROUND'>('9V_FAST');
  const [isStreaming, setIsStreaming] = useState(true);
  const [currentVoltage, setCurrentVoltage] = useState(9.02);
  const [currentAmps, setCurrentAmps] = useState(1.84);
  const [internalTemp, setInternalTemp] = useState(34.2);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isStreaming) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      let targetV = 9.0;
      let targetA = 1.8;
      let label = '9V PD Fast Charge';

      if (pdProfile === '5V_STANDARD') {
        targetV = 5.10;
        targetA = 0.45;
        label = '5V Standard Legacy';
      } else if (pdProfile === '20V_MACBOOK') {
        targetV = 19.85;
        targetA = 3.25;
        label = '20V USB-PD High Wattage';
      } else if (pdProfile === 'SHORT_GROUND') {
        targetV = 2.15;
        targetA = 4.85;
        label = 'SHORT CIRCUIT DETECTED';
      }

      const noiseV = (Math.random() * 0.06 - 0.03);
      const noiseA = (Math.random() * 0.08 - 0.04);

      const v = Math.max(0, Number((targetV + noiseV).toFixed(2)));
      const a = Math.max(0, Number((targetA + noiseA).toFixed(2)));
      const p = Number((v * a).toFixed(2));

      setCurrentVoltage(v);
      setCurrentAmps(a);

      if (pdProfile === 'SHORT_GROUND') {
        setInternalTemp((prev) => Math.min(68, Number((prev + 0.4).toFixed(1))));
      } else {
        setInternalTemp((prev) => Math.max(31, Number((prev + (Math.random() * 0.2 - 0.1)).toFixed(1))));
      }

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setTelemetryHistory((prev) => {
        const next = [...prev, { time: timeStr, voltage: v, current: a, power: p, pdProfile: label }];
        if (next.length > 300) next.shift();
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStreaming, pdProfile]);

  const value: TelemetryContextType = {
    usbDeviceDetails,
    isUsbConnected: isUsbConnectedLive,
    isScanning,
    isDisconnectedUnexpectedly,
    connectUsb,
    disconnectUsb: handleClearCache,
    currentVoltage,
    currentAmps,
    currentPower: Number((currentVoltage * currentAmps).toFixed(2)),
    internalTemp,
    telemetryHistory,
    pdProfile,
    setPdProfile,
    isStreaming,
    setIsStreaming
  };

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (context === undefined) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
}
