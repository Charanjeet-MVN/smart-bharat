"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Calendar, Clock, AlertTriangle, 
  CheckCircle2, PlayCircle, Image as ImageIcon, 
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
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const statusColors = {
    "Pending": "bg-slate-100 text-slate-700 border-slate-200",
    "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
    "Resolved": "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <Card className={`overflow-hidden border shadow-sm transition-all duration-300 relative ${isOverdue ? 'border-red-300 shadow-red-100' : 'border-slate-200'}`}>
      {isOverdue && (
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
      )}
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex gap-2">
              <Badge variant="outline" className={priorityColors[complaint.priority]}>
                {complaint.priority} Priority
              </Badge>
              <Badge variant="outline" className={statusColors[complaint.status]}>
                {complaint.status}
              </Badge>
              {isOverdue && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex gap-1 items-center">
                  <AlertTriangle className="w-3 h-3" /> Overdue
                </Badge>
              )}
            </div>
            <span className="text-sm font-mono text-slate-500">#{complaint.id}</span>
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-2">{complaint.title}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mb-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{complaint.citizenName}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{complaint.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Submitted: {format(parseISO(complaint.submissionDate), 'MMM d, yyyy')}</span>
            </div>
            <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
              <Clock className="w-4 h-4 shrink-0" />
              <span>Due: {format(dueDateObj, 'MMM d, yyyy')}</span>
            </div>
          </div>
          
          <div className="flex gap-2 text-xs font-medium text-slate-500 mb-4">
            <span className="bg-slate-100 px-2 py-1 rounded-md">{complaint.category}</span>
            <span className="bg-slate-100 px-2 py-1 rounded-md">{complaint.department}</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 flex flex-wrap gap-2">
          {complaint.status === "Pending" && (
            <>
              <button 
                onClick={() => onAction(complaint.id, "Accept")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Accept Task
              </button>
            </>
          )}
          
          {complaint.status === "In Progress" && (
            <>
              <button 
                onClick={() => onAction(complaint.id, "Update Progress")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <MessageSquare className="w-4 h-4" /> Update
              </button>
              <button 
                onClick={() => onAction(complaint.id, "Upload Image")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <ImageIcon className="w-4 h-4" /> Images
              </button>
              <button 
                onClick={() => onAction(complaint.id, "Mark Resolved")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Resolve
              </button>
            </>
          )}
          
          {complaint.status === "Resolved" && (
            <div className="text-sm font-medium text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Task Completed
            </div>
          )}
          
          {complaint.status !== "Resolved" && (
            <button 
              onClick={() => onAction(complaint.id, "Request Info")}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              <AlertCircle className="w-4 h-4" /> Request Info
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
