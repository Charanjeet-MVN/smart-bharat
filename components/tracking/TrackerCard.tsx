"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TrackerTimeline, TrackingStage } from "./TrackerTimeline";
import { format, formatDistanceToNow } from "date-fns";

export interface ComplaintData {
  id: string;
  title: string;
  category: string;
  department: string;
  priority: "Low" | "Medium" | "High";
  status: TrackingStage;
  dateSubmitted: Date;
  expectedResolution?: Date;
  lastUpdated: Date;
}

export function TrackerCard({ complaint }: { complaint: ComplaintData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "High": return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100";
      case "Medium": return "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100";
      case "Low": return "bg-green-100 text-green-700 border-green-200 hover:bg-green-100";
      default: return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100";
    }
  };

  const getStatusBadge = (s: TrackingStage) => {
    if (s === "Resolved") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (s === "Work Started" || s === "Work Completed") return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-0">
        <div 
          className="p-5 cursor-pointer flex flex-col md:flex-row gap-4 justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                #{complaint.id}
              </span>
              <Badge variant="outline" className={getPriorityColor(complaint.priority)}>
                {complaint.priority} Priority
              </Badge>
              <Badge variant="outline" className={getStatusBadge(complaint.status)}>
                {complaint.status}
              </Badge>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">
              {complaint.title}
            </h3>
            <p className="text-sm text-slate-500 mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {complaint.category} • {complaint.department}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Submitted: {format(complaint.dateSubmitted, 'MMM d, yyyy')}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Updated: {formatDistanceToNow(complaint.lastUpdated, { addSuffix: true })}
              </div>
              {complaint.expectedResolution && complaint.status !== "Resolved" && (
                <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Expected: {format(complaint.expectedResolution, 'MMM d, yyyy')}
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-center md:justify-end">
            <button className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl">
              {isExpanded ? 'Hide Details' : 'Track Status'}
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-5 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50">
                <h4 className="text-sm font-bold text-slate-800 mb-4">Complaint Lifecycle</h4>
                <div className="max-w-2xl">
                  <TrackerTimeline currentStage={complaint.status} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
