"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb, 
  Copy,
  ArrowRight
} from "lucide-react";

export interface AISuggestionsPanelProps {
  isLoading?: boolean;
  department?: string;
  priority?: string;
  similarIssue?: { id: string; title: string } | null;
  nextAction?: string;
  onSupportSimilar?: () => void;
  onCreateNew?: () => void;
}

export function AISuggestionsPanel({
  isLoading = false,
  department,
  priority,
  similarIssue,
  nextAction,
  onSupportSimilar,
  onCreateNew
}: AISuggestionsPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-500 animate-pulse" />
          AI Analysis in Progress...
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="shadow-sm border-slate-100">
            <CardContent className="p-4 flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="space-y-2 flex-1 mt-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-100">
            <CardContent className="p-4 flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="space-y-2 flex-1 mt-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!department && !priority && !similarIssue && !nextAction) {
    return null;
  }

  const getPriorityColor = (p: string) => {
    switch (p?.toUpperCase()) {
      case "LOW": return "bg-green-100 text-green-800 border-green-200";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "HIGH": return "bg-orange-100 text-orange-800 border-orange-200";
      case "URGENT": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">
      <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        AI Suggestions & Analysis
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Department Card */}
        {department && (
          <Card className="shadow-sm border-slate-200 bg-white hover:border-blue-300 transition-colors">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Suggested Department</p>
                <p className="text-sm font-semibold text-slate-800">{department}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Priority Card */}
        {priority && (
          <Card className="shadow-sm border-slate-200 bg-white hover:border-orange-300 transition-colors">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Estimated Priority</p>
                <Badge variant="outline" className={`font-bold text-[10px] px-2 py-0.5 ${getPriorityColor(priority)}`}>
                  {priority}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Similar Issue Card (Takes full width if present) */}
        {similarIssue && (
          <Card className="shadow-sm border-amber-200 bg-amber-50 sm:col-span-2">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
                  <Copy className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Similar Issue Found</p>
                  <p className="text-sm font-medium text-amber-900 italic">"{similarIssue.title}"</p>
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <button
                  type="button"
                  onClick={onSupportSimilar}
                  className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-xl text-xs transition-colors shadow-sm"
                >
                  Support Existing
                </button>
                <button
                  type="button"
                  onClick={onCreateNew}
                  className="flex-1 sm:flex-none bg-white hover:bg-amber-100 text-amber-900 font-medium py-2 px-4 rounded-xl border border-amber-300 text-xs transition-colors"
                >
                  Create New
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Action Card (Takes full width) */}
        {nextAction && !similarIssue && (
          <Card className="shadow-sm border-emerald-200 bg-emerald-50 sm:col-span-2">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Recommended Next Action</p>
                <p className="text-sm font-medium text-emerald-900 flex items-center gap-1">
                  {nextAction}
                  <ArrowRight className="w-3 h-3 ml-1 inline-block" />
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
