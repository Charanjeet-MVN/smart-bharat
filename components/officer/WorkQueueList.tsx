"use client";

import React from "react";
import { ComplaintActionCard, OfficerComplaint } from "./ComplaintActionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

export function WorkQueueList({ 
  complaints, 
  loading, 
  onAction 
}: { 
  complaints: OfficerComplaint[], 
  loading: boolean,
  onAction: (id: string, action: string) => void
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-[280px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-slate-200 border-dashed text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Complaints Found</h3>
        <p className="text-slate-500 max-w-sm">
          You don't have any complaints matching the current filters. Great job keeping the queue clean!
        </p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {complaints.map(complaint => (
        <motion.div key={complaint.id} variants={item}>
          <ComplaintActionCard complaint={complaint} onAction={onAction} />
        </motion.div>
      ))}
    </motion.div>
  );
}
