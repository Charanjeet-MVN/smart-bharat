"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Filter, RefreshCw, AlertCircle } from "lucide-react";
import { DepartmentCard, DepartmentData } from "./DepartmentCard";
import { PerformanceCharts } from "./PerformanceCharts";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

import { ComplaintRow } from "@/types";
import { useComplaints } from "@/hooks/useComplaints";

function computeDepartmentData(complaints: ComplaintRow[]): DepartmentData[] {
  const deptMap: Record<string, ComplaintRow[]> = {};
  complaints.forEach(c => {
    if (!deptMap[c.department]) deptMap[c.department] = [];
    deptMap[c.department].push(c);
  });

  return Object.entries(deptMap).map(([name, items]) => {
    const total = items.length;
    const pending = items.filter(c => c.status === "SUBMITTED" || c.status === "ACKNOWLEDGED").length;
    const inProgress = items.filter(c => c.status === "IN_PROGRESS").length;
    const resolved = items.filter(c => c.status === "RESOLVED" || c.status === "CLOSED").length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const highPri = items.filter(c => c.priority === "HIGH" || c.priority === "URGENT").length;

    // Average resolution days for resolved items
    const resolvedItems = items.filter(c => (c.status === "RESOLVED" || c.status === "CLOSED") && c.updated_at);
    let avgDays = 0;
    if (resolvedItems.length > 0) {
      const totalDays = resolvedItems.reduce((sum, c) => {
        const diff = new Date(c.updated_at!).getTime() - new Date(c.created_at).getTime();
        return sum + diff / (1000 * 60 * 60 * 24);
      }, 0);
      avgDays = Math.round((totalDays / resolvedItems.length) * 10) / 10;
    }

    // Simple satisfaction score estimate based on resolution rate and speed
    const satisfaction = rate > 70 ? 4.5 : rate > 50 ? 3.8 : rate > 30 ? 3.2 : 2.5;

    // AI insight based on metrics
    let aiInsight = "";
    if (rate > 70) aiInsight = `${name} has a strong resolution rate of ${rate}%. Keep up the great work.`;
    else if (pending > inProgress && pending > 3) aiInsight = `${name} has a growing backlog of ${pending} pending complaints. Consider reallocating resources.`;
    else if (highPri > 3) aiInsight = `${name} has ${highPri} high-priority complaints requiring immediate attention.`;
    else aiInsight = `${name} is performing steadily with ${total} total complaints.`;

    return {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      totalComplaints: total,
      pending,
      inProgress,
      resolved,
      resolutionRate: rate,
      avgResolutionDays: avgDays || 5,
      satisfactionScore: satisfaction,
      highPriorityCount: highPri,
      aiInsight,
    };
  });
}

export function PerformanceDashboard() {
  const { complaints, loading, error } = useComplaints();
  const [sortBy, setSortBy] = useState("Resolution Rate");
  const [dateRange, setDateRange] = useState("All Time");

  const departments = useMemo(() => computeDepartmentData(complaints), [complaints]);

  const sortedDepartments = useMemo(() => {
    const sorted = [...departments];
    if (sortBy === "Resolution Rate") {
      sorted.sort((a, b) => b.resolutionRate - a.resolutionRate);
    } else if (sortBy === "Most Pending") {
      sorted.sort((a, b) => b.pending - a.pending);
    } else if (sortBy === "Fastest Response") {
      sorted.sort((a, b) => a.avgResolutionDays - b.avgResolutionDays);
    }
    return sorted;
  }, [departments, sortBy]);

  const barChartData = useMemo(() => {
    return departments.map(d => ({ name: d.name.split(" ")[0], complaints: d.totalComplaints }));
  }, [departments]);

  const pieChartData = useMemo(() => {
    return departments.map(d => ({ name: d.name.split(" ")[0], value: d.totalComplaints }));
  }, [departments]);

  const lineChartData = useMemo(() => {
    // Compute monthly complaint counts from real data
    const monthCounts: Record<string, number> = {};
    complaints.forEach(c => {
      const date = new Date(c.created_at);
      const key = date.toLocaleString("en-US", { month: "short" });
      monthCounts[key] = (monthCounts[key] || 0) + 1;
    });
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.filter(m => monthCounts[m]).map(m => ({ month: m, rate: monthCounts[m] || 0 }));
  }, [complaints]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Failed to Load Performance Data</h3>
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

  if (departments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-1">No Department Data</h3>
        <p className="text-slate-500 text-sm max-w-sm">
          Submit civic complaints to see department performance metrics appear here.
        </p>
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
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex gap-2 flex-1">
          <div className="relative shrink-0 flex-1 sm:flex-none">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 appearance-none font-medium text-slate-700 w-full"
            >
              <option value="All Time">All Time</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 3 Months">Last 3 Months</option>
              <option value="Last 6 Months">Last 6 Months</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 font-medium whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 appearance-none font-medium text-slate-700 shrink-0 w-full sm:w-auto"
          >
            <option value="Resolution Rate">Highest Resolution Rate</option>
            <option value="Most Pending">Most Pending Complaints</option>
            <option value="Fastest Response">Fastest Response Time</option>
          </select>
        </div>
      </div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <PerformanceCharts barData={barChartData} lineData={lineChartData} pieData={pieChartData} />
      </motion.div>

      {/* Department Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {sortedDepartments.map((dept) => (
          <motion.div key={dept.id} variants={item}>
            <DepartmentCard dept={dept} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
