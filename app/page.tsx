"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bot, Award, AlertTriangle, ClipboardList, MapPin, 
  Sparkles, ArrowRight, Search, Users, 
  CheckCircle2, Bell, Building2, ExternalLink
} from "lucide-react";
import { useComplaints } from "@/hooks/useComplaints";

export default function CitizenDashboardPage() {
  const router = useRouter();
  const [askQuery, setAskQuery] = useState("");
  const [trackIdInput, setTrackIdInput] = useState("");
  const { complaints } = useComplaints();

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuery.trim()) return;
    router.push(`/ask?q=${encodeURIComponent(askQuery.trim())}`);
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackIdInput.trim()) return;
    router.push(`/track?id=${encodeURIComponent(trackIdInput.trim())}`);
  };

  const featuredSchemes = [
    {
      name: "PM Kisan Samman Nidhi",
      category: "Agriculture",
      benefit: "₹6,000 / year income support in 3 equal installments",
      link: "https://pmkisan.gov.in"
    },
    {
      name: "Ayushman Bharat PM-JAY",
      category: "Health",
      benefit: "₹5 Lakh annual health insurance coverage per family",
      link: "https://pmjay.gov.in"
    },
    {
      name: "PM Ujjwala Yojana",
      category: "Women Welfare",
      benefit: "Free LPG gas connection & first refill subsidy",
      link: "https://www.pmuy.gov.in"
    }
  ];

  const announcements = [
    {
      date: "Aug 2026",
      title: "PM-Kisan 17th Installment Released",
      desc: "Direct Benefit Transfer of ₹2,000 credited to over 9.5 crore eligible farmers nationwide."
    },
    {
      date: "Jul 2026",
      title: "Ayushman Card Senior Citizen Extension",
      desc: "Free health coverage now extended to all senior citizens aged 70 and above regardless of income."
    },
    {
      date: "Jul 2026",
      title: "Unified Civic Complaint Resolution SLA",
      desc: "New 48-hour mandatory acknowledgment SLA implemented across all 450+ municipal corporations."
    }
  ];

  const recentReports = complaints.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 space-y-12">
      
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0F172A] via-[#1E3A5F] to-[#2563EB] text-white rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden shadow-xl shadow-slate-200/60">
        {/* Glow backdrop circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 text-amber-300 border border-white/15 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Official AI Civic Companion of India</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Empowering <span className="text-amber-400">1.4 Billion Citizens</span> with AI-Driven Public Services.
          </h1>

          <p className="text-base sm:text-lg text-blue-100/90 max-w-2xl leading-relaxed">
            Instant scheme discovery, AI-assisted complaint filing, transparent tracking, and automated civic guidance powered by Gemini AI.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/ask"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF9933] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-98"
            >
              <Bot className="w-5 h-5 text-slate-950" />
              <span>Ask AI Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/report"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-2xl border border-white/20 backdrop-blur-md transition-all active:scale-98"
            >
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Report Civic Issue</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. AI Assistant Shortcut */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Ask AI Civic Assistant</h2>
            <p className="text-xs text-slate-500">Get instant structured answers on government schemes, passport steps, or municipal rules</p>
          </div>
        </div>

        <form onSubmit={handleAskSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-3.5 text-slate-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              placeholder="E.g., PM Kisan documents required, Passport renewal process..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!askQuery.trim()}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all disabled:opacity-50 shadow-md shadow-blue-500/10 shrink-0"
          >
            <span>Ask Assistant</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </section>

      {/* 3. Popular Schemes */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/60 mb-2">
              <Award className="w-3.5 h-3.5 text-orange-600" />
              <span>Government Welfare</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">Popular Schemes Showcase</h2>
          </div>
          <Link href="/schemes" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All Schemes <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredSchemes.map((scheme, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between border-l-4 border-l-[#FF9933]">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                  {scheme.category}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2">{scheme.name}</h3>
                <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">{scheme.benefit}</p>
              </div>

              <a
                href={scheme.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 pt-2 border-t border-slate-100"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Recent Community Reports */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-2">
              <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
              <span>Public Feed</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">Recent Community Reports</h2>
          </div>
          <Link href="/wall" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All Reports <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentReports.length > 0 ? (
            recentReports.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      #{item.tracking_id || item.id}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{item.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500">{item.department} • {item.address || "Location specified"}</p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 self-start sm:self-center ${
                  item.status === "RESOLVED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                  item.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                  "bg-amber-50 text-amber-800 border border-amber-200"
                }`}>
                  {item.status}
                </span>
              </div>
            ))
          ) : (
            <div className="bg-white p-6 rounded-2xl text-center border border-slate-200 text-slate-500 text-sm">
              Loading recent community reports...
            </div>
          )}
        </div>
      </section>

      {/* 5. Track Complaint Shortcut */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h2 className="text-xl font-black">Track Complaint Status</h2>
            <p className="text-xs text-slate-300">Enter your complaint Tracking ID (e.g., COMP-100001) for instant status updates</p>
          </div>
        </div>

        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={trackIdInput}
            onChange={(e) => setTrackIdInput(e.target.value)}
            placeholder="Enter Tracking ID (e.g. COMP-100001)..."
            className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
          />
          <button
            type="submit"
            disabled={!trackIdInput.trim()}
            className="inline-flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all disabled:opacity-50 shadow-md shadow-pink-500/20 shrink-0"
          >
            <span>Track Status</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </section>

      {/* 6. Government Statistics Bar */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl font-black text-slate-900">National Impact Statistics</h2>
          <p className="text-xs text-slate-500">Real-time civic transparency and resolution metrics across India</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
            <Users className="w-5 h-5 text-blue-600 mx-auto mb-2" />
            <h3 className="text-2xl font-black text-slate-900">1.2M+</h3>
            <p className="text-[11px] font-bold text-slate-500 uppercase mt-0.5">Citizens Served</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-2xl font-black text-slate-900">98.4%</h3>
            <p className="text-[11px] font-bold text-slate-500 uppercase mt-0.5">Resolution Rate</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
            <Bot className="w-5 h-5 text-purple-600 mx-auto mb-2" />
            <h3 className="text-2xl font-black text-slate-900">24/7</h3>
            <p className="text-[11px] font-bold text-slate-500 uppercase mt-0.5">AI Assistance</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
            <Building2 className="w-5 h-5 text-amber-600 mx-auto mb-2" />
            <h3 className="text-2xl font-black text-slate-900">450+</h3>
            <p className="text-[11px] font-bold text-slate-500 uppercase mt-0.5">Municipalities</p>
          </div>
        </div>
      </section>

      {/* 7. Latest Government Announcements */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#FF9933]" />
          <h2 className="text-2xl font-black text-slate-900">Latest Government Announcements</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {announcements.map((news, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                {news.date}
              </span>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{news.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">{news.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
