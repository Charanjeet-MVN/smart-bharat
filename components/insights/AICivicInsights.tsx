"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Map,
  Clock,
  AlertTriangle,
  Building2,
  TrendingUp,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { InsightMetricCard } from "./InsightMetricCard";
import { InsightRecommendationCard } from "./InsightRecommendationCard";

import { ComplaintRow } from "@/types";
import { useComplaints } from "@/hooks/useComplaints";

function computeInsights(complaints: ComplaintRow[]) {
  if (complaints.length === 0) return null;

  // Most reported category
  const catCount: Record<string, number> = {};
  complaints.forEach(c => { catCount[c.category] = (catCount[c.category] || 0) + 1; });
  const topCategory = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0];

  // Department workload
  const deptCount: Record<string, number> = {};
  complaints.forEach(c => { deptCount[c.department] = (deptCount[c.department] || 0) + 1; });
  const topDept = Object.entries(deptCount).sort((a, b) => b[1] - a[1])[0];

  // High priority count
  const highPriority = complaints.filter(c => c.priority === "HIGH" || c.priority === "URGENT").length;

  // Average resolution time (for resolved complaints)
  const resolved = complaints.filter(c => c.status === "RESOLVED" && c.updated_at);
  let avgDays = 0;
  if (resolved.length > 0) {
    const totalDays = resolved.reduce((sum, c) => {
      const diff = new Date(c.updated_at!).getTime() - new Date(c.created_at).getTime();
      return sum + diff / (1000 * 60 * 60 * 24);
    }, 0);
    avgDays = Math.round((totalDays / resolved.length) * 10) / 10;
  }

  // Recent trend (last 7 days vs previous 7 days)
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  const thisWeek = complaints.filter(c => now - new Date(c.created_at).getTime() < week).length;
  const lastWeek = complaints.filter(c => {
    const age = now - new Date(c.created_at).getTime();
    return age >= week && age < 2 * week;
  }).length;
  const trendPct = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;

  // Most common area from addresses
  const addrCount: Record<string, number> = {};
  complaints.forEach(c => {
    if (c.address) {
      const zone = c.address.split(",")[0]?.trim() || c.address;
      addrCount[zone] = (addrCount[zone] || 0) + 1;
    }
  });
  const topArea = Object.entries(addrCount).sort((a, b) => b[1] - a[1])[0];

  return {
    metrics: [
      {
        title: "Most Reported Category",
        value: topCategory?.[0] || "N/A",
        description: `${topCategory?.[1] || 0} complaints in this category.`,
        icon: BarChart3,
        colorClass: "text-blue-600",
        bgClass: "bg-blue-100"
      },
      {
        title: "Highest Complaint Area",
        value: topArea?.[0] || "N/A",
        description: `${topArea?.[1] || 0} complaints from this location.`,
        icon: Map,
        colorClass: "text-purple-600",
        bgClass: "bg-purple-100"
      },
      {
        title: "Highest Workload",
        value: topDept?.[0] || "N/A",
        description: `Managing ${topDept?.[1] || 0} complaints.`,
        icon: Building2,
        colorClass: "text-cyan-600",
        bgClass: "bg-cyan-100"
      },
      {
        title: "Avg Resolution Time",
        value: resolved.length > 0 ? `${avgDays} Days` : "N/A",
        description: resolved.length > 0 ? `Based on ${resolved.length} resolved complaints.` : "No resolved complaints yet.",
        icon: Clock,
        colorClass: "text-emerald-600",
        bgClass: "bg-emerald-100"
      },
      {
        title: "High Priority Count",
        value: String(highPriority),
        description: highPriority > 0 ? "Requires immediate attention." : "No high priority issues.",
        icon: AlertTriangle,
        colorClass: "text-red-600",
        bgClass: "bg-red-100"
      },
      {
        title: "Weekly Trend",
        value: `${trendPct >= 0 ? "+" : ""}${trendPct}%`,
        description: `${thisWeek} complaints this week vs ${lastWeek} last week.`,
        icon: TrendingUp,
        trend: trendPct !== 0 ? `${Math.abs(trendPct)}% ${trendPct > 0 ? "increase" : "decrease"}` : undefined,
        trendUp: trendPct > 0,
        colorClass: "text-amber-600",
        bgClass: "bg-amber-100"
      }
    ],
    recommendations: generateRecommendations(complaints, topCategory, topDept, avgDays, trendPct, highPriority)
  };
}

function generateRecommendations(
  complaints: ComplaintRow[],
  topCategory?: [string, number],
  topDept?: [string, number],
  avgDays?: number,
  trendPct?: number,
  highPriority?: number
) {
  const recs: { title: string; description: string; isImportant?: boolean }[] = [];

  if (trendPct && trendPct > 10) {
    recs.push({
      title: `Complaints increased by ${trendPct}% this week.`,
      description: `There has been a notable spike in civic complaint submissions this week. Consider reviewing staffing and resource allocation to handle the increased workload efficiently.`,
      isImportant: true
    });
  }

  if (topDept && topDept[1] > 3) {
    recs.push({
      title: `Consider allocating more resources to ${topDept[0]}.`,
      description: `${topDept[0]} is handling the highest workload with ${topDept[1]} complaints. Consider shifting resources to assist with faster resolution.`,
      isImportant: true
    });
  }

  if (topCategory && topCategory[1] > 2) {
    recs.push({
      title: `${topCategory[0]} is the most reported issue category.`,
      description: `With ${topCategory[1]} reports, ${topCategory[0]} complaints dominate the submissions. A targeted intervention or awareness campaign may help reduce recurrence.`
    });
  }

  if (avgDays && avgDays < 3) {
    recs.push({
      title: `Resolution times are performing well at ${avgDays} days average.`,
      description: `The current average resolution time is strong. Consider documenting the effective SOPs and replicating them across slower departments.`
    });
  }

  if (recs.length === 0) {
    recs.push({
      title: "System is running smoothly.",
      description: "No critical recommendations at this time. Continue monitoring complaint trends for emerging patterns."
    });
  }

  return recs;
}

export function AICivicInsights() {
  const { complaints, loading, error } = useComplaints();

  const insights = useMemo(() => computeInsights(complaints), [complaints]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6 text-amber-600 font-bold animate-pulse">
          <Sparkles className="w-5 h-5" />
          <span>AI is analyzing complaint data...</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Failed to Load Insights</h3>
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

  if (!insights) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 flex flex-col items-center justify-center text-center">
        <Sparkles className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-1">No Data for Analysis</h3>
        <p className="text-slate-500 text-sm max-w-sm">
          Submit civic complaints to see AI-generated insights and recommendations appear here.
        </p>
      </div>
    );
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          AI Metric Highlights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.metrics.map((metric, idx) => (
            <motion.div key={idx} variants={item}>
              <InsightMetricCard {...metric} />
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          AI-Generated Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.recommendations.map((rec, idx) => (
            <motion.div key={idx} variants={item}>
              <InsightRecommendationCard
                title={rec.title}
                description={rec.description}
                isImportant={rec.isImportant}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
