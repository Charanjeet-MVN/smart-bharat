"use client";

import { useState } from "react";
import { Bot, Sparkles, Send, Loader2, FileText, CheckCircle, ExternalLink, HelpCircle } from "lucide-react";

interface DecodedCard {
  title: string;
  description: string;
  category: string;
  benefits: string;
  eligibility: string;
  documentsRequired: string[];
  howToApply: string;
  officialUrl: string;
}

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DecodedCard | null>(null);

  const handleDecode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error("Failed to decode question. Please try again.");

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Intro section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl flex items-center justify-center gap-3">
          <Bot className="w-10 h-10 text-blue-600 animate-pulse" />
          AI Civic Decoder
        </h1>
        <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
          Ask any question about Indian government schemes, subsidies, passport services, licenses, or municipal rules, and get a structured card instantly.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleDecode} className="relative bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-8">
        <textarea
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="E.g., What are the documents required and benefits of PM Kisan Samman Nidhi?"
          className="w-full text-slate-800 placeholder-slate-400 focus:outline-none resize-none text-base border-0 focus:ring-0 p-2"
          disabled={loading}
          aria-label="Civic query input"
        />
        <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Gemini will parse your request into a structured layout
          </span>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/10"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Decoding...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Decode Question
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm mb-8">
          {error}
        </div>
      )}

      {/* Decoded Card */}
      {result && (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-200 overflow-hidden transition-all duration-300 transform hover:shadow-2xl">
          {/* Card Header */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-850 p-6 sm:p-8 text-white relative">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-200 uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {result.category || "Civic Service"}
            </span>
            <h2 className="text-2xl font-bold sm:text-3xl leading-tight">{result.title}</h2>
            <p className="mt-3 text-slate-300 font-normal leading-relaxed text-sm sm:text-base">
              {result.description}
            </p>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Eligibility & Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Eligibility Criteria
                </h3>
                <p className="text-slate-650 text-sm leading-relaxed">{result.eligibility}</p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Key Benefits
                </h3>
                <p className="text-slate-650 text-sm leading-relaxed">{result.benefits}</p>
              </div>
            </div>

            {/* Documents Required */}
            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-amber-600" />
                Required Documents
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.documentsRequired && result.documentsRequired.length > 0 ? (
                  result.documentsRequired.map((doc, idx) => (
                    <span key={idx} className="bg-amber-50 text-amber-850 px-3 py-1.5 rounded-xl text-xs font-medium border border-amber-100">
                      {doc}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">None specified.</span>
                )}
              </div>
            </div>

            {/* How to Apply */}
            <div className="border-t border-slate-150 pt-6">
              <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-2 mb-3">
                <Send className="w-4 h-4 text-indigo-600" />
                How to Apply / Steps
              </h3>
              <div className="text-slate-650 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100 font-sans">
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
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10"
            >
              Go to Official Website
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
