"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Bot, Award, AlertTriangle, ClipboardList, MapPin, 
  LineChart, TrendingUp, Map, Briefcase, User, ShieldCheck
} from "lucide-react";
import { SmartBharatLogo } from "@/components/shared/SmartBharatLogo";
import { NotificationCenter } from "@/components/shared/NotificationCenter";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";

export function HeaderNavigation({ userId: _userId }: { userId?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  const isAdminRoute = ["/insights", "/performance", "/heatmap", "/officer"].some(r => pathname?.startsWith(r));
  const [overrideMode, setOverrideMode] = useState<"citizen" | "admin" | null>(null);

  const mode = overrideMode !== null ? overrideMode : (isAdminRoute ? "admin" : "citizen");

  const handleModeSwitch = (targetMode: "citizen" | "admin") => {
    setOverrideMode(targetMode);
    if (targetMode === "admin") {
      if (!isAdminRoute) {
        router.push("/insights");
      }
    } else {
      if (isAdminRoute) {
        router.push("/");
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Mode Switcher */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href={mode === "admin" ? "/insights" : "/"} className="shrink-0">
              <SmartBharatLogo />
            </Link>

            {/* Mode Switcher Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
              <button
                onClick={() => handleModeSwitch("citizen")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === "citizen"
                    ? "bg-white text-blue-600 shadow-xs border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Citizen</span>
              </button>
              <button
                onClick={() => handleModeSwitch("admin")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === "admin"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Navigation Links (Citizen vs Admin) */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 px-1">
            {mode === "citizen" ? (
              /* Citizen Navigation Links */
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                <Link
                  href="/ask"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    pathname === "/ask" ? "bg-white text-blue-600 shadow-2xs border border-slate-200/80" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <Bot className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>AI Assistant</span>
                </Link>
                <Link
                  href="/schemes"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    pathname === "/schemes" ? "bg-white text-orange-600 shadow-2xs border border-slate-200/80" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <Award className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Schemes</span>
                </Link>
                <Link
                  href="/report"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    pathname === "/report" ? "bg-white text-amber-600 shadow-2xs border border-slate-200/80" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-[#FF9933] shrink-0" />
                  <span>Report Issue</span>
                </Link>
                <Link
                  href="/wall"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    pathname === "/wall" ? "bg-white text-emerald-600 shadow-2xs border border-slate-200/80" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <ClipboardList className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Community Reports</span>
                </Link>
                <Link
                  href="/track"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    pathname === "/track" ? "bg-white text-pink-600 shadow-2xs border border-slate-200/80" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <MapPin className="w-4 h-4 text-pink-500 shrink-0" />
                  <span>Track</span>
                </Link>
              </div>
            ) : (
              /* Admin Navigation Links */
              <div className="flex items-center gap-1 bg-slate-900/5 p-1 rounded-xl border border-slate-900/10">
                <Link
                  href="/insights"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    pathname === "/insights" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <LineChart className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Insights</span>
                </Link>
                <Link
                  href="/performance"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    pathname === "/performance" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Performance</span>
                </Link>
                <Link
                  href="/heatmap"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    pathname === "/heatmap" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <Map className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Heatmap</span>
                </Link>
                <Link
                  href="/officer"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    pathname === "/officer" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Officer Desk</span>
                </Link>
              </div>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <NotificationCenter />

            <div className="flex items-center justify-center min-w-[32px]">
              {isLoaded && (
                isSignedIn ? (
                  <UserButton />
                ) : (
                  <SignInButton mode="modal">
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors shadow-xs"
                      title="Citizen Login"
                    >
                      <User className="w-3.5 h-3.5 text-slate-300" />
                      <span className="hidden sm:inline">Sign In</span>
                    </button>
                  </SignInButton>
                )
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
