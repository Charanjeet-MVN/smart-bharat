"use client";

import { useEffect, useState } from "react";
import { ClipboardList, RefreshCw, MapPin, Calendar, Building2, ShieldAlert, Loader2 } from "lucide-react";

interface Complaint {
  id: string;
  trackingId?: string;
  tracking_id?: string;
  title: string;
  description: string;
  category: string;
  department: string;
  status: string;
  priority: string;
  address?: string;
  createdAt?: string;
  created_at?: string;
}

export default function WallPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchComplaints = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/complaints");
      if (!res.ok) throw new Error("Failed to load complaints board.");
      const data = await res.json();
      setComplaints(data);
    } catch (err: any) {
      setError(err.message || "Failed to load complaints. Ensure Supabase credentials are valid.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "RESOLVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ACKNOWLEDGED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "URGENT":
        return "bg-rose-50 text-rose-700 border-rose-100 font-bold";
      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-100";
      case "MEDIUM":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Intro */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl flex items-center gap-3">
            <ClipboardList className="w-9 h-9 text-green-600" />
            Complaints Wall
          </h1>
          <p className="mt-2 text-slate-500 text-sm sm:text-base">
            View all community-submitted civic issues and their live status tracking.
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          Refresh Wall
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 p-5 rounded-2xl border border-red-155 text-sm mb-8">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 text-sm">Loading complaints list...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium text-lg">No complaints on the wall yet</p>
          <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
            Be the first to report a civic issue in your locality!
          </p>
          <a
            href="/report"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl mt-6 transition-all"
          >
            Report an Issue
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {complaints.map((complaint) => {
            const tracking = complaint.trackingId || complaint.tracking_id || "COMP-UNKNOWN";
            const date = complaint.createdAt || complaint.created_at;
            
            return (
              <div
                key={complaint.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Card Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-150 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded">
                      {tracking}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      {complaint.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {complaint.title}
                    </h3>
                    <p className="text-slate-650 text-sm mt-2 leading-relaxed">
                      {complaint.description}
                    </p>
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-slate-600 text-xs">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider">Assigned Department</span>
                        <span className="text-slate-700 font-semibold">{complaint.department}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider">Location / Address</span>
                        <span className="text-slate-700 font-semibold truncate block max-w-[200px]" title={complaint.address}>
                          {complaint.address || "Not specified"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider">Submitted On</span>
                        <span className="text-slate-700 font-semibold">{formatDate(date)}</span>
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
