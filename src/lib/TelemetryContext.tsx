'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { UsbDeviceDetails } from '@/types';
import { useWebUsb } from '@/hooks/useWebUsb';

export interface TelemetryPoint {
  time: string;
  voltage: number;
  current: number;
  power: number;
  temperature: number;
  pdProfile: string;
}

export interface TelemetryContextType {
  usbDeviceDetails: UsbDeviceDetails | null;
  isUsbConnected: boolean;
  isScanning: boolean;
  isDisconnectedUnexpectedly: boolean;
  isAdbLocked: boolean;
  usbErrorMessage: string | null;
  resetAdbLock: () => void;
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
  clearHistory: () => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const {
    usbDeviceDetails,
    isUsbConnectedLive,
    isScanning,
    isDisconnectedUnexpectedly,
    isAdbLocked,
    usbErrorMessage,
    connectUsb,
    handleClearCache,
    resetAdbLock
  } = useWebUsb();

  const [pdProfile, setPdProfile] = useState<'5V_STANDARD' | '9V_FAST' | '20V_MACBOOK' | 'SHORT_GROUND'>('9V_FAST');
  const [isStreaming, setIsStreaming] = useState(true);
  const [currentVoltage, setCurrentVoltage] = useState(9.02);
  const [currentAmps, setCurrentAmps] = useState(1.84);
  const [internalTemp, setInternalTemp] = useState(34.2);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Client-side initial history seed
  useEffect(() => {
    setTelemetryHistory((prev) => {
      if (prev.length > 0) return prev;
      const initial: TelemetryPoint[] = [];
      const now = Date.now();
      for (let i = 25; i >= 0; i--) {
        const d = new Date(now - i * 1000);
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const v = Number((9.0 + (Math.random() * 0.06 - 0.03)).toFixed(2));
        const a = Number((1.8 + (Math.random() * 0.08 - 0.04)).toFixed(2));
        const p = Number((v * a).toFixed(2));
        const temp = Number((34.0 + (Math.random() * 0.4 - 0.2)).toFixed(1));
        initial.push({
          time: timeStr,
          voltage: v,
          current: a,
          power: p,
          temperature: temp,
          pdProfile: '9V PD Fast Charge'
        });
      }
      return initial;
    });
  }, []);

  const clearHistory = () => {
    setTelemetryHistory([]);
  };

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

      let nextTemp = internalTemp;
      if (pdProfile === 'SHORT_GROUND') {
        nextTemp = Math.min(68, Number((internalTemp + 0.4).toFixed(1)));
      } else {
        nextTemp = Math.max(31, Number((internalTemp + (Math.random() * 0.2 - 0.1)).toFixed(1)));
      }
      setInternalTemp(nextTemp);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setTelemetryHistory((prev) => {
        const next = [
          ...prev,
          {
            time: timeStr,
            voltage: v,
            current: a,
            power: p,
            temperature: nextTemp,
            pdProfile: label
          }
        ];
        if (next.length > 120) next.shift();
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStreaming, pdProfile, internalTemp]);

  const value: TelemetryContextType = {
    usbDeviceDetails,
    isUsbConnected: isUsbConnectedLive,
    isScanning,
    isDisconnectedUnexpectedly,
    isAdbLocked,
    usbErrorMessage,
    resetAdbLock,
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
    setIsStreaming,
    clearHistory
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
