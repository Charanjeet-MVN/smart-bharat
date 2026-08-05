"use client";

import { formatDistanceToNow } from "date-fns";
import { useComplaints } from "@/hooks/useComplaints";
import { ClipboardList, RefreshCw, MapPin, Calendar, Building2, Loader2, ShieldCheck } from "lucide-react";

export default function WallPage() {
  const { complaints, loading, error, refetch } = useComplaints();

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "RESOLVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200/80";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "ACKNOWLEDGED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
      default:
        return "bg-amber-50 text-amber-800 border-amber-200/80";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "URGENT":
        return "bg-rose-50 text-rose-700 border-rose-200/80 font-bold";
      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-200/80 font-semibold";
      case "MEDIUM":
        return "bg-slate-100 text-slate-700 border-slate-200/80";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200/60";
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-8">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Transparent Civic Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="w-9 h-9 text-emerald-600 shrink-0" />
            <span>Community Reports</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl">
            View live public complaints submitted by citizens across India and monitor real-time department resolution progress.
          </p>
        </div>

        <button
          onClick={refetch}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-slate-900/10 shrink-0 active:scale-98"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} />
          Refresh Stream
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 p-5 rounded-2xl border border-red-200 text-sm shadow-2xs">
          {error}
        </div>
      )}

      {/* Loading & Content */}
      {loading && complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-2xs">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium text-sm">Fetching community reports feed...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-2xs p-8">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-800 font-bold text-lg">No public reports yet</p>
          <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
            Be the first citizen to report an issue in your locality!
          </p>
          <a
            href="/report"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl mt-6 transition-all shadow-md shadow-blue-500/10"
          >
            Report an Issue
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {complaints.map((complaint) => {
            const tracking = complaint.tracking_id || "COMP-UNKNOWN";
            const date = complaint.created_at;
            
            return (
              <div
                key={complaint.id}
                className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col group"
              >
                {/* Card Header */}
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
                      #{tracking}
                    </span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                      {complaint.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityBadge(complaint.priority)}`}>
                      {complaint.priority} Priority
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-7 space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {complaint.title}
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
                      {complaint.description}
                    </p>
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-slate-600 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Department</span>
                        <span className="text-slate-800 font-semibold">{complaint.department}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Location</span>
                        <span className="text-slate-800 font-semibold truncate block max-w-[180px]" title={complaint.address}>
                          {complaint.address || "Not specified"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Reported</span>
                        <span className="text-slate-800 font-semibold">{formatDate(date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
