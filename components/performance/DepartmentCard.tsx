"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, CheckCircle2, Clock, AlertTriangle, 
  Sparkles, Star, TrendingUp, AlertCircle
} from "lucide-react";

export interface DepartmentData {
  id: string;
  name: string;
  totalComplaints: number;
  pending: number;
  inProgress: number;
  resolved: number;
  resolutionRate: number;
  avgResolutionDays: number;
  satisfactionScore: number;
  highPriorityCount: number;
  aiInsight: string;
}

export function DepartmentCard({ dept }: { dept: DepartmentData }) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{dept.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-semibold text-slate-700">{dept.satisfactionScore.toFixed(1)}/5.0</span>
                  <span className="text-xs text-slate-500 ml-1">Citizen Rating</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase">Total</p>
              <p className="text-2xl font-bold text-slate-800">{dept.totalComplaints}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase">Resolved</p>
              <p className="text-2xl font-bold text-emerald-600">{dept.resolved}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{dept.inProgress}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{dept.pending}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50/50">
          <div className="space-y-5">
            {/* Resolution Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Resolution Rate
                </span>
                <span className="text-sm font-bold text-slate-800">{dept.resolutionRate}%</span>
              </div>
              <Progress value={dept.resolutionRate} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Avg Time */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Avg Resolution</p>
                  <p className="text-sm font-bold text-slate-800">{dept.avgResolutionDays} Days</p>
                </div>
              </div>
              {/* High Priority */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">High Priority</p>
                  <p className="text-sm font-bold text-slate-800">{dept.highPriorityCount}</p>
                </div>
              </div>
            </div>

            {/* AI Insight */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <div className="shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">AI Insight</h4>
                <p className="text-sm text-blue-800 leading-snug">
                  {dept.aiInsight}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
