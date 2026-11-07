'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-2 font-mono">Something went wrong!</h1>
        <p className="text-slate-400 mb-6">{error.message || 'An unexpected error occurred.'}</p>
        <div className="flex gap-4">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm font-mono"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition font-medium text-sm font-mono"
          >
            Return Home
          </a>
        </div>
      </body>
    </html>
  );
}
