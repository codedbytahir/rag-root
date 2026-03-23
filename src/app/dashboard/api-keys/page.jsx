'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Key, Plus, Trash2, ShieldCheck, ArrowLeft, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import SecretKeyModal from '../../components/SecretKeyModal';

export default function ApiKeysPage() {
  const [apiKeyData, setApiKeyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null);

 

  const fetchKey = useCallback(async () => {
    const res = await fetch('/api/keys');
    const data = await res.json();
    setApiKeyData(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchKey();
  }, [fetchKey]);

  const handleGenerateKey = async () => {
    setProcessing(true);
    const res = await fetch('/api/keys', { method: 'POST' });
    const data = await res.json();
    setGeneratedKey(data.apiKey);
    fetchKey();
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-8 selection:bg-[#10b981] selection:text-black">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <Link href="/dashboard" className="text-gray-500 hover:text-white flex items-center gap-2 text-sm mb-2 transition-colors">
              <ArrowLeft size={16} /> Dashboard
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">API Access</h1>
            <p className="text-gray-400 text-sm mt-1">Use your unique key to query your Brains from external applications.</p>
            <Link href="/docs" className="inline-flex items-center gap-1.5 text-[#10b981] hover:underline text-xs font-bold mt-3">
               Read API Documentation &rarr;
            </Link>
          </div>
          <div className="p-3 bg-[#10b981]/10 rounded-xl border border-[#10b981]/20">
            <ShieldCheck className="text-[#10b981]" size={32} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#10b981]" /></div>
        ) : !apiKeyData ? (
          /* STATE 1: NO KEY CREATED */
          <div className="bg-[#18181b] border border-white/[0.08] rounded-3xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center text-[#10b981] mb-6">
                <Key size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Generate your API Key</h2>
            <p className="text-gray-400 max-w-sm mb-8">
                You haven&apos;t created an API key yet. Generate one to start using RAG ROOT programmatically.
            </p>
            <button 
              onClick={handleGenerateKey}
              disabled={processing}
              className="bg-[#10b981] hover:bg-[#059669] text-black font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-[#10b981]/20 flex items-center gap-2"
            >
              {processing ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              Generate Primary Key
            </button>
          </div>
        ) : (
          /* STATE 2: KEY EXISTS */
          <div className="space-y-6">
            <div className="bg-[#18181b] border border-white/[0.08] rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#10b981]"></div>
                
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#10b981]/10 rounded-lg flex items-center justify-center text-[#10b981]">
                            <Key size={20} />
                        </div>
                        <h3 className="font-bold text-lg">Active API Key</h3>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Live</span>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Secret Key Hint</label>
                        <div className="bg-[#09090b] border border-white/5 px-4 py-3 rounded-lg font-mono text-sm text-gray-300">
                            {apiKeyData.key_hint}
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-gray-500 pt-2">
                        <div>Created: <span className="text-gray-300">{new Date(apiKeyData.created_at).toLocaleDateString()}</span></div>
                        <div>Last Used: <span className="text-gray-300">{apiKeyData.last_used_at ? new Date(apiKeyData.last_used_at).toLocaleDateString() : 'Never'}</span></div>
                    </div>
                </div>
            </div>

            {/* Rotation Warning Area */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-6 flex items-start gap-4">
                <AlertCircle className="text-red-500 shrink-0 mt-1" size={20} />
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-red-400">Regenerate Key</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
                        Regenerating your key will <span className="text-red-400 font-bold uppercase">instantly revoke</span> the current one. Any applications using the old key will stop working immediately.
                    </p>
                    <button 
                        onClick={handleGenerateKey}
                        disabled={processing}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                    >
                        {processing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        Rotate Secret Key
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* Modal for new keys */}
        {generatedKey && (
          <SecretKeyModal 
            apiKey={generatedKey} 
            onClose={() => setGeneratedKey(null)} 
          />
        )}

      </div>
    </div>
  );
}