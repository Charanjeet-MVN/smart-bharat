"use client";

import { useState, useEffect } from "react";
import { Award, Search, Building2, ExternalLink, Loader2, X } from "lucide-react";

export interface Scheme {
  name: string;
  ministry: string;
  category: string;
  description: string;
  benefits: string;
  eligibility: string;
  documents: string;
  websiteUrl: string;
}

const schemes: Scheme[] = [
  {
    name: 'PM Kisan Samman Nidhi',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Agriculture',
    description: 'Direct income support of ₹6,000 per year to all land-holding farmer families across the country.',
    benefits: '₹6,000 per year in three equal installments of ₹2,000 each',
    eligibility: 'All land-holding farmer families with cultivable land. Income limit applies for certain categories.',
    documents: 'Aadhaar card, Bank account details, Land ownership documents',
    websiteUrl: 'https://pmkisan.gov.in',
  },
  {
    name: 'PM Ujjwala Yojana',
    ministry: 'Ministry of Petroleum and Natural Gas',
    category: 'Women Empowerment',
    description: 'Free LPG connections to women belonging to BPL households to replace traditional cooking fuels.',
    benefits: 'Free LPG connection, first cylinder free, deposit waiver',
    eligibility: 'Women above 18 years from BPL households, SC/ST families, Forest dwellers.',
    documents: 'Aadhaar card, BPL card or ration card, Bank account details',
    websiteUrl: 'https://www.pmuy.gov.in',
  },
  {
    name: 'PM Awas Yojana (Urban)',
    ministry: 'Ministry of Housing and Urban Affairs',
    category: 'Housing',
    description: 'Housing for All mission providing affordable housing with subsidy on home loans for EWS and LIG categories.',
    benefits: 'Interest subsidy of 6.5% for 20 years on home loans up to ₹6 lakh',
    eligibility: 'EWS (annual income up to ₹3 lakh), LIG (₹3-6 lakh). Should not own a pucca house.',
    documents: 'Aadhaar card, Income certificate, Address proof, Bank statements',
    websiteUrl: 'https://pmaymis.gov.in',
  },
  {
    name: 'Ayushman Bharat PM-JAY',
    ministry: 'Ministry of Health and Family Welfare',
    category: 'Health',
    description: 'World\'s largest government funded health insurance scheme providing coverage of ₹5 lakh per family per year.',
    benefits: '₹5 lakh health coverage per family per year for secondary and tertiary care hospitalization',
    eligibility: 'Families identified in SECC database, BPL families, marginalized groups.',
    documents: 'Aadhaar card, Ration card, PM-JAY letter or e-card',
    websiteUrl: 'https://pmjay.gov.in',
  },
  {
    name: 'PM Mudra Yojana',
    ministry: 'Ministry of Finance',
    category: 'Finance & Business',
    description: 'Micro finance loan scheme providing loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises.',
    benefits: 'Loans up to ₹50,000 (Shishu), up to ₹5 lakh (Kishore), and up to ₹10 lakh (Tarun)',
    eligibility: 'Any Indian citizen planning to start or expand a business activity.',
    documents: 'Aadhaar card, PAN card, Bank account details, Business plan',
    websiteUrl: 'https://www.mudra.org.in',
  },
  {
    name: 'Sukanya Samriddhi Yojana',
    ministry: 'Ministry of Finance',
    category: 'Women & Girls',
    description: 'Small savings instrument for girl child as part of Beti Bachao Beti Padhao campaign with high interest rates.',
    benefits: 'High interest rate (8.2%), tax benefits under 80C, withdrawal for education',
    eligibility: 'Girl child below age 10 years. Opened in name of girl child by parent/guardian.',
    documents: 'Birth certificate of girl child, Address proof, Identity proof of guardian',
    websiteUrl: 'https://www.nsiindia.gov.in',
  },
  {
    name: 'PM Fasal Bima Yojana',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Agriculture',
    description: 'Crop insurance scheme providing financial support to farmers suffering crop loss/damage due to natural calamities.',
    benefits: 'Up to 90% of sum insured for crop losses at extremely low premium rates.',
    eligibility: 'All farmers growing notified crops in notified areas.',
    documents: 'Aadhaar card, Bank passbook, Land record/Patta, Sowing certificate',
    websiteUrl: 'https://pmfby.gov.in',
  }
];

