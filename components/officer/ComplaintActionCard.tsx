"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Calendar, Clock, AlertTriangle, 
  CheckCircle2, Image as ImageIcon, 
  MessageSquare, UserCircle, AlertCircle
} from "lucide-react";
import { format, isPast, parseISO } from "date-fns";

export interface OfficerComplaint {
  id: string;
  title: string;
  citizenName: string;
  category: string;
  department: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Resolved";
  location: string;
  submissionDate: string;
  dueDate: string;
}

export function ComplaintActionCard({ complaint, onAction }: { complaint: OfficerComplaint, onAction: (id: string, action: string) => void }) {
  const dueDateObj = parseISO(complaint.dueDate);
  const isOverdue = isPast(dueDateObj) && complaint.status !== "Resolved";

  const priorityColors = {
    High: "bg-rose-50 text-rose-700 border-rose-200/80 font-bold",
    Medium: "bg-amber-50 text-amber-800 border-amber-200/80 font-semibold",
    Low: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  };

  const statusColors = {
    "Pending": "bg-slate-100 text-slate-700 border-slate-200",
    "In Progress": "bg-blue-50 text-blue-700 border-blue-200/80 font-semibold",
    "Resolved": "bg-emerald-50 text-emerald-700 border-emerald-200/80 font-semibold",
  };

  return (
    <Card className={`overflow-hidden border rounded-3xl shadow-xs hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative ${isOverdue ? 'border-red-300/80 shadow-red-100/50' : 'border-slate-200/80'}`}>
      {isOverdue && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 rounded-l-3xl" />
      )}
      <CardContent className="p-0">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex justify-between items-start gap-2">
            <div className="flex flex-wrap gap-1.5 items-center">
              <Badge variant="outline" className={`px-2.5 py-0.5 rounded-lg text-[11px] ${priorityColors[complaint.priority]}`}>
                {complaint.priority} Priority
              </Badge>
              <Badge variant="outline" className={`px-2.5 py-0.5 rounded-lg text-[11px] ${statusColors[complaint.status]}`}>
                {complaint.status}
              </Badge>
              {isOverdue && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex gap-1 items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-red-600" /> Overdue
                </Badge>
              )}
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              #{complaint.id}
            </span>
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{complaint.title}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate font-medium">{complaint.citizenName}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate font-medium">{complaint.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-medium">Submitted: {format(parseISO(complaint.submissionDate), 'MMM d, yyyy')}</span>
            </div>
            <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600 font-bold' : 'font-medium'}`}>
              <Clock className="w-4 h-4 shrink-0" />
              <span>Due: {format(dueDateObj, 'MMM d, yyyy')}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold text-slate-500 pt-1">
            <span className="bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/50">{complaint.category}</span>
            <span className="bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/50">{complaint.department}</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-slate-50/80 border-t border-slate-100 p-4 flex flex-wrap items-center gap-2">
          {complaint.status === "Pending" && (
            <button 
              onClick={() => onAction(complaint.id, "Accept Task")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 active:scale-98"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Accept Task
            </button>
          )}
          
          {complaint.status === "In Progress" && (
            <>
              <button 
                onClick={() => onAction(complaint.id, "Update Progress")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" /> Update
              </button>
              <button 
                onClick={() => onAction(complaint.id, "Upload Image")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" /> Images
              </button>
              <button 
                onClick={() => onAction(complaint.id, "Resolve")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 active:scale-98"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
              </button>
            </>
          )}
          
          {complaint.status === "Resolved" && (
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Task Completed
            </div>
          )}
          
          {complaint.status !== "Resolved" && (
            <button 
              onClick={() => onAction(complaint.id, "Request Info")}
              className="ml-auto flex items-center gap-1 px-2.5 py-1.5 text-slate-400 hover:text-slate-600 rounded-lg text-xs font-medium transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5" /> Request Info
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
