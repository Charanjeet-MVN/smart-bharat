"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Inbox
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export interface ActivityItem {
  id: string;
  title: string;
  status: "SUBMITTED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  department: string;
  updatedAt: string;
}

export interface RecentActivityProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
}

const getStatusConfig = (status: string) => {
  switch (status.toUpperCase()) {
    case "SUBMITTED":
      return {
        icon: FileText,
        color: "text-blue-500",
        bgColor: "bg-blue-100",
        badge: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
        label: "Submitted"
      };
    case "IN_PROGRESS":
      return {
        icon: Clock,
        color: "text-amber-500",
        bgColor: "bg-amber-100",
        badge: "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200",
        label: "In Progress"
      };
    case "RESOLVED":
      return {
        icon: CheckCircle2,
        color: "text-green-500",
        bgColor: "bg-green-100",
        badge: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200",
        label: "Resolved"
      };
    case "REJECTED":
      return {
        icon: AlertCircle,
        color: "text-red-500",
        bgColor: "bg-red-100",
        badge: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200",
        label: "Rejected"
      };
    default:
      return {
        icon: Activity,
        color: "text-slate-500",
        bgColor: "bg-slate-100",
        badge: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200",
        label: status
      };
  }
};

export function RecentActivity({ activities, isLoading = false }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card className="w-full shadow-sm border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasActivities = activities && activities.length > 0;

  return (
    <Card className="w-full shadow-sm border-slate-200 transition-all hover:shadow-md">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
          <Activity className="w-5 h-5 text-indigo-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 p-0">
        {!hasActivities ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <Inbox className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No recent activity</p>
            <p className="text-sm text-slate-400 mt-1">
              Your latest civic complaints and updates will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {activities.map((activity) => {
              const config = getStatusConfig(activity.status);
              const Icon = config.icon;
              
              // Safely format date
              let timeAgo = "Unknown time";
              try {
                timeAgo = formatDistanceToNow(new Date(activity.updatedAt), { addSuffix: true });
              } catch (e) {
                console.error("Invalid date:", activity.updatedAt);
              }

              return (
                <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.bgColor}`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 truncate pr-2">
                      {activity.title}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 leading-none font-bold ${config.badge}`}>
                        {config.label}
                      </Badge>
                      <span className="text-xs font-medium text-slate-500 truncate max-w-[120px] sm:max-w-[200px]">
                        {activity.department}
                      </span>
                      <span className="text-slate-300 text-xs hidden sm:inline">•</span>
                      <span className="text-xs text-slate-400">
                        {timeAgo}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
