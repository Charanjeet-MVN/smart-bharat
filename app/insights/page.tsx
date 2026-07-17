import React from "react";
import { LineChart, LayoutDashboard } from "lucide-react";
import { AICivicInsights } from "@/components/insights/AICivicInsights";

export default function InsightsPage() {
  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <LineChart className="w-8 h-8 text-blue-600" />
            Admin Insights
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Real-time, AI-driven analysis of civic complaints across the city.
          </p>
        </div>
      </div>

      {/* Main Content Component */}
      <AICivicInsights />
    </div>
  );
}
