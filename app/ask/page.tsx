"use client";

import { useState } from "react";
import { Bot, Sparkles, Send, Loader2, FileText, CheckCircle, ExternalLink, HelpCircle, RefreshCw, AlertTriangle, ArrowRight } from "lucide-react";

interface DecodedCard {
  isInvalid?: boolean;
  title: string;
  description: string;
  category: string;
  benefits: string;
  eligibility: string;
  documentsRequired: string[];
  howToApply: string;
  officialUrl: string;
}

const SAMPLE_PROMPTS = [
  "PM Kisan Samman Nidhi documents & eligibility",
  "How do I renew my Passport online?",
  "Steps to apply for Ration Card",
  "PM Awas Yojana housing subsidy eligibility",
  "Driving License renewal process and fees"
];

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DecodedCard | null>(null);
  const [lastQuestion, setLastQuestion] = useState("");

  const handleDecode = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = (customQuery || question).trim() || lastQuestion.trim();
    if (!q) return;

    if (customQuery) {
      setQuestion(customQuery);
    }

    setLoading(true);
    setError("");
    setResult(null);
    setLastQuestion(q);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setResult(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    handleDecode();
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 space-y-8">
      {/* Intro section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>Powered by Gemini AI</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl lg:text-5xl flex items-center justify-center gap-3">
          <Bot className="w-10 h-10 text-blue-600 shrink-0" />
          <span>AI Civic Assistant</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Empowering 1.4 Billion Citizens with AI-Driven Public Services, Instant Scheme Discovery, and Transparent Issue Resolution.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleDecode} className="relative bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200 p-5 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
        <textarea
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything (e.g. What documents are required for PM Kisan? How to renew Passport?)"
          className="w-full text-slate-800 placeholder-slate-400 focus:outline-none resize-none text-base border-0 focus:ring-0 p-1 bg-transparent"
          disabled={loading}
          aria-label="Civic query input"
        />
        
        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Try:
          </span>
          {SAMPLE_PROMPTS.map((promptText, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleDecode(undefined, promptText)}
              disabled={loading}
              className="text-[11px] font-medium bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/80 transition-all text-left truncate max-w-[220px]"
            >
              {promptText}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 mt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Structured instant response powered by Gemini AI
          </span>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 active:scale-98"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Query...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Ask Assistant
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error message with retry */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 text-sm flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-medium px-3 py-1.5 rounded-xl text-xs transition-all shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Decoded Card */}
      {result && (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden transition-all duration-300 transform hover:shadow-2xl">
          {/* Unrecognized / Invalid Query Rendering */}
          {result.isInvalid ? (
            <div className="p-8 bg-amber-50/50 border border-amber-200/60 rounded-3xl space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 uppercase tracking-wider mb-2">
                    {result.category || "Unrecognized Query"}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">{result.title}</h2>
                  <p className="mt-2 text-slate-600 text-sm leading-relaxed">{result.description}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-amber-200/60 bg-white p-5 rounded-2xl shadow-2xs">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  Suggested Topics to Ask:
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{result.howToApply}</p>
              </div>

              <div className="flex justify-end">
                <a
                  href={result.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all"
                >
                  Visit National Portal of India
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            /* Valid Scheme / Service Rendering */
            <>
              {/* Card Header */}
              <div className="bg-gradient-to-br from-[#0F172A] via-[#1E3A5F] to-[#2563EB] p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-blue-100 uppercase tracking-wider mb-3 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {result.category || "Civic Service"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">{result.title}</h2>
                <p className="mt-3 text-blue-100/90 font-normal leading-relaxed text-sm sm:text-base max-w-2xl">
                  {result.description}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Eligibility & Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60 shadow-2xs">
                    <h3 className="font-bold text-slate-900 text-xs tracking-wider uppercase flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Eligibility Criteria
                    </h3>
                    <p className="text-slate-700 text-sm leading-relaxed font-medium">{result.eligibility}</p>
                  </div>

                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60 shadow-2xs">
                    <h3 className="font-bold text-slate-900 text-xs tracking-wider uppercase flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Key Benefits
                    </h3>
                    <p className="text-slate-700 text-sm leading-relaxed font-medium">{result.benefits}</p>
                  </div>
                </div>

                {/* Documents Required */}
                <div>
                  <h3 className="font-bold text-slate-900 text-xs tracking-wider uppercase flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-amber-600" />
                    Required Documents
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.documentsRequired && result.documentsRequired.length > 0 ? (
                      result.documentsRequired.map((doc, idx) => (
                        <span key={idx} className="bg-amber-50/80 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-semibold border border-amber-200/70 shadow-2xs">
                          {doc}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">None specified.</span>
                    )}
                  </div>
                </div>

                {/* How to Apply */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="font-bold text-slate-900 text-xs tracking-wider uppercase flex items-center gap-2 mb-3">
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                    How to Apply / Step-by-Step
                  </h3>
                  <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60 font-sans shadow-2xs">
                    {result.howToApply}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-xs text-slate-400">
                  Disclaimer: AI-generated guidance. Always verify on official portals.
                </span>
                <a
                  href={result.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10"
                >
                  Go to Official Website
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
