'use client';

import { useState, useEffect, useCallback } from 'react';
import { UsbDeviceDetails } from '@/types';

// Standard Android ADB Interface: Class 255 (0xFF), SubClass 66 (0x42), Protocol 1 (0x01)
const ANDROID_ADB_FILTERS = [
  { classCode: 255, subclassCode: 66, protocolCode: 1 },
  { vendorId: 0x18d1 }, // Google Nexus / Pixel
  { vendorId: 0x04e8 }, // Samsung Mobile
  { vendorId: 0x2717 }, // Xiaomi
  { vendorId: 0x2a70 }, // OnePlus / Oppo
  { vendorId: 0x05c6 }, // Qualcomm Diagnostic
  { vendorId: 0x1004 }, // LG
  { vendorId: 0x0fce }, // Sony
  { vendorId: 0x22b8 }, // Motorola
  { vendorId: 0x12d1 }, // Huawei
  { vendorId: 0x0bb4 }, // HTC
];

export function useWebUsb() {
  const [usbDeviceDetails, setUsbDeviceDetails] = useState<UsbDeviceDetails | null>(null);
  const [isUsbConnectedLive, setIsUsbConnectedLive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDisconnectedUnexpectedly, setIsDisconnectedUnexpectedly] = useState(false);
  const [isAdbLocked, setIsAdbLocked] = useState(false);
  const [usbErrorMessage, setUsbErrorMessage] = useState<string | null>(null);

  const resetAdbLock = useCallback(() => {
    setIsAdbLocked(false);
    setUsbErrorMessage(null);
  }, []);

  const handleClearCache = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dcp_last_usb_device');
      }
      setUsbDeviceDetails(null);
      setIsUsbConnectedLive(false);
      setIsDisconnectedUnexpectedly(false);
      setIsAdbLocked(false);
      setUsbErrorMessage(null);
    } catch (e) {
      console.error("Failed to clear USB cache:", e);
    }
  }, []);

  const connectUsb = useCallback(async () => {
    if (typeof window === 'undefined') return undefined;

    const nav = navigator as any;
    if (!nav.usb) {
      setUsbErrorMessage("WebUSB is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return undefined;
    }

    setIsScanning(true);
    resetAdbLock();

    try {
      let device: any;

      // 1. First attempt to request with Android ADB and common vendor filters
      try {
        device = await nav.usb.requestDevice({ filters: ANDROID_ADB_FILTERS });
      } catch (filteredErr: any) {
        // If filtered request was cancelled or failed, try open filter
        if (filteredErr.name === 'NotFoundError') {
          // Fallback to open filter so technicians can select any USB prober or device
          device = await nav.usb.requestDevice({ filters: [] });
        } else {
          throw filteredErr;
        }
      }

      if (!device) {
        setIsScanning(false);
        return undefined;
      }

      // 2. Open device connection
      try {
        await device.open();
      } catch (openErr: any) {
        const errStr = (openErr?.message || String(openErr)).toLowerCase();
        const errName = openErr?.name || '';

        if (
          errName === 'SecurityError' ||
          errName === 'NetworkError' ||
          errStr.includes('access denied') ||
          errStr.includes('busy') ||
          errStr.includes('claim') ||
          errStr.includes('failed to open')
        ) {
          setIsAdbLocked(true);
          setUsbErrorMessage("Windows ADB daemon is holding an exclusive lock on this USB device. Run 'adb kill-server' in Windows CMD or PowerShell, then retry.");
          return undefined;
        }
        throw openErr;
      }

      // 3. Select configuration if not already selected
      if (device.configuration === null && device.configurations.length > 0) {
        try {
          await device.selectConfiguration(device.configurations[0].configurationValue);
        } catch (configErr) {
          console.warn("Could not select configuration:", configErr);
        }
      }

      // 4. Inspect configurations to identify and claim ADB interface
      let adbInterfaceNumber: number | undefined;
      let endpointsCount = 0;
      let isAndroidAdb = false;

      if (device.configuration && device.configuration.interfaces) {
        for (const iface of device.configuration.interfaces) {
          for (const alt of iface.alternates) {
            // Android ADB specification: Class 255 (0xFF), Subclass 66 (0x42), Protocol 1 (0x01)
            if (alt.interfaceClass === 255 && alt.interfaceSubclass === 66 && alt.interfaceProtocol === 1) {
              adbInterfaceNumber = iface.interfaceNumber;
              endpointsCount = alt.endpoints?.length || 0;
              isAndroidAdb = true;
              break;
            }
          }
          if (adbInterfaceNumber !== undefined) break;
        }

        // 5. Claim the ADB interface
        if (adbInterfaceNumber !== undefined) {
          try {
            await device.claimInterface(adbInterfaceNumber);
          } catch (claimErr: any) {
            const claimStr = (claimErr?.message || String(claimErr)).toLowerCase();
            if (
              claimErr.name === 'SecurityError' ||
              claimErr.name === 'NetworkError' ||
              claimStr.includes('busy') ||
              claimStr.includes('access denied')
            ) {
              setIsAdbLocked(true);
              setUsbErrorMessage("Android ADB interface is claimed by host adb.exe. Run 'adb kill-server' to release the lock, then reconnect.");
            }
          }
        }
      }

      const details: UsbDeviceDetails = {
        productName: device.productName || (isAndroidAdb ? "Android ADB Telemetry Node" : "Probed USB Diagnostic Device"),
        manufacturerName: device.manufacturerName || (isAndroidAdb ? "Android Device" : "Generic Hardware"),
        vendorId: device.vendorId,
        productId: device.productId,
        serialNumber: device.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        usbVersion: `${device.usbVersionMajor ?? 2}.${device.usbVersionMinor ?? 0}.${device.usbVersionSubminor ?? 0}`,
        deviceVersion: `${device.deviceVersionMajor ?? 1}.${device.deviceVersionMinor ?? 0}.${device.deviceVersionSubminor ?? 0}`,
        adbClaimed: adbInterfaceNumber !== undefined,
        interfaceNumber: adbInterfaceNumber,
        endpointsCount,
        isAndroidAdb
      };

      setUsbDeviceDetails(details);
      setIsUsbConnectedLive(true);
      setIsDisconnectedUnexpectedly(false);
      setIsAdbLocked(false);
      setUsbErrorMessage(null);

      if (typeof window !== 'undefined') {
        localStorage.setItem('dcp_last_usb_device', JSON.stringify(details));
      }

      return details;
    } catch (err: any) {
      console.warn("USB probe error:", err);
      const errMsg = err?.message || String(err);
      const errName = err?.name || '';

      if (errName === 'NotFoundError') {
        // User cancelled picker dialog
        setUsbErrorMessage(null);
      } else if (
        errName === 'SecurityError' ||
        errName === 'NetworkError' ||
        errMsg.toLowerCase().includes('access denied') ||
        errMsg.toLowerCase().includes('busy')
      ) {
        setIsAdbLocked(true);
        setUsbErrorMessage("Windows ADB daemon (adb.exe) is holding exclusive access. Execute 'adb kill-server' in your terminal and retry.");
      } else {
        setUsbErrorMessage(errMsg);
      }
      return undefined;
    } finally {
      setIsScanning(false);
    }
  }, [resetAdbLock]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const cached = localStorage.getItem('dcp_last_usb_device');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setUsbDeviceDetails(parsed);
          setIsUsbConnectedLive(true);
        } catch {
          // Ignore invalid cache
        }
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

              let adbInterfaceNumber: number | undefined;
              let endpointsCount = 0;
              let isAndroidAdb = false;

              if (matchedDevice.configuration && matchedDevice.configuration.interfaces) {
                for (const iface of matchedDevice.configuration.interfaces) {
                  for (const alt of iface.alternates) {
                    if (alt.interfaceClass === 255 && alt.interfaceSubclass === 66 && alt.interfaceProtocol === 1) {
                      adbInterfaceNumber = iface.interfaceNumber;
                      endpointsCount = alt.endpoints?.length || 0;
                      isAndroidAdb = true;
                      break;
                    }
                  }
                  if (adbInterfaceNumber !== undefined) break;
                }

                if (adbInterfaceNumber !== undefined) {
                  try {
                    await matchedDevice.claimInterface(adbInterfaceNumber);
                  } catch {
                    // Interface may be locked
                  }
                }
              }

              const details: UsbDeviceDetails = {
                productName: matchedDevice.productName || (isAndroidAdb ? "Android ADB Device" : "Authorized USB Device"),
                manufacturerName: matchedDevice.manufacturerName || (isAndroidAdb ? "Android Device" : "Generic Manufacturer"),
                vendorId: matchedDevice.vendorId,
                productId: matchedDevice.productId,
                serialNumber: matchedDevice.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
                usbVersion: `${matchedDevice.usbVersionMajor ?? 2}.${matchedDevice.usbVersionMinor ?? 0}.${matchedDevice.usbVersionSubminor ?? 0}`,
                deviceVersion: `${matchedDevice.deviceVersionMajor ?? 1}.${matchedDevice.deviceVersionMinor ?? 0}.${matchedDevice.deviceVersionSubminor ?? 0}`,
                adbClaimed: adbInterfaceNumber !== undefined,
                interfaceNumber: adbInterfaceNumber,
                endpointsCount,
                isAndroidAdb
              };

              setUsbDeviceDetails(details);
              setIsUsbConnectedLive(true);
              setIsDisconnectedUnexpectedly(false);
              localStorage.setItem('dcp_last_usb_device', JSON.stringify(details));
            } catch (autoErr) {
              console.warn("Could not auto-open USB device:", autoErr);
            }
          }
        }).catch((err: any) => {
          console.warn("Error calling getDevices:", err);
        });

        const handleDisconnect = () => {
          setIsUsbConnectedLive(false);
          setIsDisconnectedUnexpectedly(true);
        };

        const handleConnect = (e: any) => {
          const newDev = e.device;
          const cached = localStorage.getItem('dcp_last_usb_device');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed.vendorId === newDev.vendorId && parsed.productId === newDev.productId) {
                setIsUsbConnectedLive(true);
                setIsDisconnectedUnexpectedly(false);
              }
            } catch (err) {
              console.warn("Error checking reconnect match:", err);
            }
          }
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
  }, []);

  return {
    usbDeviceDetails,
    isUsbConnectedLive,
    isScanning,
    isDisconnectedUnexpectedly,
    isAdbLocked,
    usbErrorMessage,
    connectUsb,
    handleClearCache,
    resetAdbLock
  };
}
