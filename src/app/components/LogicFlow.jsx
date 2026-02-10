import { Upload, BrainCircuit, MessageSquare } from 'lucide-react';

export default function LogicFlow() {
  return (
    <section className="py-20 bg-[#0c1212] border-t border-white/5 relative overflow-hidden" id="features">
      
      {/* 1. BACKGROUND GRID PATTERN (CSS translated to Tailwind) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
      
      <div className="relative z-10 max-w-[1080px] mx-auto px-4 sm:px-10">
        
        {/* Header */}
        <div className="flex flex-col gap-4 mb-16 text-center">
          <h2 className="text-white text-3xl sm:text-4xl font-bold tracking-tight">Logic Flow</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Three simple steps to absolute intelligence. From raw PDF to actionable insights in seconds.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* Connector Line (Hidden on Mobile, Visible on Desktop) */}
          <div className="hidden md:block absolute top-[40px] left-[16%] right-[16%] h-[2px] border-t-2 border-dashed border-white/10 z-0"></div>

          {/* === STEP 1: UPLOAD === */}
          <div className="group relative z-10">
            {/* Glass Panel */}
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] p-6 rounded-xl h-full flex flex-col gap-4 transition-all duration-300 hover:border-[#39E079]/30 hover:bg-white/5">
              
              {/* Icon Box */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-2">
                <Upload className="text-white w-6 h-6" />
              </div>
              
              {/* Text */}
              <div>
                <h3 className="text-white text-xl font-bold mb-2">Step 1: Upload</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Securely upload PDFs, Financial Blueprints, or Medical X-rays via drag-and-drop or API.
                </p>
              </div>
            </div>
          </div>

          {/* === STEP 2: BRAIN (Animated) === */}
          <div className="group relative z-10">
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] p-6 rounded-xl h-full flex flex-col gap-4 transition-all duration-300 hover:border-[#39E079]/30 hover:bg-white/5">
              
              {/* Icon Box with Pulse/Spin */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-2 relative overflow-hidden">
                <BrainCircuit className="text-[#39E079] w-7 h-7 animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-0 bg-[#39E079]/10 animate-pulse"></div>
              </div>
              
              <div>
                <h3 className="text-white text-xl font-bold mb-2">Step 2: Building Brain</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Our engine vectorizes your data, creating a semantic map that understands context, not just keywords.
                </p>
              </div>
            </div>
          </div>

          {/* === STEP 3: QUIZ === */}
          <div className="group relative z-10">
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] p-6 rounded-xl h-full flex flex-col gap-4 transition-all duration-300 hover:border-[#39E079]/30 hover:bg-white/5">
              
              {/* Icon Box */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-2">
                <MessageSquare className="text-white w-6 h-6" />
              </div>
              
              <div>
                <h3 className="text-white text-xl font-bold mb-2">Step 3: Ready for Quiz</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Ask complex questions and get grounded answers with direct citations to the source page.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}