export default function SchemesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [aiSchemes, setAiSchemes] = useState<Scheme[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    if (searchTerm.length < 2) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setAiSchemes([]);
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setSearchError("");
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");
      try {
        const res = await fetch("/api/schemes/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchTerm }),
        });
        const data = await res.json();
        if (data.success) {
          setAiSchemes(data.data || []);
        } else {
          setSearchError(data.error || "Failed to fetch AI schemes.");
        }
      } catch (_err) {
        setSearchError("An error occurred during search.");
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const localFilteredSchemes = schemes.filter(
    (scheme) =>
      scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Merge local and AI schemes, deduplicating by lowercase name
  const mergedSchemes = [...localFilteredSchemes];
  const existingNames = new Set(mergedSchemes.map(s => s.name.toLowerCase()));
  
  for (const aiScheme of aiSchemes) {
    if (aiScheme.name && !existingNames.has(aiScheme.name.toLowerCase())) {
      mergedSchemes.push(aiScheme);
      existingNames.add(aiScheme.name.toLowerCase());
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-8">
      {/* Intro Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/60 shadow-xs">
          <Award className="w-3.5 h-3.5 text-orange-600" />
          <span>Verified Central & State Benefits</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl lg:text-5xl flex items-center justify-center gap-3">
          <Award className="w-10 h-10 text-[#FF9933] shrink-0" />
          <span>Government Schemes Finder</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          Search and discover eligible Indian government schemes, financial subsidies, and welfare benefits using real-time AI.
        </p>
      </div>

      {/* Search box */}
      <div className="relative max-w-xl mx-auto">
        <div className="relative flex items-center">
          <span className="absolute left-4 pointer-events-none text-slate-400">
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-slate-400" />
            )}
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search schemes (e.g. Kisan, Ujjwala, Farmer subsidy, Health...)"
            className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-10 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm sm:text-base shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {searchError && (
          <div className="mt-2 text-center">
            <p className="text-xs text-red-600 font-medium bg-red-50 py-1.5 px-3 rounded-xl border border-red-100 inline-block shadow-2xs">
              {searchError}
            </p>
          </div>
        )}
      </div>

      {/* Schemes list */}
      <div className="space-y-6">
        {mergedSchemes.length === 0 && !isSearching ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-2xs p-8">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-bold text-lg">No schemes match your search criteria</p>
            <p className="text-slate-500 text-sm mt-1">Try searching with broader keywords like &quot;farmer&quot;, &quot;housing&quot;, or &quot;women&quot;.</p>
          </div>
        ) : (
          mergedSchemes.map((scheme, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative group overflow-hidden border-l-4 border-l-[#FF9933]"
            >
              {/* Category & Ministry Header */}
              <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
                  {scheme.category}
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {scheme.ministry}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {scheme.name}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed">
                {scheme.description}
              </p>

              {/* Grid details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5 border-t border-slate-100 text-xs">
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px] mb-1">Key Benefits</span>
                  <span className="text-slate-800 font-semibold leading-normal block">{scheme.benefits}</span>
                </div>
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px] mb-1">Eligibility</span>
                  <span className="text-slate-800 font-semibold leading-normal block">{scheme.eligibility}</span>
                </div>
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px] mb-1">Required Documents</span>
                  <span className="text-slate-800 font-semibold leading-normal block">{scheme.documents}</span>
                </div>
              </div>

              {/* External portal CTA */}
              <div className="flex justify-end mt-5 pt-3 border-t border-slate-100/60">
                <a
                  href={scheme.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
                >
                  Visit Official Portal
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
