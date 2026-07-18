import React from "react";
import { Check, Clock, Play, Inbox, Briefcase, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export type TrackingStage = 
  | "Submitted"
  | "Under Review"
  | "Assigned to Department"
  | "Work Started"
  | "Work Completed"
  | "Resolved";

const STAGES: { name: TrackingStage; icon: React.ElementType; description: string }[] = [
  { name: "Submitted", icon: Inbox, description: "Your complaint has been successfully submitted." },
  { name: "Under Review", icon: Clock, description: "Our team is reviewing the details of the issue." },
  { name: "Assigned to Department", icon: Briefcase, description: "The issue has been assigned to the relevant department." },
  { name: "Work Started", icon: Play, description: "On-site work or processing has commenced." },
  { name: "Work Completed", icon: Check, description: "The primary work has been finished and is awaiting final checks." },
  { name: "Resolved", icon: CheckCircle2, description: "The issue has been successfully resolved and closed." },
];

interface TrackerTimelineProps {
  currentStage: TrackingStage;
}

export function TrackerTimeline({ currentStage }: TrackerTimelineProps) {
  const currentIndex = STAGES.findIndex((s) => s.name === currentStage);

  return (
    <div className="relative pl-4 space-y-6 mt-4">
      {STAGES.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;
        
        const Icon = stage.icon;

        return (
          <div key={stage.name} className="relative flex items-start gap-4">
            {/* Vertical Line */}
            {index < STAGES.length - 1 && (
              <div 
                className={`absolute left-[11px] top-8 bottom-[-24px] w-0.5 ${isCompleted ? 'bg-blue-500' : 'bg-slate-200'}`}
              />
            )}

            {/* Icon Node */}
            <div className="relative z-10 shrink-0 mt-1">
              {isCompleted ? (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-sm">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              ) : isCurrent ? (
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                  <div className="relative w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow-md border-2 border-white">
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center">
                  <Icon className="w-3 h-3 text-slate-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
              <h4 className={`text-sm font-bold ${isCurrent ? 'text-blue-700' : isCompleted ? 'text-slate-800' : 'text-slate-500'}`}>
                {stage.name}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">{stage.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
