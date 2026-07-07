import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-6xl font-bold text-[#1e3a5f] mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-slate-800 mb-3">Page Not Found</h2>
        <p className="text-slate-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/ask"
            className="bg-[#1e3a5f] text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-all"
          >
            Go to AI Decoder
          </Link>
          <Link
            href="/"
            className="border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
