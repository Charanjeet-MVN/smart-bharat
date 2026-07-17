"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3, 
  Map, 
  Clock, 
  AlertTriangle, 
  Building2, 
  TrendingUp,
  Sparkles
} from "lucide-react";
import { InsightMetricCard } from "./InsightMetricCard";
import { InsightRecommendationCard } from "./InsightRecommendationCard";

const MOCK_INSIGHTS = {
  metrics: [
    {
      title: "Most Reported Category",
      value: "Roads & Traffic",
      description: "Potholes account for 60% of these reports.",
      icon: BarChart3,
      colorClass: "text-blue-600",
      bgClass: "bg-blue-100"
    },
    {
      title: "Highest Complaint Area",
      value: "Northern Zone",
      description: "Sector 4 and 15 have seen a spike.",
      icon: Map,
      colorClass: "text-purple-600",
      bgClass: "bg-purple-100"
    },
    {
      title: "Highest Workload",
      value: "Water Supply Dept",
      description: "Managing 34% of active complaints.",
      icon: Building2,
      trend: "12% vs last week",
      trendUp: true,
      colorClass: "text-cyan-600",
      bgClass: "bg-cyan-100"
    },
    {
      title: "Avg Resolution Time",
      value: "2.8 Days",
      description: "Electricity dept is the fastest.",
      icon: Clock,
      trend: "15% faster",
      trendUp: false, // down is good for time
      colorClass: "text-emerald-600",
      bgClass: "bg-emerald-100"
    },
    {
      title: "High Priority Count",
      value: "24",
      description: "Requires immediate attention.",
      icon: AlertTriangle,
      colorClass: "text-red-600",
      bgClass: "bg-red-100"
    },
    {
      title: "Weekly Trend",
      value: "+18%",
      description: "Garbage complaints increased this week.",
      icon: TrendingUp,
      trend: "spike on weekends",
      trendUp: true,
      colorClass: "text-amber-600",
      bgClass: "bg-amber-100"
    }
  ],
  recommendations: [
    {
      title: "Garbage complaints increased by 18% this week.",
      description: "The AI analysis indicates a significant spike in waste management complaints, particularly concentrated in the Eastern Zone over the weekend. Recommendation: Temporarily reallocate two additional sanitation trucks to the Eastern routes on Saturday and Sunday mornings.",
      isImportant: true
    },
    {
      title: "Consider allocating more resources to the Water Department.",
      description: "The Water Supply Department currently holds the highest workload with 34% of all active complaints, leading to a projected increase in average resolution time. Consider shifting contract maintenance personnel to assist with minor pipe leak repairs.",
      isImportant: true
    },
    {
      title: "Road-related complaints are concentrated in the northern zone.",
      description: "Over 60% of 'Roads & Traffic' reports originate from Sector 4 and 15. The AI suggests scheduling a comprehensive road survey in this specific quadrant before the monsoon season begins."
    },
    {
      title: "Electricity complaints have the fastest resolution time.",
      description: "The Electricity Department is resolving issues in 1.2 days on average. Their new dispatch protocol is highly effective. Recommendation: Review their standard operating procedure (SOP) and implement similar dispatch strategies in the Water Department."
    }
  ]
};

export function AICivicInsights() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI data processing delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

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
        
        <div className="space-y-3 mt-8">
          <Skeleton className="h-6 w-48 mb-4" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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
          {MOCK_INSIGHTS.metrics.map((metric, idx) => (
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
          {MOCK_INSIGHTS.recommendations.map((rec, idx) => (
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
