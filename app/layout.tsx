import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { HeaderNavigation } from "@/components/shared/HeaderNavigation";
import { SmartBharatLogo } from "@/components/shared/SmartBharatLogo";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Bharat — Official AI Civic Companion & Government Platform",
  description:
    "Smart Bharat is India's official AI-powered civic platform. Access government services, discover eligible schemes, and report/track public complaints.",
  keywords: [
    "smart bharat",
    "government services",
    "civic platform",
    "AI citizen services",
    "india government",
    "scheme finder",
    "complaint tracker",
    "AI civic assistant"
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userId: string | null = null;
  try {
    const authObj = await auth();
    userId = authObj.userId;
  } catch {
    // Graceful degradation for Clerk auth during static rendering
  }

  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="min-h-screen bg-[#F8FAFC] font-inter antialiased flex flex-col selection:bg-blue-100 selection:text-blue-900">
          {/* Top Bar Accent (Tricolor subtle gradient strip) */}
          <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

          {/* Sticky Header Navigation with Dual Mode Switcher */}
          <HeaderNavigation userId={userId} />

          {/* Main Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <SmartBharatLogo showText={false} className="w-6 h-6" />
                <span className="font-semibold text-slate-700">Smart Bharat</span>
                <span>— Official AI Civic Platform of India</span>
              </div>
              <p className="text-slate-400">Powered by Gemini AI • Built for Indian Citizens</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
