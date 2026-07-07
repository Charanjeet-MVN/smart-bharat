"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">⚠️</div>
          <h1 className="text-6xl font-bold text-red-600 mb-2">500</h1>
          <h2 className="text-2xl font-semibold text-slate-800 mb-3">Something went wrong</h2>
          <p className="text-slate-600 mb-8">
            We encountered an error. Our team has been notified and we&apos;re working on a fix.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={reset}
              className="bg-[#1e3a5f] text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-all"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
