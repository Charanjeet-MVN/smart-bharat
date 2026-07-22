import React from "react";
import { Briefcase } from "lucide-react";
import { OfficerDashboard } from "@/components/officer/OfficerDashboard";

export default function OfficerPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            Officer Desk
          </h1>
          <p className="mt-2 text-base text-slate-500 max-w-2xl">
            Manage your assigned civic complaints, update progress, and resolve issues efficiently.
          </p>
        </div>
      </div>

      {/* Main Dashboard */}
      <OfficerDashboard />
    </div>
  );
}
