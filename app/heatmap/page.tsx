import React from "react";
import { Map } from "lucide-react";
import { HeatmapDashboard } from "@/components/heatmap/HeatmapDashboard";

export default function HeatmapPage() {
  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Map className="w-8 h-8 text-blue-600" />
            Civic Issue Heatmap
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Interactive visualization of civic complaints across the region.
          </p>
        </div>
      </div>

      {/* Main Heatmap Component */}
      <HeatmapDashboard />
    </div>
  );
}
