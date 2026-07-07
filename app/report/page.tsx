"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";

export default function ReportPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [draft, setDraft] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !address.trim()) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, address }),
      });

      if (!res.ok) throw new Error("Failed to submit complaint. Please check your Supabase keys.");

      const data = await res.json();
      setSuccess(true);
      setDraft(data.complaint);
      
      // Reset form
      setDescription("");
      setAddress("");
      
      // Redirect to wall after 3 seconds
      setTimeout(() => {
        router.push("/wall");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Intro */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl flex items-center justify-center gap-3">
          <AlertTriangle className="w-9 h-9 text-[#FF9933]" />
          Report a Civic Issue
        </h1>
        <p className="mt-4 text-base text-slate-500 max-w-lg mx-auto">
          Describe the civic issue you observed. Our AI will classify it, draft a formal complaint, assign it to the responsible department, and post it to the public wall.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Describe the Civic Issue
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the issue (e.g., Pothole on the middle of the road, garbage piled up in the street corner, streetlights not working since a week...)"
              className="w-full rounded-xl border border-slate-350 px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none"
              disabled={loading || success}
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Issue Location / Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <MapPin className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="E.g., Sector 4, near Central Park, Delhi"
                className="w-full rounded-xl border border-slate-350 pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                disabled={loading || success}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm">
              {error}
            </div>
          )}

          {/* Success Box */}
          {success && (
            <div className="bg-green-50 text-green-800 p-5 rounded-2xl border border-green-150 text-sm space-y-3">
              <div className="flex items-center gap-2 font-bold text-green-900 text-base">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Complaint Submitted Successfully!
              </div>
              <p className="text-sm">
                AI has drafted the complaint. Redirecting you to the Complaints Wall to view your listing...
              </p>
              {draft && (
                <div className="bg-white/80 p-4 rounded-xl border border-green-100 mt-2 space-y-1.5 font-sans">
                  <div className="font-semibold text-slate-800">
                    <span className="text-slate-400 text-xs uppercase tracking-wider block font-bold">Generated Title</span>
                    {draft.title}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider block">Department</span>
                      <span className="text-slate-700 font-medium">{draft.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider block">Severity</span>
                      <span className="text-slate-700 font-medium">{draft.priority}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit button */}
          {!success && (
            <button
              type="submit"
              disabled={loading || !description.trim() || !address.trim()}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating formal complaint draft...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Complaint
                </>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
