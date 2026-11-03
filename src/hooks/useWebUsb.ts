'use client';

import { useState, useEffect, useCallback } from 'react';
import { UsbDeviceDetails } from '@/types';

export function useWebUsb() {
  const [usbDeviceDetails, setUsbDeviceDetails] = useState<UsbDeviceDetails | null>(null);
  const [isUsbConnectedLive, setIsUsbConnectedLive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDisconnectedUnexpectedly, setIsDisconnectedUnexpectedly] = useState(false);

  const handleClearCache = useCallback(() => {
    try {
      localStorage.removeItem('dcp_last_usb_device');
      setUsbDeviceDetails(null);
      setIsUsbConnectedLive(false);
      setIsDisconnectedUnexpectedly(false);
    } catch (e) {
      console.error("Failed to clear USB cache:", e);
    }
  }, []);

  const connectUsb = useCallback(async () => {
    const nav = navigator as any;
    if (!nav.usb) {
      alert("Your browser does not support WebUSB.");
      return;
    }

    setIsScanning(true);
    try {
      const device = await nav.usb.requestDevice({ filters: [] });
      try {
        await device.open();
        if (device.configuration === null && device.configurations.length > 0) {
          await device.selectConfiguration(device.configurations[0].configurationValue);
        }
      } catch (openErr) {
        console.warn("Could not open device:", openErr);
      }

      const details: UsbDeviceDetails = {
        productName: device.productName || "Probed USB Device",
        manufacturerName: device.manufacturerName || "Generic Hardware",
        vendorId: device.vendorId,
        productId: device.productId,
        serialNumber: device.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        usbVersion: `${device.usbVersionMajor}.${device.usbVersionMinor}.${device.usbVersionSubminor}`,
        deviceVersion: `${device.deviceVersionMajor}.${device.deviceVersionMinor}.${device.deviceVersionSubminor}`
      };

      setUsbDeviceDetails(details);
      setIsUsbConnectedLive(true);
      setIsDisconnectedUnexpectedly(false);
      localStorage.setItem('dcp_last_usb_device', JSON.stringify(details));
      
      return details;
    } catch (err) {
      console.warn("USB probe cancelled or failed:", err);
    } finally {
      setIsScanning(false);
    }
  }, []);

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

              const details: UsbDeviceDetails = {
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
              setIsDisconnectedUnexpectedly(false);
              localStorage.setItem('dcp_last_usb_device', JSON.stringify(details));
            } catch (autoErr) {
              console.warn("Could not auto-open USB device:", autoErr);
            }
          }
        }).catch((err: any) => {
          console.warn("Error calling getDevices:", err);
        });

        const handleDisconnect = (e: any) => {
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
    connectUsb,
    handleClearCache
  };
}
