import './globals.css';

export const metadata = {
  title: 'Display & Cell Pros | Hardware Diagnostics Workstation',
  description: 'Military-grade hardware triage, WebUSB telemetry, and Right-to-Repair compliance workstation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
