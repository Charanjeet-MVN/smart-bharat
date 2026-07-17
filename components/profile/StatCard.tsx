import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass: string;
  bgClass: string;
}

export function StatCard({ title, value, icon: Icon, description, trend, colorClass, bgClass }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 flex flex-col justify-between h-full relative">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${bgClass} shrink-0`}>
            <Icon className={`w-6 h-6 ${colorClass}`} />
          </div>
          {trend && (
            <div className={`text-xs font-bold px-2 py-1 rounded-full ${trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </div>
          )}
        </div>
        
        <div>
          <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
          {description && (
            <p className="text-xs text-slate-400 mt-2 font-medium">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
