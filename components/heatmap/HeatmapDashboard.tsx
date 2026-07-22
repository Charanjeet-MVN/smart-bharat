"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Filter, Search, Map as MapIcon, Loader2 } from "lucide-react";
import { HeatmapComplaint } from "./MapComponent";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

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

// Generate some realistic mock data centered around New Delhi
const generateMockData = (): HeatmapComplaint[] => {
  const categories = ["Roads & Traffic", "Electricity", "Water Supply", "Sanitation"];
  const departments = ["PWD", "Electricity Board", "Water Dept", "Municipal Corp"];
  const priorities: ("High" | "Medium" | "Low")[] = ["High", "Medium", "Low"];
  const statuses = ["Submitted", "In Progress", "Resolved"];
  
  const baseLat = 28.6139;
  const baseLng = 77.2090;

  return Array.from({ length: 45 }).map((_, i) => ({
    id: `CMP-${9000 + i}`,
    title: `Civic Issue reported in Zone ${Math.floor(Math.random() * 10) + 1}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    dateSubmitted: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30),
    // Scatter coordinates around base
    lat: baseLat + (Math.random() - 0.5) * 0.1,
    lng: baseLng + (Math.random() - 0.5) * 0.1,
  }));
};

const MOCK_DATA = generateMockData();

export function HeatmapDashboard() {
  const [isClient, setIsClient] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredData = useMemo(() => {
    return MOCK_DATA.filter(c => {
      if (filterCategory !== "All" && c.category !== filterCategory) return false;
      if (filterStatus !== "All" && c.status !== filterStatus) return false;
      if (filterPriority !== "All" && c.priority !== filterPriority) return false;
      return true;
    });
  }, [filterCategory, filterStatus, filterPriority]);

  if (!isClient) {
    return (
      <div className="h-[700px] w-full rounded-2xl border border-slate-200 overflow-hidden flex bg-white shadow-sm">
        <Skeleton className="w-full h-full" />
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
              <option value="Roads & Traffic">Roads & Traffic</option>
              <option value="Electricity">Electricity</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Sanitation">Sanitation</option>
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
