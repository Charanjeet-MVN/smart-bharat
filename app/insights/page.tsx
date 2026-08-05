import React from "react";
import { AdminControlCenter } from "@/components/admin/AdminControlCenter";
import { AICivicInsights } from "@/components/insights/AICivicInsights";

export default function InsightsPage() {
  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-8 space-y-8">
      {/* Admin Control Center Overview Header */}
      <AdminControlCenter />

      {/* Main Insights Analytics Component */}
      <AICivicInsights />
    </div>
  );
}
