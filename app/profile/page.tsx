"use client";

import React from "react";
import { User, Activity, CheckCircle, FileText, TrendingUp, Trophy } from "lucide-react";
import { StatCard } from "@/components/profile/StatCard";
import { AchievementCard, Achievement } from "@/components/profile/AchievementCard";
import { MonthlyActivityChart } from "@/components/profile/MonthlyActivityChart";
import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm";

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: "1",
    title: "First Complaint",
    description: "Submit your first civic issue on Smart Bharat.",
    iconType: "award",
    progress: 1,
    maxProgress: 1,
    isUnlocked: true,
    unlockedAt: "2025-01-15T00:00:00Z"
  },
  {
    id: "2",
    title: "10 Complaints Submitted",
    description: "Successfully report 10 civic issues to help the community.",
    iconType: "star",
    progress: 8,
    maxProgress: 10,
    isUnlocked: false
  },
  {
    id: "3",
    title: "5 Complaints Resolved",
    description: "Have 5 of your reported issues successfully resolved by the authorities.",
    iconType: "check-circle" as any, // fallback to default
    progress: 5,
    maxProgress: 5,
    isUnlocked: true,
    unlockedAt: "2025-06-20T00:00:00Z"
  },
  {
    id: "4",
    title: "Active Citizen",
    description: "Maintain a streak of reporting at least 1 issue every month for 6 months.",
    iconType: "shield",
    progress: 4,
    maxProgress: 6,
    isUnlocked: false
  },
  {
    id: "5",
    title: "Community Helper",
    description: "Support 20 existing complaints reported by others in your area.",
    iconType: "medal",
    progress: 12,
    maxProgress: 20,
    isUnlocked: false
  },
];

export default function ProfilePage() {
  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <User className="w-8 h-8 text-blue-600" />
            Citizen Dashboard
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Track your civic contributions, achievements, and impact on the community.
          </p>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-3 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center gap-3">
          <Trophy className="w-6 h-6" />
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Contribution Score</p>
            <p className="text-xl font-extrabold leading-none">1,450 pts</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Submitted"
          value={8}
          icon={FileText}
          trend={{ value: 12, isPositive: true }}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />
        <StatCard
          title="Resolved"
          value={5}
          icon={CheckCircle}
          trend={{ value: 8, isPositive: true }}
          colorClass="text-green-600"
          bgClass="bg-green-50"
        />
        <StatCard
          title="In Progress"
          value={2}
          icon={Activity}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
        <StatCard
          title="Avg. Resolution Time"
          value="4.2 Days"
          icon={TrendingUp}
          description="Faster than city average"
          colorClass="text-purple-600"
          bgClass="bg-purple-50"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Chart & Settings) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[350px]">
            <MonthlyActivityChart />
          </div>
          <div>
            <ProfileSettingsForm />
          </div>
        </div>

        {/* Right Column (Achievements) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Achievements
            </h2>
            <span className="text-xs font-bold text-slate-400 uppercase">
              {MOCK_ACHIEVEMENTS.filter(a => a.isUnlocked).length} / {MOCK_ACHIEVEMENTS.length} Unlocked
            </span>
          </div>
          
          <div className="flex flex-col gap-3">
            {MOCK_ACHIEVEMENTS.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
