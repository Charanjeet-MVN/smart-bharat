"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ClipboardList, Clock, CheckCircle2, 
  AlertTriangle, ArrowRightCircle
} from "lucide-react";

export interface OfficerStatsData {
  assignedToday: number;
  pending: number;
  inProgress: number;
  completedToday: number;
  overdue: number;
}

export function OfficerStats({ stats }: { stats: OfficerStatsData }) {
  const cards = [
    { 
      title: "Assigned Total", 
      value: stats.assignedToday, 
      icon: ClipboardList, 
      color: "text-blue-600", 
      bg: "bg-blue-50/80 border-blue-100",
      accent: "border-t-4 border-t-blue-500"
    },
    { 
      title: "Pending", 
      value: stats.pending, 
      icon: Clock, 
      color: "text-amber-600", 
      bg: "bg-amber-50/80 border-amber-100",
      accent: "border-t-4 border-t-amber-500"
    },
    { 
      title: "In Progress", 
      value: stats.inProgress, 
      icon: ArrowRightCircle, 
      color: "text-purple-600", 
      bg: "bg-purple-50/80 border-purple-100",
      accent: "border-t-4 border-t-purple-500"
    },
    { 
      title: "Completed", 
      value: stats.completedToday, 
      icon: CheckCircle2, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50/80 border-emerald-100",
      accent: "border-t-4 border-t-emerald-500"
    },
    { 
      title: "Overdue", 
      value: stats.overdue, 
      icon: AlertTriangle, 
      color: "text-rose-600", 
      bg: "bg-rose-50/80 border-rose-100",
      accent: "border-t-4 border-t-rose-500"
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <Card key={idx} className={`border-slate-200/80 shadow-xs rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300 ${card.accent}`}>
          <CardContent className="p-4 sm:p-5 flex flex-col items-center justify-center text-center">
            <div className={`w-10 h-10 rounded-2xl ${card.bg} border flex items-center justify-center mb-3 shadow-2xs`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{card.value}</h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">{card.title}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
