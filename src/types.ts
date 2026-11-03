/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

export enum ServiceTier {
  TIER_1_POWER = 'TIER_1_POWER',
  TIER_2_DISPLAY = 'TIER_2_DISPLAY',
  TIER_3_BOARD = 'TIER_3_BOARD',
}

export enum Manufacturer {
  APPLE = 'APPLE',
  SAMSUNG = 'SAMSUNG',
  OTHER = 'OTHER',
}

export const TelemetrySchema = z.object({
  batteryHealthPercentage: z.number().min(0).max(100),
  batteryTempCelsius: z.number().max(45.0, 'Thermal lockout: Battery temperature exceeds 45.0°C safety threshold'),
  ammeterDrawAmps: z.number().min(0.0).max(10.0),
  isShortToGround: z.boolean(),
});

export type TelemetryData = z.infer<typeof TelemetrySchema>;

export interface UsbDeviceDetails {
  productName: string;
  manufacturerName: string;
  vendorId: number;
  productId: number;
  serialNumber: string;
  usbVersion: string;
  deviceVersion: string;
  adbClaimed?: boolean;
  interfaceNumber?: number;
  endpointsCount?: number;
  isAndroidAdb?: boolean;
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  category: string;
  notes?: string;
  timestamp: string;
}

export interface GitHubCLIExecResult {
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
  timestamp: string;
  durationMs?: number;
}

export interface GitHubSourceInstallSection {
  id: string;
  title: string;
  platform: 'all' | 'unix' | 'windows' | 'cross';
  description: string;
  prerequisites?: string[];
  commands: {
    command: string;
    comment: string;
    explain?: string;
  }[];
  notes?: string[];
}

export interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  created: number;
  state: 'READY' | 'BUILDING' | 'ERROR' | 'QUEUED' | 'CANCELED' | string;
  inspectorUrl?: string;
  meta?: {
    githubCommitMessage?: string;
    githubCommitRef?: string;
    githubCommitSha?: string;
  };
  creator?: {
    username?: string;
    email?: string;
  };
}

export interface VercelProject {
  id: string;
  name: string;
  framework?: string;
  updatedAt?: number;
  latestDeployments?: VercelDeployment[];
  targets?: {
    production?: {
      url?: string;
      readyState?: string;
    };
  };
}

export interface VercelDomain {
  name: string;
  verified: boolean;
  apexName?: string;
  configuredBy?: string;
  createdAt?: number;
}

export interface VercelStatusResponse {
  configured: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
    name?: string;
  } | null;
  teamId?: string;
  projectId?: string;
  error?: string;
}

export const IntakeFormSchema = z.object({
  deviceManufacturer: z.nativeEnum(Manufacturer),
  deviceModel: z.string().min(2, 'Device model is required'),
  imei: z.string().regex(/^[0-9]{15}$/, 'IMEI must be exactly 15 numeric digits'),
  serviceTier: z.nativeEnum(ServiceTier),
  selectedVariantId: z.string().optional(),
  customerReportedIssue: z.string().min(10, 'Please provide a detailed description of the issue'),
  devicePasscode: z.string().optional(),
  telemetry: TelemetrySchema,
  waR2rPrivacyAcknowledged: z.boolean().refine(v => v === true, 'Privacy acknowledgement required'),
  waR2rDataBackupAcknowledged: z.boolean().refine(v => v === true, 'Data backup acknowledgement required'),
  waR2rPartsProvenanceAcknowledged: z.boolean().refine(v => v === true, 'Parts provenance acknowledgement required'),
  customerEmail: z.string().email('Valid email required'),
  customerName: z.string().min(2, 'Full name required'),
  customerPhone: z.string().min(10, 'Valid phone number required'),
  destinationZipCode: z.string().regex(/^[0-9]{5}$/, '5-digit Washington ZIP code required'),
});

export type IntakeFormData = z.infer<typeof IntakeFormSchema>;
