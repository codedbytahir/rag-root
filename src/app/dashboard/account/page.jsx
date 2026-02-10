'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Mail, Shield, ArrowLeft, Loader2, Calendar, UserCircle } from 'lucide-react';
import { createClient } from '@/app/utils/supabase/client';

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#10b981]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-8 selection:bg-[#10b981] selection:text-black">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <Link href="/dashboard" className="text-gray-500 hover:text-white flex items-center gap-2 text-sm mb-4 transition-colors">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your profile and security preferences.</p>
        </div>

        <div className="space-y-6">

          {/* Profile Card */}
          <div className="bg-[#18181b] border border-white/[0.08] rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <UserCircle size={120} />
            </div>

            <div className="flex items-center gap-6 mb-8 relative z-10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#10b981] to-[#0bcbcb] p-1">
                <div className="w-full h-full rounded-full bg-[#18181b] flex items-center justify-center">
                  <User size={32} className="text-[#10b981]" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.user_metadata?.full_name || 'RAG Root User'}</h2>
                <p className="text-gray-500 text-sm">Personal Account</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Mail size={10} /> Email Address
                </label>
                <div className="bg-[#09090b] border border-white/5 px-4 py-3 rounded-lg text-sm text-gray-300">
                  {user?.email}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Shield size={10} /> Account Status
                </label>
                <div className="bg-[#09090b] border border-white/5 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                  <span className="text-gray-300">Verified</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar size={10} /> Member Since
                </label>
                <div className="bg-[#09090b] border border-white/5 px-4 py-3 rounded-lg text-sm text-gray-300">
                  {new Date(user?.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>
          </div>

          {/* Security Banner */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-6 flex items-start gap-4">
            <Shield className="text-[#10b981] shrink-0 mt-1" size={20} />
            <div>
              <h4 className="text-sm font-bold text-[#10b981]">Privacy & Security</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Your account is protected by industry-standard encryption. We never share your data with third-party LLM providers for training purposes.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
