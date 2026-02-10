import { FolderOpen, BarChart2, Settings, UserCircle, Search, Sparkles, MessageSquare } from 'lucide-react';

export default function SplitBrain() {
  return (
    <section className="py-24 px-4 sm:px-10 flex justify-center bg-[#0f1515]" id="use-cases">
      <div className="max-w-[1280px] w-full flex flex-col gap-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <h2 className="text-white text-3xl sm:text-4xl font-bold tracking-tight">Experience the Split-Brain Interface</h2>
          <p className="text-gray-400 text-lg max-w-2xl">
            See the source and the answer side-by-side. Verify facts instantly without switching tabs.
          </p>
        </div>

        {/* App Mockup Container */}
        <div className="w-full h-[600px] bg-[#1a2020] rounded-2xl border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
          
          {/* Browser Chrome */}
          <div className="h-10 bg-[#0f1515] border-b border-white/5 flex items-center px-4 justify-between shrink-0">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#2d3636]"></div>
              <div className="w-3 h-3 rounded-full bg-[#2d3636]"></div>
              <div className="w-3 h-3 rounded-full bg-[#2d3636]"></div>
            </div>
            <div className="text-xs text-gray-500 font-mono">RAG ROOT - Workspace</div>
            <div className="w-16"></div> {/* Spacer for balance */}
          </div>

          {/* Main App Area */}
          <div className="flex flex-1 overflow-hidden">
            
            {/* Sidebar (Navigation) */}
            <div className="w-16 bg-[#0f1515] border-r border-white/5 flex flex-col items-center py-4 gap-6 shrink-0 z-10">
              <div className="p-2 rounded bg-[#39E079]/20 text-[#39E079]">
                <FolderOpen size={20} />
              </div>
              <div className="p-2 rounded text-gray-500 hover:text-white transition-colors cursor-pointer">
                <BarChart2 size={20} />
              </div>
              <div className="p-2 rounded text-gray-500 hover:text-white transition-colors cursor-pointer">
                <Settings size={20} />
              </div>
              <div className="mt-auto p-2 rounded text-gray-500 cursor-pointer">
                <UserCircle size={20} />
              </div>
            </div>

            {/* === LEFT PANE: PDF SOURCE === */}
            <div className="w-1/2 bg-[#1c2424] border-r border-white/5 relative flex flex-col">
              
              {/* PDF Header */}
              <div className="h-12 border-b border-white/5 bg-[#1c2424] flex items-center justify-between px-4">
                <span className="text-xs text-gray-400 font-medium flex items-center gap-2">
                   Q3_Financial_Report.pdf
                </span>
                <div className="flex gap-2">
                    <Search size={14} className="text-gray-500" />
                    <span className="text-xs text-gray-500">14 / 52</span>
                </div>
              </div>

              {/* Scrollable PDF Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scroll bg-[#252b2b]">
                {/* The "Paper" Page */}
                <div className="bg-white max-w-[420px] mx-auto min-h-[600px] shadow-lg p-8 flex flex-col gap-4 opacity-90 relative">
                    
                    {/* Fake Header & Text */}
                    <div className="h-6 w-3/4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-gray-200 rounded mb-6"></div>

                    {/* Fake Chart in PDF */}
                    <div className="h-32 bg-blue-50 rounded p-4 border border-blue-100 mb-4">
                       <div className="h-full w-full flex items-end justify-around gap-2">
                          <div className="w-4 h-[40%] bg-blue-200"></div>
                          <div className="w-4 h-[60%] bg-blue-300"></div>
                          <div className="w-4 h-[80%] bg-blue-400"></div>
                          <div className="w-4 h-[50%] bg-blue-200"></div>
                       </div>
                    </div>

                    {/* Text Lines */}
                    <div className="space-y-2 text-justify mb-4">
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                        <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                    </div>

                    {/* The Highlighted Data Table */}
                    <div className="mt-4 p-4 border border-gray-200 rounded bg-gray-50">
                        <div className="h-3 w-1/3 bg-gray-300 rounded mb-3"></div>
                        <div className="space-y-2">
                            <div className="flex justify-between"><div className="h-2 w-1/4 bg-gray-200"></div><div className="h-2 w-1/4 bg-gray-300"></div></div>
                            <div className="flex justify-between"><div className="h-2 w-1/4 bg-gray-200"></div><div className="h-2 w-1/4 bg-gray-300"></div></div>
                            
                            {/* ACTIVE HIGHLIGHT ROW */}
                            <div className="flex justify-between relative group cursor-pointer">
                                <div className="absolute -left-2 -right-2 top-[-4px] bottom-[-4px] bg-[#39E079]/20 rounded border border-[#39E079]/50 animate-pulse"></div>
                                <div className="h-2 w-1/4 bg-gray-800 z-10 font-bold">Net Revenue</div>
                                <div className="h-2 w-1/4 bg-gray-800 z-10 font-bold">14.2%</div>
                            </div>

                            <div className="flex justify-between mt-2"><div className="h-2 w-1/4 bg-gray-200"></div><div className="h-2 w-1/4 bg-gray-300"></div></div>
                        </div>
                    </div>
                </div>
              </div>
            </div>

            {/* === RIGHT PANE: AI ANALYSIS (Added to complete the Split-Brain concept) === */}
            <div className="w-1/2 bg-[#0f1515] flex flex-col relative">
                
                {/* Chat Header */}
                <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-[#0f1515]">
                    <span className="text-xs text-[#39E079] font-bold tracking-wider uppercase flex items-center gap-2">
                        <Sparkles size={12} /> AI Analysis
                    </span>
                </div>

                {/* Chat Area */}
                <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                    
                    {/* User Query */}
                    <div className="self-end max-w-[80%]">
                        <div className="bg-[#1c2424] text-gray-300 px-4 py-3 rounded-2xl rounded-tr-sm text-sm border border-white/5">
                            What was the net revenue variance for Q3?
                        </div>
                    </div>

                    {/* AI Response */}
                    <div className="self-start max-w-[90%] flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#39E079]/10 flex items-center justify-center shrink-0 border border-[#39E079]/20">
                            <MessageSquare size={14} className="text-[#39E079]" />
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="bg-[#1c2424] text-white px-5 py-4 rounded-2xl rounded-tl-sm text-sm border border-white/5 shadow-lg relative overflow-hidden">
                                {/* Gradient sheen */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#39E079] to-transparent"></div>
                                <p className="leading-relaxed">
                                    Based on the Q3 Financial Report, the Net Revenue showed a positive variance of <strong className="text-[#39E079]">14.2%</strong> compared to the forecasted budget.
                                </p>
                            </div>
                            
                            {/* Citation Card */}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Source Verified</span>
                                <div className="h-px w-8 bg-gray-800"></div>
                                <div className="bg-[#39E079]/10 border border-[#39E079]/30 rounded px-2 py-1 text-[10px] text-[#39E079] flex items-center gap-1 cursor-pointer hover:bg-[#39E079]/20 transition-colors">
                                    Page 14, Table 3.1
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/5 bg-[#0f1515]">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Ask a follow up question..." 
                            className="w-full bg-[#161b1b] border border-white/10 rounded-lg pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-[#39E079]/50 transition-colors"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#39E079] rounded-md text-black hover:bg-[#0bcbcb] transition-colors">
                            <ArrowRightIcon />
                        </button>
                    </div>
                </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

// Simple Arrow Icon Component for the input button
function ArrowRightIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    )
}