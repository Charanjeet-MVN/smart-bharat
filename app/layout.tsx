import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Sparkles, Bot, AlertTriangle, ClipboardList, Award, UserCircle, LineChart, Activity, Map, TrendingUp, Briefcase } from "lucide-react";
import { NotificationCenter } from "@/components/NotificationCenter";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Bharat — AI Powered Civic Companion",
  description:
    "Smart Bharat is India's AI-powered civic companion. Access government services, report civic issues, and find schemes, powered by Gemini AI.",
  keywords: [
    "smart bharat",
    "government services",
    "civic platform",
    "AI citizen services",
    "india government",
    "scheme finder",
    "complaint tracker",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#f8fafc] font-inter antialiased flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/ask" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF9933] rounded-full" />
              </div>
              <div>
                <span className="font-bold text-[#1e3a5f] text-base leading-none block">Smart Bharat</span>
                <p className="text-[10px] text-slate-500 leading-none mt-0.5">AI Civic Companion</p>
              </div>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-4">
              <Link
                href="/ask"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Bot className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">AI Decoder</span>
              </Link>
              <Link
                href="/schemes"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Award className="w-4 h-4 text-orange-500" />
                <span className="hidden sm:inline">Schemes</span>
              </Link>
              <Link
                href="/insights"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <LineChart className="w-4 h-4 text-indigo-500" />
                <span className="hidden sm:inline">Insights</span>
              </Link>
              <Link
                href="/report"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-saffron text-[#FF9933]" />
                <span className="hidden sm:inline">Report Issue</span>
              </Link>
              <Link
                href="/wall"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <ClipboardList className="w-4 h-4 text-green-600" />
                <span className="hidden sm:inline">Wall</span>
              </Link>
              <Link
                href="/track"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Activity className="w-4 h-4 text-pink-500" />
                <span className="hidden sm:inline">Track</span>
              </Link>
              <Link
                href="/heatmap"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Map className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">Heatmap</span>
              </Link>
              <Link
                href="/performance"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="hidden sm:inline">Performance</span>
              </Link>
              <Link
                href="/officer"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Briefcase className="w-4 h-4 text-blue-500" />
                <span className="hidden sm:inline">Officer Desk</span>
              </Link>
              
              <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
              
              <NotificationCenter />

              <Link
                href="/profile"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors ml-1"
                title="Citizen Profile"
              >
                <UserCircle className="w-5 h-5" />
              </Link>
            </nav>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
