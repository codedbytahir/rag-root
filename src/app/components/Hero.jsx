import { ArrowRight, CheckCircle, Sparkles, Bot, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-10 flex justify-center bg-[#0f1515] overflow-hidden">
      <div className="max-w-[1280px] w-full flex flex-col gap-12 relative">
        
        {/* Background Ambient Glows (Page Level) */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#39E079]/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#0bcbcb]/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="flex flex-col gap-10 lg:flex-row items-center">
          
          {/* ================= HERO CONTENT (Left) ================= */}
          <div className="flex flex-col gap-8 flex-1 text-center lg:text-left z-10">
            <div className="flex flex-col gap-4">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit mx-auto lg:mx-0">
                <span className="w-2 h-2 rounded-full bg-[#39E079] animate-pulse"></span>
                <span className="text-xs font-medium text-[#39E079] uppercase tracking-wider">v2.0 Now Available</span>
              </div>

              {/* Headline */}
              <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                Transform Messy Data into <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#39E079] drop-shadow-[0_0_25px_rgba(57,224,121,0.3)]">
                  Grounded Intelligence.
                </span>
              </h1>

              {/* Subtext */}
              <h2 className="text-gray-400 text-lg sm:text-xl font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                No-code RAG for teams that need 100% accuracy in Finance & Healthcare. Eliminate hallucinations with verifiable citations.
              </h2>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link href="/login" className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-[#39E079] hover:bg-[#0bcbcb] text-[#111818] text-base font-bold transition-transform hover:scale-105 shadow-[0_0_20px_rgba(57,224,121,0.3)]">
                Get Started for Free
              </Link>
              <Link href="#use-cases" className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 border border-white/20 bg-white/5 hover:bg-white/10 text-white text-base font-bold transition-all group">
                <div className="flex items-center gap-2">
                  Explore Platform
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-gray-500 text-sm font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-[#39E079]" /> SOC2 Compliant
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-[#39E079]" /> HIPAA Ready
              </div>
            </div>
          </div>

          {/* ================= HERO VISUAL (Right - CSS Mockup) ================= */}
          <div className="flex-1 w-full max-w-[600px] lg:max-w-none relative">
            
            {/* Decorative Glow Behind the Box */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#39E079]/15 blur-[80px] rounded-full pointer-events-none"></div>

            {/* The Glass Panel Window */}
            <div className="relative w-full aspect-[4/3] bg-white/[0.03] backdrop-blur-md rounded-xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
              
              {/* Fake Browser Header */}
              <div className="h-8 bg-[#1a2626] border-b border-white/5 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                <div className="ml-4 px-3 py-0.5 rounded-md bg-black/20 text-[10px] text-gray-500 flex-1 text-center font-mono truncate">
                  rag-root.app/financial-analysis
                </div>
              </div>

              {/* Inner Content Area */}
              <div className="flex flex-1 overflow-hidden relative">
                
                {/* Connecting "Magic" Button (Center Overlay) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-[#39E079] shadow-[0_0_20px_#39E079] flex items-center justify-center text-black z-10 relative">
                    <Sparkles size={20} className="animate-pulse" />
                  </div>
                  {/* The Line passing through */}
                  <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#39E079] to-transparent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"></div>
                </div>

                {/* LEFT SIDE: Complex Data (CSS Charts) */}
                <div className="w-1/2 bg-[#141b1b] p-4 relative border-r border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#141b1b]/90 z-10"></div>
                  
                  {/* Dummy Data UI */}
                  <div className="space-y-3 opacity-60">
                    <div className="h-2 w-1/3 bg-gray-600 rounded"></div>
                    
                    {/* The Chart */}
                    <div className="h-32 w-full bg-gray-700/30 rounded border border-gray-700/50 p-2 flex items-end justify-between gap-1">
                      <div className="w-full bg-slate-600 h-[40%] rounded-t-sm"></div>
                      <div className="w-full bg-slate-600 h-[60%] rounded-t-sm"></div>
                      <div className="w-full bg-[#39E079]/40 h-[80%] relative rounded-t-sm group">
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-[#39E079] opacity-100">High</div>
                      </div>
                      <div className="w-full bg-slate-600 h-[50%] rounded-t-sm"></div>
                    </div>

                    {/* Lower Bars */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="h-2 bg-gray-700 rounded col-span-1"></div>
                      <div className="h-2 bg-gray-700 rounded col-span-3"></div>
                      <div className="h-2 bg-gray-700 rounded col-span-2"></div>
                      <div className="h-2 bg-gray-700 rounded col-span-2"></div>
                    </div>

                    {/* Alert Box */}
                    <div className="p-2 border border-red-500/30 bg-red-500/5 rounded text-[8px] text-red-200 font-mono">
                       CRITICAL VARIANCE DETECTED IN Q3...
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: Clean Chat */}
                <div className="w-1/2 bg-[#0f1515] p-4 flex flex-col gap-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0f1515]/90 z-10"></div>
                  
                  <div className="mt-auto space-y-4 z-20 relative pl-4">
                    {/* AI Message Bubble */}
                    <div className="flex gap-2 items-start">
                      <div className="w-6 h-6 rounded-sm bg-[#39E079]/20 flex items-center justify-center shrink-0 mt-1">
                        <Bot size={14} className="text-[#39E079]" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="bg-[#182121] border border-white/10 p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl text-xs text-gray-200 leading-relaxed shadow-lg">
                           Q3 revenue showed a <span className="text-[#39E079] font-bold">14.2% variance</span> compared to projections.
                        </div>
                        {/* Citation Button */}
                        <div className="flex gap-2">
                          <button className="flex items-center gap-1 px-2 py-1 rounded bg-[#39E079]/10 hover:bg-[#39E079]/20 border border-[#39E079]/20 text-[9px] text-[#39E079] transition-colors cursor-pointer">
                            <FileText size={10} />
                            Page 4, Section 2
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}