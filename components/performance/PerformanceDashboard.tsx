"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Filter, Search, TrendingUp } from "lucide-react";
import { DepartmentCard, DepartmentData } from "./DepartmentCard";
import { PerformanceCharts } from "./PerformanceCharts";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const MOCK_DEPARTMENTS: DepartmentData[] = [
  {
    id: "water",
    name: "Water Department",
    totalComplaints: 1240,
    pending: 120,
    inProgress: 300,
    resolved: 820,
    resolutionRate: 66,
    avgResolutionDays: 3.5,
    satisfactionScore: 4.2,
    highPriorityCount: 45,
    aiInsight: "Water Department is resolving complaints 25% faster than last month. Leakage reports are down.",
  },
  {
    id: "pwd",
    name: "Public Works (PWD)",
    totalComplaints: 2100,
    pending: 450,
    inProgress: 600,
    resolved: 1050,
    resolutionRate: 50,
    avgResolutionDays: 8.2,
    satisfactionScore: 3.4,
    highPriorityCount: 120,
    aiInsight: "Road Department has a high backlog of pending complaints, particularly regarding potholes in North Zone.",
  },
  {
    id: "electricity",
    name: "Electricity Board",
    totalComplaints: 850,
    pending: 40,
    inProgress: 110,
    resolved: 700,
    resolutionRate: 82,
    avgResolutionDays: 1.2,
    satisfactionScore: 4.7,
    highPriorityCount: 85,
    aiInsight: "Electricity Department maintains the highest citizen satisfaction with rapid power restoration times.",
  },
  {
    id: "sanitation",
    name: "Sanitation & Waste",
    totalComplaints: 1650,
    pending: 200,
    inProgress: 450,
    resolved: 1000,
    resolutionRate: 60,
    avgResolutionDays: 4.0,
    satisfactionScore: 3.8,
    highPriorityCount: 60,
    aiInsight: "Waste collection delays observed on weekends. Consider allocating more trucks to Zone 3.",
  },
  {
    id: "parks",
    name: "Parks & Recreation",
    totalComplaints: 420,
    pending: 50,
    inProgress: 120,
    resolved: 250,
    resolutionRate: 59,
    avgResolutionDays: 6.5,
    satisfactionScore: 4.0,
    highPriorityCount: 10,
    aiInsight: "Steady performance. Tree pruning requests peak after heavy rain events.",
  }
];

// Mock data for charts
const LINE_CHART_DATA = [
  { month: "Jan", rate: 58 },
  { month: "Feb", rate: 60 },
  { month: "Mar", rate: 57 },
  { month: "Apr", rate: 64 },
  { month: "May", rate: 69 },
  { month: "Jun", rate: 71 },
];

export function PerformanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("Last 6 Months");
  const [sortBy, setSortBy] = useState("Resolution Rate");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const sortedDepartments = useMemo(() => {
    let sorted = [...MOCK_DEPARTMENTS];
    if (sortBy === "Resolution Rate") {
      sorted.sort((a, b) => b.resolutionRate - a.resolutionRate);
    } else if (sortBy === "Most Pending") {
      sorted.sort((a, b) => b.pending - a.pending);
    } else if (sortBy === "Fastest Response") {
      sorted.sort((a, b) => a.avgResolutionDays - b.avgResolutionDays);
    }
    return sorted;
  }, [sortBy]);

  const barChartData = useMemo(() => {
    return MOCK_DEPARTMENTS.map(d => ({ name: d.name.split(" ")[0], complaints: d.totalComplaints }));
  }, []);

  const pieChartData = useMemo(() => {
    return MOCK_DEPARTMENTS.map(d => ({ name: d.name.split(" ")[0], value: d.totalComplaints }));
  }, []);

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
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 3 Months">Last 3 Months</option>
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="This Year">This Year</option>
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
        <PerformanceCharts barData={barChartData} lineData={LINE_CHART_DATA} pieData={pieChartData} />
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
