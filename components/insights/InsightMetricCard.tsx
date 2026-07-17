import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface InsightMetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  trendUp?: boolean;
  colorClass: string;
  bgClass: string;
}

export function InsightMetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendUp,
  colorClass,
  bgClass
}: InsightMetricCardProps) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex items-start gap-4 h-full">
        <div className={`p-3 rounded-2xl ${bgClass} shrink-0`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight leading-none mb-1.5">{value}</h3>
          
          {description && (
            <p className="text-xs text-slate-500 mb-2 leading-snug">{description}</p>
          )}

          {trend && (
            <div className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ${trendUp ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
