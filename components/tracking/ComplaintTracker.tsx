"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ListX, RefreshCw } from "lucide-react";
import { TrackerCard, ComplaintData } from "./TrackerCard";
import { useComplaints } from "@/hooks/useComplaints";
import { Skeleton } from "@/components/ui/skeleton";

export function ComplaintTracker() {
  const { complaints: rawComplaints, loading, error } = useComplaints();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");

  const complaints = useMemo(() => {
    return rawComplaints.map(c => {
      const statusMap: Record<string, string> = {
        "SUBMITTED": "Submitted",
        "ACKNOWLEDGED": "Under Review",
        "IN_PROGRESS": "Work Started",
        "RESOLVED": "Resolved",
        "REJECTED": "Resolved",
        "CLOSED": "Resolved"
      };
      return {
        id: c.tracking_id || c.id,
        title: c.title,
        category: c.category,
        department: c.department,
        priority: (c.priority === "URGENT" || c.priority === "HIGH" ? "High" : c.priority === "LOW" ? "Low" : "Medium") as "High" | "Medium" | "Low",
        status: (statusMap[c.status] || "Submitted") as "Submitted" | "Under Review" | "Work Started" | "Resolved",
        dateSubmitted: new Date(c.created_at),
        expectedResolution: c.updated_at ? new Date(new Date(c.created_at).getTime() + 7 * 24 * 60 * 60 * 1000) : undefined,
        lastUpdated: c.updated_at ? new Date(c.updated_at) : new Date(c.created_at),
      };
    });
  }, [rawComplaints]);

  const filteredAndSorted = useMemo(() => {
    let result = [...complaints];

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.id.toLowerCase().includes(lowerQ) ||
        c.title.toLowerCase().includes(lowerQ)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter(c => c.status === statusFilter || (statusFilter === "Active" && c.status !== "Resolved"));
    }

    result.sort((a, b) => {
      if (sortBy === "Latest") return b.dateSubmitted.getTime() - a.dateSubmitted.getTime();
      if (sortBy === "Oldest") return a.dateSubmitted.getTime() - b.dateSubmitted.getTime();
      if (sortBy === "Priority") {
        const priorityScore: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        return (priorityScore[b.priority] ?? 0) - (priorityScore[a.priority] ?? 0);
      }
      return 0;
    });

    return result;
  }, [complaints, searchQuery, statusFilter, sortBy]);

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

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <ListX className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Failed to Load Complaints</h3>
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
            {complaints.length === 0
              ? "No complaints have been submitted yet. Report a civic issue to see it tracked here."
              : "We couldn't find any complaints matching your current filters. Try adjusting your search criteria."}
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
