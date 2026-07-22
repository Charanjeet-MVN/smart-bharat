"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Filter } from "lucide-react";
import { OfficerStats, OfficerStatsData } from "./OfficerStats";
import { WorkQueueList } from "./WorkQueueList";
import { OfficerComplaint } from "./ComplaintActionCard";
import { parseISO, isPast } from "date-fns";

const MOCK_COMPLAINTS: OfficerComplaint[] = [
  {
    id: "COMP-9281",
    title: "Major Pothole on MG Road",
    citizenName: "R*** K***",
    category: "Roads",
    department: "PWD",
    priority: "High",
    status: "Pending",
    location: "MG Road, Zone 2",
    submissionDate: "2026-07-20T10:00:00Z",
    dueDate: "2026-07-22T10:00:00Z"
  },
  {
    id: "COMP-9285",
    title: "Streetlight not working",
    citizenName: "A*** S***",
    category: "Electricity",
    department: "Electricity Board",
    priority: "Medium",
    status: "In Progress",
    location: "Sector 4, Phase 1",
    submissionDate: "2026-07-18T14:30:00Z",
    dueDate: "2026-07-21T14:30:00Z"
  },
  {
    id: "COMP-9302",
    title: "Garbage not collected for 3 days",
    citizenName: "M*** P***",
    category: "Sanitation",
    department: "Waste Management",
    priority: "High",
    status: "Pending",
    location: "Green Avenue, Block C",
    submissionDate: "2026-07-21T09:15:00Z",
    dueDate: "2026-07-23T09:15:00Z"
  },
  {
    id: "COMP-9310",
    title: "Broken Park Bench",
    citizenName: "S*** D***",
    category: "Parks",
    department: "Recreation",
    priority: "Low",
    status: "Resolved",
    location: "Central Park",
    submissionDate: "2026-07-15T11:00:00Z",
    dueDate: "2026-07-25T11:00:00Z"
  }
];

export function OfficerDashboard() {
  const [complaints, setComplaints] = useState<OfficerComplaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Highest Priority");

  useEffect(() => {
    // Simulate fetch
    const timer = setTimeout(() => {
      setComplaints(MOCK_COMPLAINTS);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats: OfficerStatsData = useMemo(() => {
    let assigned = complaints.length;
    let pending = complaints.filter(c => c.status === "Pending").length;
    let inProgress = complaints.filter(c => c.status === "In Progress").length;
    let completed = complaints.filter(c => c.status === "Resolved").length;
    let overdue = complaints.filter(c => isPast(parseISO(c.dueDate)) && c.status !== "Resolved").length;
    
    return {
      assignedToday: 2, // Mock value
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
        const pMap: any = { High: 3, Medium: 2, Low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      } else if (sortBy === "Oldest First") {
        return new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime();
      } else if (sortBy === "Nearest Due Date") {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

    return result;
  }, [complaints, statusFilter, priorityFilter, sortBy]);

  const handleAction = (id: string, action: string) => {
    // Simulate action being recorded
    console.log(`Action "${action}" applied to complaint ${id}.`);
    
    // Optimistic UI Update for specific actions
    if (action === "Accept") {
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: "In Progress" } : c));
    } else if (action === "Mark Resolved") {
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: "Resolved" } : c));
    }
  };

  return (
    <div className="space-y-6">
      <OfficerStats stats={stats} />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-slate-500 font-medium text-sm mr-2">
            <Filter className="w-4 h-4" /> Filters
          </div>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50 min-w-[120px]"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select 
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50 min-w-[120px]"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-slate-500 font-medium whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50 w-full md:w-auto"
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
