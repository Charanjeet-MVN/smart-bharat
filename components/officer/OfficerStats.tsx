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
      title: "Assigned Today", 
      value: stats.assignedToday, 
      icon: ClipboardList, 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      title: "Pending", 
      value: stats.pending, 
      icon: Clock, 
      color: "text-amber-600", 
      bg: "bg-amber-50" 
    },
    { 
      title: "In Progress", 
      value: stats.inProgress, 
      icon: ArrowRightCircle, 
      color: "text-purple-600", 
      bg: "bg-purple-50" 
    },
    { 
      title: "Completed Today", 
      value: stats.completedToday, 
      icon: CheckCircle2, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50" 
    },
    { 
      title: "Overdue", 
      value: stats.overdue, 
      icon: AlertTriangle, 
      color: "text-red-600", 
      bg: "bg-red-50" 
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card, idx) => (
        <Card key={idx} className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className={`w-10 h-10 rounded-full ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
            <p className="text-xs font-medium text-slate-500 uppercase mt-1">{card.title}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
