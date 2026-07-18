import React from "react";
import { Activity } from "lucide-react";
import { ComplaintTracker } from "@/components/tracking/ComplaintTracker";

export default function TrackPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Track Complaints
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Monitor the real-time status and lifecycle of your civic issues.
          </p>
        </div>
      </div>

      {/* Main Tracking Component */}
      <ComplaintTracker />
    </div>
  );
}
