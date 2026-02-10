'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050a08] flex items-center justify-center p-6 selection:bg-[#39E079] selection:text-black">

      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#39E079]/10 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#0bcbcb]/10 rounded-full blur-[100px] animate-pulse delay-1000 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[600px]">

        {/* 3D Glass Card */}
        <div className="relative group">
          {/* Outer Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#39E079] to-[#0bcbcb] rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

          <div className="relative bg-[#0c1212]/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-12 text-center shadow-2xl overflow-hidden">

            {/* Animated 404 Element */}
            <div className="relative mb-8">
              <h1 className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent leading-none select-none">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-[#39E079]/10 rounded-2xl border border-[#39E079]/30 flex items-center justify-center transform rotate-12 animate-[bounce_3s_ease-in-out_infinite] shadow-[0_0_30px_rgba(57,224,121,0.2)]">
                  <Ghost className="text-[#39E079] w-12 h-12" />
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <h2 className="text-3xl font-bold text-white tracking-tight">Intelligence Lost in Space</h2>
              <p className="text-gray-400 text-base leading-relaxed max-w-sm mx-auto">
                The data coordinates you provided do not exist in our vector map. Let&apos;s get you back to safety.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#39E079] hover:bg-[#0bcbcb] text-[#111818] font-bold rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(57,224,121,0.3)]"
              >
                <Home size={18} />
                Return Home
              </Link>
              <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
              >
                <ArrowLeft size={18} />
                Go Back
              </button>
            </div>

            {/* Scanning Line Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#39E079]/30 to-transparent animate-[scan_4s_linear_infinite] opacity-50"></div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="mt-8 text-center text-xs text-gray-500 font-mono tracking-widest uppercase opacity-50">
          System Error: NODE_NOT_FOUND // RAG ROOT V1.0
        </p>

      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(600px); }
        }
      `}</style>
    </div>
  );
}
