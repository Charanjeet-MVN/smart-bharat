"use client";

import React, { useState, useMemo } from "react";
import { Filter, RefreshCw, AlertCircle } from "lucide-react";
import { OfficerStats, OfficerStatsData } from "./OfficerStats";
import { WorkQueueList } from "./WorkQueueList";
import { parseISO, isPast } from "date-fns";
import { useComplaints } from "@/hooks/useComplaints";

export function OfficerDashboard() {
  const { complaints: rawComplaints, loading, error, refetch } = useComplaints();
  const [_actionLoading, setActionLoading] = useState<string | null>(null);
  const [overrideStatuses, setOverrideStatuses] = useState<Record<string, "Pending" | "In Progress" | "Resolved">>({});

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Highest Priority");

  const complaints = useMemo(() => {
    return rawComplaints.map((c) => {
      const statusMap: Record<string, "Pending" | "In Progress" | "Resolved"> = {
        "SUBMITTED": "Pending",
        "ACKNOWLEDGED": "In Progress",
        "IN_PROGRESS": "In Progress",
        "RESOLVED": "Resolved",
        "REJECTED": "Resolved",
        "CLOSED": "Resolved"
      };
      const priorityMap: Record<string, "High" | "Medium" | "Low"> = {
        "URGENT": "High",
        "HIGH": "High",
        "MEDIUM": "Medium",
        "LOW": "Low"
      };
      const createdAt = c.created_at || new Date().toISOString();
      const dueDate = new Date(new Date(createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const complaintId = c.tracking_id || c.id;

      return {
        id: complaintId,
        title: c.title,
        citizenName: "Citizen",
        category: c.category,
        department: c.department,
        priority: priorityMap[c.priority] || "Medium",
        status: overrideStatuses[complaintId] || statusMap[c.status] || "Pending",
        location: c.address || "Not specified",
        submissionDate: createdAt,
        dueDate: dueDate,
      };
    });
  }, [rawComplaints, overrideStatuses]);

  const stats: OfficerStatsData = useMemo(() => {
    const pending = complaints.filter(c => c.status === "Pending").length;
    const inProgress = complaints.filter(c => c.status === "In Progress").length;
    const completed = complaints.filter(c => c.status === "Resolved").length;
    const overdue = complaints.filter(c => isPast(parseISO(c.dueDate)) && c.status !== "Resolved").length;

    return {
      assignedToday: complaints.length,
      pending,
      inProgress,
      completedToday: completed,
      overdue
    };
  }, [complaints]);

  const filteredAndSortedComplaints = useMemo(() => {
    let result = [...complaints];

    if (statusFilter !== "All") {
      result = result.filter(c => c.status === statusFilter);
    }
    if (priorityFilter !== "All") {
      result = result.filter(c => c.priority === priorityFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "Highest Priority") {
        const pMap: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        return (pMap[b.priority] ?? 0) - (pMap[a.priority] ?? 0);
      } else if (sortBy === "Oldest First") {
        return new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime();
      } else if (sortBy === "Nearest Due Date") {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

    return result;
  }, [complaints, statusFilter, priorityFilter, sortBy]);

  const handleAction = async (id: string, action: string) => {
    const statusMap: Record<string, string> = {
      "Accept Task": "ACKNOWLEDGED",
      "Update Progress": "IN_PROGRESS",
      "Resolve": "RESOLVED",
    };
    const newStatus = statusMap[action];
    if (!newStatus) return;

    const uiStatusMap: Record<string, "Pending" | "In Progress" | "Resolved"> = {
      "ACKNOWLEDGED": "In Progress",
      "IN_PROGRESS": "In Progress",
      "RESOLVED": "Resolved"
    };

    const newUiStatus = uiStatusMap[newStatus];
    if (newUiStatus) {
      setOverrideStatuses(prev => ({ ...prev, [id]: newUiStatus }));
    }

    setActionLoading(id);
    try {
      const res = await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        refetch();
      }
    } catch {
      // Silently handle
    } finally {
      setActionLoading(null);
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Failed to Load Work Queue</h3>
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
    <div className="space-y-6">
      <OfficerStats stats={stats} />

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-xs border border-slate-200/80 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" /> Filters
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/80 min-w-[130px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/80 min-w-[130px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/80 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="Highest Priority">Highest Priority</option>
            <option value="Oldest First">Oldest First</option>
            <option value="Nearest Due Date">Nearest Due Date</option>
          </select>
        </div>
      </div>

      {/* List */}
      <WorkQueueList
        complaints={filteredAndSortedComplaints}
        loading={loading}
        onAction={handleAction}
      />
    </div>
  );
}
