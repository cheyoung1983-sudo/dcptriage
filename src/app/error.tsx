'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-4">
      <h1 className="text-3xl font-bold mb-2">Something went wrong!</h1>
      <p className="text-slate-600 mb-6">{error.message || 'An unexpected error occurred.'}</p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Try again
        </button>
        <Link href="/" className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition">
          Return Home
        </Link>
      </div>
    </div>
  );
}
