"use client";

import React from "react";
import Link from "next/link";
import { 
  ClipboardList, Clock, CheckCircle2, ShieldCheck, 
  TrendingUp, Map, Briefcase, ArrowRight, Zap
} from "lucide-react";
import { useComplaints } from "@/hooks/useComplaints";

export function AdminControlCenter() {
  const { complaints } = useComplaints();

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === "SUBMITTED" || c.status === "Pending").length;
  const inProgress = complaints.filter(c => c.status === "ACKNOWLEDGED" || c.status === "IN_PROGRESS" || c.status === "In Progress").length;
  const resolved = complaints.filter(c => c.status === "RESOLVED" || c.status === "Resolved").length;

  const departmentStats = [
    { name: "Public Works Department", count: 18, resolution: "96.2%" },
    { name: "Municipal Corporation", count: 24, resolution: "94.8%" },
    { name: "Water Supply Board", count: 12, resolution: "98.1%" },
    { name: "Electricity Board", count: 9, resolution: "97.5%" }
  ];

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl shadow-slate-900/10 border border-slate-800">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>National Governance Operations Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Zap className="w-7 h-7 text-amber-400" />
            <span>Admin Control Center</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Real-time civic operations, department SLA metrics, AI accuracy monitoring, and officer dispatch.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/officer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Open Officer Desk</span>
          </Link>
        </div>
      </div>

      {/* 1. Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Complaints Today</span>
            <ClipboardList className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">{total}</h3>
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
            ↑ 12% vs yesterday
          </span>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Pending Action</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-amber-400">{pending + inProgress}</h3>
          <span className="text-[10px] font-bold text-slate-400 mt-1 block">Active queue</span>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Resolved Total</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-400">{resolved}</h3>
          <span className="text-[10px] font-bold text-emerald-400 mt-1 block">SLA compliant</span>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">AI Accuracy</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-purple-400">99.2%</h3>
          <span className="text-[10px] font-bold text-purple-300 mt-1 block">Gemini classifier</span>
        </div>
      </div>

      {/* 2. Department Breakdown & Heatmap Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Department Performance Summary */}
        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/60 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Department SLA Efficiency
            </h3>
            <Link href="/performance" className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {departmentStats.map((dept, idx) => (
              <div key={idx} className="bg-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-200 block">{dept.name}</span>
                  <span className="text-[10px] text-slate-400">{dept.count} Active Tasks</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                  {dept.resolution} SLA
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap & Spatial Preview */}
        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/60 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Map className="w-4 h-4 text-teal-400" />
                Geographic Heatmap Overview
              </h3>
              <Link href="/heatmap" className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1">
                Full Map <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Spatial density cluster map for infrastructure and municipal issues reported across major metro zones (Delhi, Mumbai, Bengaluru, Hyderabad).
            </p>
          </div>

          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <div>
                <span className="text-xs font-bold text-white block">High Density Hotspot</span>
                <span className="text-[10px] text-slate-400">NH-44 & Central Sector 12</span>
              </div>
            </div>
            <Link href="/heatmap" className="text-xs font-bold bg-teal-500/20 text-teal-300 px-3 py-1.5 rounded-lg border border-teal-500/30 hover:bg-teal-500/30 transition-all">
              Inspect Clusters
            </Link>
          </div>
        </div>

      </div>

      {/* 3. Officer Queue Snapshot */}
      <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/60 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" />
            Live Officer Dispatch Snapshot
          </h3>
          <Link href="/officer" className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
            Manage Work Queue <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {complaints.slice(0, 3).map((item) => (
            <div key={item.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] font-bold text-slate-400">#{item.tracking_id || item.id}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {item.priority}
                </span>
              </div>
              <h4 className="font-bold text-white truncate">{item.title}</h4>
              <p className="text-[10px] text-slate-400 truncate">{item.department}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
