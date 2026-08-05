import React from "react";

export function SmartBharatLogo({ className = "w-9 h-9", showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className="flex items-center gap-3 group select-none">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring with subtle saffron & blue gradient */}
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#FF9933] via-[#2563EB] to-[#138808] opacity-70 blur-[3px] group-hover:opacity-100 transition duration-300" />
        
        {/* Main Logo Container */}
        <div className={`${className} relative rounded-xl bg-[#0F172A] border border-white/20 flex items-center justify-center shadow-md overflow-hidden transition-transform duration-300 group-hover:scale-105`}>
          {/* Background subtle radial gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1e3a5f,transparent_70%)]" />
          
          {/* Ashoka Chakra & AI Hybrid SVG */}
          <svg className="w-3/4 h-3/4 text-white relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Ring */}
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
            
            {/* 12 stylized spokes / rays simulating Ashoka Chakra */}
            <g opacity="0.65" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <line x1="12" y1="3" x2="12" y2="21" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="5.636" y1="5.636" x2="18.364" y2="18.364" />
              <line x1="5.636" y1="18.364" x2="18.364" y2="5.636" />
            </g>
            
            {/* Center AI Core / Hub */}
            <circle cx="12" cy="12" r="3.5" fill="#2563EB" />
            <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
            
            {/* Sparkle Nodes */}
            <circle cx="12" cy="4" r="1.2" fill="#FF9933" />
            <circle cx="20" cy="12" r="1.2" fill="#138808" />
            <circle cx="12" cy="20" r="1.2" fill="#FF9933" />
            <circle cx="4" cy="12" r="1.2" fill="#138808" />
          </svg>
        </div>

        {/* Small Saffron Accent Dot on Top Right */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9933] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF9933] border-2 border-white" />
        </span>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[#0F172A] text-lg leading-none tracking-tight">Smart Bharat</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-widest">
              AI
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 leading-none mt-1">National Civic Platform</p>
        </div>
      )}
    </div>
  );
}
