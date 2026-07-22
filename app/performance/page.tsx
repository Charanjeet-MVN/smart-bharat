import React from "react";
import { TrendingUp } from "lucide-react";
import { PerformanceDashboard } from "@/components/performance/PerformanceDashboard";

export default function PerformancePage() {
  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Department Performance
          </h1>
          <p className="mt-2 text-base text-slate-500 max-w-2xl">
            AI-powered analytics and insights tracking the efficiency, response times, and citizen satisfaction across all civic departments.
          </p>
        </div>
      </div>

      {/* Main Dashboard Component */}
      <PerformanceDashboard />
    </div>
  );
}
