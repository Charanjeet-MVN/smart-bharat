"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Loader2, ListX } from "lucide-react";
import { TrackerCard, ComplaintData } from "./TrackerCard";
import { Skeleton } from "@/components/ui/skeleton";

// Mock Data
const MOCK_COMPLAINTS: ComplaintData[] = [
  {
    id: "CMP-8892",
    title: "Large pothole on MG Road near Metro Station",
    category: "Roads & Traffic",
    department: "Public Works Department",
    priority: "High",
    status: "Work Started",
    dateSubmitted: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    expectedResolution: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
  },
  {
    id: "CMP-8890",
    title: "Streetlights not working in Sector 4",
    category: "Electricity",
    department: "Electricity Board",
    priority: "Medium",
    status: "Assigned to Department",
    dateSubmitted: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    expectedResolution: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)
  },
  {
    id: "CMP-8875",
    title: "Garbage pile-up near community park",
    category: "Sanitation",
    department: "Municipal Corporation",
    priority: "High",
    status: "Under Review",
    dateSubmitted: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    expectedResolution: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    id: "CMP-8840",
    title: "Water pipe leakage in residential area",
    category: "Water Supply",
    department: "Water Department",
    priority: "Low",
    status: "Resolved",
    dateSubmitted: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12)
  }
];

export function ComplaintTracker() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = [...MOCK_COMPLAINTS];

    // Search filter
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.id.toLowerCase().includes(lowerQ) || 
        c.title.toLowerCase().includes(lowerQ)
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      result = result.filter(c => c.status === statusFilter || (statusFilter === "Active" && c.status !== "Resolved"));
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "Latest") return b.dateSubmitted.getTime() - a.dateSubmitted.getTime();
      if (sortBy === "Oldest") return a.dateSubmitted.getTime() - b.dateSubmitted.getTime();
      if (sortBy === "Priority") {
        const priorityScore = { High: 3, Medium: 2, Low: 1 };
        return priorityScore[b.priority] - priorityScore[a.priority];
      }
      return 0;
    });

    return result;
  }, [searchQuery, statusFilter, sortBy]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-full sm:w-40 rounded-xl" />
          <Skeleton className="h-12 w-full sm:w-40 rounded-xl" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID or Title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative shrink-0">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 appearance-none font-medium text-slate-700 w-full sm:w-auto"
            >
              <option value="All">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Under Review">Under Review</option>
              <option value="Work Started">Work Started</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 appearance-none font-medium text-slate-700 shrink-0 w-full sm:w-auto"
          >
            <option value="Latest">Sort: Latest</option>
            <option value="Oldest">Sort: Oldest</option>
            <option value="Priority">Sort: Priority</option>
          </select>
        </div>
      </div>

      {/* List */}
      {filteredAndSorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <ListX className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Complaints Found</h3>
          <p className="text-slate-500 text-sm max-w-sm">
            We couldn't find any complaints matching your current filters. Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <motion.div 
          className="space-y-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredAndSorted.map((complaint) => (
            <motion.div key={complaint.id} variants={item}>
              <TrackerCard complaint={complaint} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
