'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '../utils/supabase/client';

export default function Pricing() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const ctaHref = user ? "/dashboard" : "/login";

  return (
    <section className="py-24 bg-[#0c1212] relative" id="pricing">
      <div className="flex justify-center">
        <div className="flex flex-col max-w-[1280px] w-full px-4 sm:px-10">
          
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-white text-3xl sm:text-4xl font-bold tracking-tight">Free Forever</h2>
            <p className="text-gray-400">Powerful RAG capabilities for everyone, at no cost.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* === COMMUNITY PLAN === */}
            <div className="bg-white/[0.03] backdrop-blur-sm p-8 rounded-2xl flex flex-col gap-6 border border-white/5 hover:border-white/20 transition-all">
              <div>
                <h3 className="text-xl font-semibold text-white">Community</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <p className="mt-2 text-sm text-gray-400">Great for getting started with AI.</p>
              </div>
              <div className="h-px w-full bg-white/5"></div>
              <ul className="flex flex-col gap-3 text-sm text-gray-300">
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> 1 Brain</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> Basic Vector Retrieval</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> 500MB Data Storage</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> Standard Support</li>
              </ul>
              <Link href={ctaHref} className="mt-auto w-full py-3 rounded-lg border border-white/20 hover:bg-white/5 text-white font-medium transition-colors text-center">
                {user ? "Go to Dashboard" : "Start Now"}
              </Link>
            </div>

            {/* === OPEN SOURCE PLAN (Highlighted) === */}
            <div className="bg-[#39E079]/5 backdrop-blur-sm p-8 rounded-2xl flex flex-col gap-6 border border-[#39E079]/50 relative shadow-[0_0_30px_-10px_rgba(57,224,121,0.15)] transform md:-translate-y-4">
              {/* Badge */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#39E079] text-[#111818] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                Recommended
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white">Power User</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <p className="mt-2 text-sm text-gray-400">Full power for advanced users.</p>
              </div>
              <div className="h-px w-full bg-white/10"></div>
              <ul className="flex flex-col gap-3 text-sm text-white">
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> Unlimited Brains</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> API Key Access</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> Custom LLM Selection</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> 10GB Data Storage</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> Priority Processing</li>
              </ul>
              <Link href={ctaHref} className="mt-auto w-full py-3 rounded-lg bg-[#39E079] hover:bg-[#0bcbcb] text-[#111818] font-bold shadow-lg shadow-[#39E079]/20 transition-all text-center">
                {user ? "Open Dashboard" : "Get Started"}
              </Link>
            </div>

            {/* === DEVELOPER PLAN === */}
            <div className="bg-white/[0.03] backdrop-blur-sm p-8 rounded-2xl flex flex-col gap-6 border border-white/5 hover:border-white/20 transition-all">
              <div>
                <h3 className="text-xl font-semibold text-white">Developer</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <p className="mt-2 text-sm text-gray-400">Build and integrate with ease.</p>
              </div>
              <div className="h-px w-full bg-white/5"></div>
              <ul className="flex flex-col gap-3 text-sm text-gray-300">
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> Full API Access</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> Documentation & Guides</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> Community Forums</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> GitHub Integration</li>
              </ul>
              <Link href={ctaHref} className="mt-auto w-full py-3 rounded-lg border border-white/20 hover:bg-white/5 text-white font-medium transition-colors text-center">
                {user ? "Access Docs" : "Register Now"}
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
