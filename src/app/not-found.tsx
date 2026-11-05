import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4">
      <h1 className="text-4xl font-bold mb-2 font-mono">404 - Page Not Found</h1>
      <p className="text-slate-400 mb-6">The requested diagnostic resource or page does not exist.</p>
      <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium font-mono text-sm">
        Return to Diagnostics Hub
      </Link>
    </div>
  );
}
