"use client";

import { useState } from "react";
import { Award, Search, Building2, HelpCircle, ArrowRight, ExternalLink } from "lucide-react";

const schemes = [
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

  const filteredSchemes = schemes.filter(
    (scheme) =>
      scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Intro */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl flex items-center justify-center gap-3">
          <Award className="w-9 h-9 text-[#FF9933]" />
          Government Schemes Finder
        </h1>
        <p className="mt-4 text-base text-slate-500 max-w-lg mx-auto">
          Explore key government schemes, subsidies, and citizen benefits. Use search to filter by name, category, or keyword.
        </p>
      </div>

      {/* Search box */}
      <div className="relative max-w-md mx-auto mb-10">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search schemes (e.g. Kisan, Ujjwala, Health...)"
          className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm"
        />
      </div>

      {/* Schemes list */}
      <div className="space-y-6">
        {filteredSchemes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">No schemes match your search criteria.</p>
          </div>
        ) : (
          filteredSchemes.map((scheme, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                <span className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {scheme.category}
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {scheme.ministry}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{scheme.name}</h2>
              <p className="text-sm text-slate-650 mb-4 leading-relaxed">{scheme.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider mb-1">Benefits</span>
                  <span className="text-slate-700 font-semibold">{scheme.benefits}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider mb-1">Eligibility</span>
                  <span className="text-slate-700 font-semibold">{scheme.eligibility}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider mb-1">Required Documents</span>
                  <span className="text-slate-700 font-semibold">{scheme.documents}</span>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <a
                  href={scheme.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-xs transition-all"
                >
                  Visit Official Portal
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
