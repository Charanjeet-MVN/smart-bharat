"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InsightRecommendationCardProps {
  title: string;
  description: string;
  isImportant?: boolean;
}

export function InsightRecommendationCard({ title, description, isImportant }: InsightRecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${isImportant ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-white'}`}>
      <CardContent className="p-0">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-start gap-3 text-left focus:outline-none focus:bg-slate-50 transition-colors"
        >
          <div className={`mt-0.5 shrink-0 ${isImportant ? 'text-amber-500' : 'text-blue-500'}`}>
            <Lightbulb className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0 pr-4">
            <h4 className={`font-semibold text-sm ${isImportant ? 'text-amber-900' : 'text-slate-800'}`}>
              {title}
            </h4>
          </div>

          <div className="shrink-0 text-slate-400 mt-0.5">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 pb-4 pt-1 pl-12 text-sm text-slate-600 leading-relaxed border-t border-slate-100/50 mt-1">
                {description}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
