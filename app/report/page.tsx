"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { AISuggestionsPanel } from "@/components/AISuggestionsPanel";

export default function ReportPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [duplicateComplaint, setDuplicateComplaint] = useState<{ id: string, title: string } | null>(null);

  const submitComplaint = async (forceCreate = false) => {
    const trimmedDesc = description.trim();
    const trimmedAddr = address.trim();

    if (!trimmedDesc || !trimmedAddr) {
      setError("Please fill out both the description and address.");
      return;
    }

    if (trimmedDesc.length < 15) {
      setError("Please provide a more detailed description (minimum 15 characters).");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: trimmedDesc, address: trimmedAddr, forceCreate }),
      });

      if (res.status === 409) {
        const data = await res.json();
        setDuplicateComplaint(data.duplicate);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error("Failed to submit complaint. Please check your Supabase keys.");

      const data = await res.json();
      setSuccess(true);
      setDraft(data.complaint);
      setDuplicateComplaint(null);
      
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitComplaint(false);
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
            </div>
          )}

          {/* AI Suggestions Panel - Loading State */}
          {loading && !success && !duplicateComplaint && (
            <AISuggestionsPanel isLoading={true} />
          )}

          {/* AI Suggestions Panel - Success State */}
          {success && draft && (
            <AISuggestionsPanel 
              department={draft.department} 
              priority={draft.priority} 
              nextAction="Track the progress of this complaint on your dashboard."
            />
          )}

          {/* AI Suggestions Panel - Duplicate State */}
          {duplicateComplaint && !success && (
            <AISuggestionsPanel 
              similarIssue={duplicateComplaint}
              onSupportSimilar={() => router.push("/wall")}
              onCreateNew={() => {
                setDuplicateComplaint(null);
                submitComplaint(true);
              }}
            />
          )}



          {/* Submit button */}
          {!success && !duplicateComplaint && (
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
