'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth/supabase-client';
import {
  Brain, Plus, ChevronDown,
  ArrowRight, LogOut, User, Key, Code2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { CreateBrainModal } from '@/components/brain/create-brain-modal';

interface BrainData {
  id: string;
  name: string;
  description?: string;
  status: string;
  file_count: number;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brains, setBrains] = useState<BrainData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrains = async () => {
      try {
        const response = await fetch('/api/brains');
        if (response.ok) {
          const data = await response.json();
          setBrains(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch brains:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrains();
  }, []);

  const handleBrainCreated = (newBrain: { id: string }) => {
    router.push(`/brain/${newBrain.id}`);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const statusConfig: Record<string, { border: string; iconBg: string; iconColor: string; badgeBg: string; badgeColor: string }> = {
    ready: {
      border: 'hover:border-emerald-500/30',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10',
      badgeColor: 'text-emerald-400',
    },
    building: {
      border: 'hover:border-indigo-500/30',
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-400',
      badgeBg: 'bg-amber-500/10',
      badgeColor: 'text-amber-400',
    },
    error: {
      border: 'hover:border-red-500/30',
      iconBg: 'bg-red-500/5',
      iconColor: 'text-red-500/40',
      badgeBg: 'bg-red-500/10',
      badgeColor: 'text-red-400',
    },
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans selection:bg-[#10b981] selection:text-black">
      <nav className="sticky top-0 z-50 w-full bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-[#10b981]/10 rounded-lg text-[#10b981] border border-[#10b981]/20">
                <Brain size={20} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">RAG ROOT</span>
            </div>

            <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-sm font-medium text-[#a1a1aa]">Your Brains</h1>
            </div>

            <div className="flex items-center gap-5">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all shadow-lg shadow-[#10b981]/20"
              >
                <Plus size={18} />
                <span>New Brain</span>
              </button>

              <div className="relative group cursor-pointer" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 ring-2 ring-white/5"></div>
                  <ChevronDown size={16} className="text-[#a1a1aa]" />
                </div>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#18181b] rounded-xl shadow-2xl border border-white/[0.08] py-1 z-50">
                    <Link href="/dashboard/account" className="w-full text-left px-4 py-2 text-sm text-[#a1a1aa] hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                      <User size={14} /> Account
                    </Link>
                    <Link href="/dashboard/api-keys" className="w-full text-left px-4 py-2 text-sm text-[#a1a1aa] hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                      <Key size={14} /> API Keys
                    </Link>
                    <Link href="/docs" className="w-full text-left px-4 py-2 text-sm text-[#a1a1aa] hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                      <Code2 size={14} /> Documentation
                    </Link>
                    <div className="h-px bg-white/5 my-1"></div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2">
                      <LogOut size={14} /> Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex justify-center mt-20">
            <Loader2 className="animate-spin text-[#10b981]" size={40} />
          </div>
        )}

        {!loading && brains.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5">
            <h3 className="text-lg font-bold text-white">No Brains yet</h3>
            <p className="text-gray-400 mb-4">Create your first knowledge base to get started.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-[#10b981] hover:underline">Create Brain</button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {brains.map((brain) => {
            const style = statusConfig[brain.status] || statusConfig.ready;
            return (
              <div key={brain.id} className={`group relative bg-[#18181b] rounded-xl p-5 border border-white/[0.08] ${style.border} shadow-lg transition-all`}>
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className={`shrink-0 w-14 h-14 rounded-lg flex items-center justify-center border border-white/5 ${style.iconBg} ${style.iconColor}`}>
                      <Brain size={28} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-white truncate group-hover:text-[#10b981] transition-colors">{brain.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/5 ${style.badgeBg} ${style.badgeColor}`}>
                          {brain.status.charAt(0).toUpperCase() + brain.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-[#a1a1aa]">{brain.description || 'No description provided.'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t border-white/5 sm:border-0">
                    <a href={`/brain/${brain.id}`} className="flex-1 sm:flex-none h-10 px-5 rounded-lg border border-white/10 text-[#fafafa] font-semibold text-sm hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-2 shadow-sm">
                      <span>Open Brain</span>
                      <ArrowRight size={16} className="text-[#a1a1aa]" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <CreateBrainModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleBrainCreated}
      />
    </div>
  );
}
