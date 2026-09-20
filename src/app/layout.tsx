import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { LayoutWrapper } from "../components/LayoutWrapper";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Display & Cell Pros | Mobile Device Repair & Diagnostic Lab Spokane",
  description: "Spokane's premier mobile technical device repair laboratory. Professional on-site screen renewals, battery replacements, and hardware diagnostics in Spokane, WA. Combat-veteran owned, Right-to-Repair compliant.",
  keywords: "phone repair spokane, phone diagnostic lab, mobile screen repair, battery replacement spokane, iphone repair spokane, galaxy repair spokane, right to repair spokane, mobile electronics lab spokane, device diagnostic, tablet repair spokane valley, display cell pros",
  authors: [{ name: "Display & Cell Pros LLC" }],
  manifest: "/manifest.json",
  other: {
    "geo.region": "US-WA",
    "geo.placename": "Spokane",
    "geo.position": "47.6588;-117.4260",
    "ICBM": "47.6588, -117.4260",
  },
  openGraph: {
    type: "website",
    title: "Display & Cell Pros | Mobile Device Repair & Diagnostic Lab",
    description: "Professional, on-site device hardware triage & certified repairs delivered straight to your location in Spokane and Spokane Valley. Combat-veteran owned.",
    url: "https://www.displaycellpros.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Display & Cell Pros | Mobile Lab Spokane",
    description: "Professional on-site device diagnostics and repair solutions. Screen, battery, and micro-soldering delivered straight to you in Spokane, WA.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetBrainsMono.variable} ${inter.variable}`}>
      <body className="bg-slate-50 text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <SpeedInsights />
      </body>
    </html>
  );
}
