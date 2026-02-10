'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-[#050a08] flex items-center justify-center p-6 text-white font-sans selection:bg-[#39E079] selection:text-black">

      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(57,224,121,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(57,224,121,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[500px]">

        {/* Error Card */}
        <div className="bg-[#0c1212]/90 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">

            {/* Red Alert Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-[60px]"></div>

            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/20 mb-6 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                    <ShieldAlert size={32} />
                </div>

                <h1 className="text-2xl font-bold mb-2">Authentication Failed</h1>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                    We encountered an error while validating your security code. This could be due to an expired session or an invalid authentication request.
                </p>

                <div className="w-full space-y-3">
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg"
                    >
                        Try Logging In Again
                        <ArrowRight size={18} />
                    </Link>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
                    >
                        Go to Homepage
                    </Link>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                    <AlertTriangle size={12} />
                    <span>Error Code: AUTH_VERIFICATION_FAILED</span>
                </div>
            </div>

        </div>

      </div>

    </div>
  );
}
