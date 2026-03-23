'use client';

import Link from 'next/link';
import { Network, ShieldCheck, Zap, Globe, Cpu } from 'lucide-react';
import { createClient } from '../utils/supabase/client';

export default function LoginPage() {
  
  const handleGoogleLogin = async () => {
    const supabase = createClient();
    
    // Fallback to location.origin if NEXT_PUBLIC_SITE_URL is not set
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const redirectTo = `${siteUrl}/api/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error("Login failed:", error.message);
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#050a08] text-white font-sans selection:bg-[#39E079] selection:text-black">
      
      {/* ================= LEFT PANEL ================= */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between relative overflow-hidden bg-[#0c1212] border-r border-white/5 p-12 xl:p-16">
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(57,224,121,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(57,224,121,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 z-0"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#39E079]/20 rounded-full blur-[100px] animate-pulse z-0"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#0bcbcb]/10 rounded-full blur-[100px] animate-pulse delay-1000 z-0"></div>
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#39E079]/50 to-transparent opacity-50 animate-[scan_6s_linear_infinite] z-0 pointer-events-none"></div>

        <Link href="/" className="relative z-10 flex items-center gap-3 group w-fit">
           <div className="relative w-10 h-10 bg-gradient-to-br from-[#1a2520] to-[#0c1212] rounded-lg border border-[#39E079]/30 flex items-center justify-center shadow-[0_0_15px_rgba(57,224,121,0.2)] group-hover:scale-105 transition-transform duration-300">
               <Network className="text-[#39E079] w-5 h-5" />
           </div>
           <span className="text-xl font-bold tracking-tight">RAG ROOT</span>
        </Link>

        <div className="relative z-10 mt-auto mb-12 max-w-lg space-y-6">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39E079]/10 border border-[#39E079]/20 text-[#39E079] text-xs font-bold tracking-wider uppercase w-fit">
              <Zap size={12} fill="currentColor" /> v1.0 Live
           </div>
           
           <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
             Turn messy documents into <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39E079] to-[#0bcbcb]">grounded answers.</span>
           </h1>
           
           <p className="text-lg text-gray-400 font-normal leading-relaxed">
             Enterprise-grade RAG for Finance & Healthcare. Eliminate hallucinations with verifiable citations and 100% data privacy.
           </p>

           <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                 <Globe className="text-[#39E079] mb-2" size={20} />
                 <div className="text-sm font-bold text-white">SOC2 Type II</div>
                 <div className="text-xs text-gray-500">Security Certified</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                 <Cpu className="text-[#0bcbcb] mb-2" size={20} />
                 <div className="text-sm font-bold text-white">Zero Latency</div>
                 <div className="text-xs text-gray-500">Real-time Processing</div>
              </div>
           </div>
        </div>

        <div className="relative z-10 flex gap-6 text-xs text-gray-500 font-medium uppercase tracking-wider">
          <span>© {new Date().getFullYear()} RAG ROOT Inc.</span>
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] z-0"></div>

        <Link href="/" className="lg:hidden mb-8 flex items-center gap-2 z-10">
           <div className="w-8 h-8 bg-[#39E079] rounded flex items-center justify-center text-black">
             <Network size={20} />
           </div>
           <span className="font-bold text-xl">RAG ROOT</span>
        </Link>

        <div className="relative w-full max-w-[400px] z-10">
            
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#39E079] to-[#0bcbcb] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>

            <div className="relative bg-[#0c1212]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
                    <p className="mt-2 text-sm text-gray-400">Access your intelligent workspace.</p>
                </div>

                <button 
                    onClick={handleGoogleLogin}
                    aria-label="Continue with Google"
                    className="group relative w-full flex items-center justify-center gap-4 bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-[#39E079]/50 text-white font-bold py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(57,224,121,0.15)] overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#39E079]/10 via-transparent to-[#0bcbcb]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-[-5deg] transition-transform duration-300">
                      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    </div>
                    
                    <span className="relative z-10 text-lg tracking-tight">Continue with Google</span>

                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shine_1.5s_ease-in-out_infinite]" />
                </button>

                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                    <ShieldCheck size={12} className="text-[#39E079]" />
                    <span>Secure Auth</span>
                </div>

            </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes scan {
            0% { top: -10%; }
            100% { top: 110%; }
        }
        @keyframes shine {
            0% { left: -100%; }
            100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
