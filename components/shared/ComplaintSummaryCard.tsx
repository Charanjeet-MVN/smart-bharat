"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, AlertCircle, Tag } from "lucide-react";

export interface ComplaintSummaryData {
  title: string;
  summary: string;
  department: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category: string;
}

export interface ComplaintSummaryCardProps {
  data?: ComplaintSummaryData;
  isLoading?: boolean;
}

export function ComplaintSummaryCard({ data, isLoading = false }: ComplaintSummaryCardProps) {
  if (isLoading || !data) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-sm">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
        <CardFooter className="pt-0 flex justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </CardFooter>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200";
      case "URGENT":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200";
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-sm border-slate-200 transition-all hover:shadow-md">
      <CardHeader className="pb-3 space-y-3">
        <CardTitle className="text-xl font-bold leading-tight text-slate-800">
          {data.title}
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className={`font-bold ${getPriorityColor(data.priority)}`}
          >
            {data.priority} PRIORITY
          </Badge>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100">
            <Tag className="w-3 h-3 mr-1" />
            {data.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {data.summary}
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 border-t border-slate-100 mt-2 px-6 py-4">
        <div className="flex items-center text-sm font-semibold text-slate-500">
          <Building2 className="w-4 h-4 mr-2 text-slate-400" />
          Assigned to: <span className="text-slate-800 ml-1">{data.department}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
