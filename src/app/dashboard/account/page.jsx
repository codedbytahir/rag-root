'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Mail, Shield, ArrowLeft, Loader2, Calendar, UserCircle, Key, Save, CheckCircle } from 'lucide-react';
import { createClient } from '../../utils/supabase/client';

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ global_groq_api_key: '', global_google_api_key: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function getData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (prof) {
            setProfile({
                global_groq_api_key: prof.global_groq_api_key || '',
                global_google_api_key: prof.global_google_api_key || ''
            });
        }
      }
      setLoading(false);
    }
    getData();
  }, []);

  const handleSaveKeys = async () => {
    setSaving(true);
    setMessage('');

    try {
        const res = await fetch('/api/profile/keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to save keys");
        }

        setMessage("Global API Keys saved successfully!");
        setTimeout(() => setMessage(''), 3000);
    } catch (error) {
        alert("Error saving keys: " + error.message);
    } finally {
        setSaving(false);
    }
  };

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

          {/* Global API Keys */}
          <div className="bg-[#18181b] border border-white/[0.08] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981] border border-[#10b981]/20">
                  <Key size={20} />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-white">Global API Keys</h3>
                  <p className="text-xs text-gray-500">Default keys used for all brains unless specified otherwise.</p>
               </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Groq API Key</label>
                <input
                  type="password"
                  value={profile.global_groq_api_key}
                  onChange={(e) => setProfile({...profile, global_groq_api_key: e.target.value})}
                  className="w-full bg-[#09090b] border border-white/5 px-4 py-3 rounded-lg text-sm text-gray-300 focus:border-[#10b981] outline-none transition-colors"
                  placeholder="gsk_..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Google API Key (Gemini)</label>
                <input
                  type="password"
                  value={profile.global_google_api_key}
                  onChange={(e) => setProfile({...profile, global_google_api_key: e.target.value})}
                  className="w-full bg-[#09090b] border border-white/5 px-4 py-3 rounded-lg text-sm text-gray-300 focus:border-[#10b981] outline-none transition-colors"
                  placeholder="AIza..."
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[10px] text-gray-500 italic">* Keys are encrypted before storage.</p>
                <button
                  onClick={handleSaveKeys}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-black font-bold py-2 px-6 rounded-lg transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>{saving ? 'Saving...' : 'Save Keys'}</span>
                </button>
              </div>

              {message && (
                <div className="flex items-center gap-2 text-[#10b981] text-sm animate-in fade-in slide-in-from-bottom-2">
                   <CheckCircle size={16} />
                   <span>{message}</span>
                </div>
              )}
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
