"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Map as MapIcon, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useComplaints } from "@/hooks/useComplaints";

// Dynamically import the map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none border-l border-slate-200">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Loading Map Data...</p>
    </div>
  ),
});

// Simple deterministic hash to generate approximate coordinates from address strings
function hashToCoords(text: string, baseLat: number, baseLng: number): { lat: number; lng: number } {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((hash % 1000) / 10000) * (hash > 0 ? 1 : -1);
  const lngOffset = (((hash >> 8) % 1000) / 10000) * (hash > 0 ? -1 : 1);
  return {
    lat: baseLat + latOffset,
    lng: baseLng + lngOffset,
  };
}

export function HeatmapDashboard() {
  const [isClient, setIsClient] = useState(false);
  const { complaints: rawComplaints, loading, error } = useComplaints();
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  const complaints = useMemo(() => {
    const baseLat = 28.6139; // New Delhi
    const baseLng = 77.2090;

    return rawComplaints.map((c) => {
      const priorityMap: Record<string, "High" | "Medium" | "Low"> = {
        "URGENT": "High",
        "HIGH": "High",
        "MEDIUM": "Medium",
        "LOW": "Low"
      };
      const statusMap: Record<string, string> = {
        "SUBMITTED": "Submitted",
        "ACKNOWLEDGED": "Submitted",
        "IN_PROGRESS": "In Progress",
        "RESOLVED": "Resolved",
        "CLOSED": "Resolved",
        "REJECTED": "Resolved"
      };
      const coords = hashToCoords(c.address || c.id || "unknown", baseLat, baseLng);

      return {
        id: c.tracking_id || c.id,
        title: c.title,
        category: c.category,
        department: c.department,
        priority: priorityMap[c.priority] || "Medium",
        status: statusMap[c.status] || "Submitted",
        dateSubmitted: new Date(c.created_at),
        lat: coords.lat,
        lng: coords.lng,
      };
    });
  }, [rawComplaints]);

  const filteredData = useMemo(() => {
    return complaints.filter(c => {
      if (filterCategory !== "All" && c.category !== filterCategory) return false;
      if (filterStatus !== "All" && c.status !== filterStatus) return false;
      if (filterPriority !== "All" && c.priority !== filterPriority) return false;
      return true;
    });
  }, [complaints, filterCategory, filterStatus, filterPriority]);

  // Get unique categories from real data
  const categories = useMemo(() => {
    const set = new Set(complaints.map(c => c.category));
    return Array.from(set).sort();
  }, [complaints]);

  if (!isClient) {
    return (
      <div className="h-[700px] w-full rounded-2xl border border-slate-200 overflow-hidden flex bg-white shadow-sm">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[700px] w-full bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center p-12">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Failed to Load Map Data</h3>
        <p className="text-slate-500 text-sm max-w-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="h-[700px] w-full bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Sidebar Controls */}
      <div className="w-full md:w-80 p-5 flex flex-col bg-white z-10 shrink-0">
        <div className="flex items-center gap-2 mb-6">
          <MapIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">Map Controls</h2>
          {loading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
        </div>

        <div className="space-y-5 flex-1">
          {/* Filters */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <span className="text-sm font-bold text-slate-700">{filteredData.length}</span>
            <span className="text-xs text-slate-500 ml-1">complaints on map</span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-auto pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Map Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm border border-white"></div>
              <span>High Priority Issue</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm border border-white"></div>
              <span>Medium Priority Issue</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm border border-white"></div>
              <span>Low Priority Issue</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 mt-2">
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-20 scale-150"></div>
              <span>High Density Area (Heatmap)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative z-0 h-[400px] md:h-full">
        <MapComponent complaints={filteredData} />
      </div>
    </motion.div>
  );
}
