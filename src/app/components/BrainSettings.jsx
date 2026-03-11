'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings, Save, RefreshCw, AlertTriangle,
  Key, Activity, Cpu, Database, Loader2,
  CheckCircle, X, Shield, BarChart3, Clock, Edit3
} from 'lucide-react';

const LLM_MODELS = [
  { id: 'llama3-8b-8192', name: 'Llama 3 8B (Fast)' },
  { id: 'llama3-70b-8192', name: 'Llama 3 70B (High Quality)' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B' }
];

const EMBEDDING_MODELS = [
  { id: 'text-embedding-005', name: 'Google Text Embedding 005 (Default)' },
  { id: 'text-embedding-004', name: 'Google Text Embedding 004' }
];

export default function BrainSettings({ brain, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState('');

  const initialChatModel = brain.chat_model || 'llama3-8b-8192';
  const initialEmbeddingModel = brain.embedding_model || 'text-embedding-005';

  const isChatModelCustom = !LLM_MODELS.find(m => m.id === initialChatModel);
  const isEmbeddingModelCustom = !EMBEDDING_MODELS.find(m => m.id === initialEmbeddingModel);

  const [formData, setFormData] = useState({
    chat_model: initialChatModel,
    embedding_model: initialEmbeddingModel,
    use_global_keys: brain.use_global_keys !== false,
    groq_api_key: '',
    google_api_key: ''
  });

  const [showCustomChat, setShowCustomChat] = useState(isChatModelCustom);
  const [showCustomEmbedding, setShowCustomEmbedding] = useState(isEmbeddingModelCustom);

  useEffect(() => {
    fetchStats();
  }, [brain.id]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/brain/${brain.id}/stats`);
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/brain/${brain.id}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Failed to save settings");

      setMessage("Settings saved successfully!");
      onUpdate();
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReindex = async () => {
    if (!confirm("Are you sure? This will delete all existing vectors and re-process all documents. This might take a few minutes.")) return;

    setReindexing(true);
    try {
      const res = await fetch(`/api/brain/${brain.id}/reindex`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert("Re-indexing complete!");
        fetchStats();
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      alert("Re-index failed: " + e.message);
    } finally {
      setReindexing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl bg-[#0c1212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981] border border-[#10b981]/20">
                <Settings size={20} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">Brain Settings</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{brain.name}</p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-black/20">
           <button
             onClick={() => setActiveTab('general')}
             className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'general' ? 'border-[#10b981] text-[#10b981]' : 'border-transparent text-gray-500 hover:text-white'}`}
           >
             Models & Logic
           </button>
           <button
             onClick={() => setActiveTab('keys')}
             className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'keys' ? 'border-[#10b981] text-[#10b981]' : 'border-transparent text-gray-500 hover:text-white'}`}
           >
             API Keys
           </button>
           <button
             onClick={() => setActiveTab('usage')}
             className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'usage' ? 'border-[#10b981] text-[#10b981]' : 'border-transparent text-gray-500 hover:text-white'}`}
           >
             Usage & Logs
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">

          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Chat Model */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center gap-2"><Cpu size={14} /> Chatting Model (LLM)</span>
                  {showCustomChat && (
                    <button
                      onClick={() => { setShowCustomChat(false); setFormData({...formData, chat_model: LLM_MODELS[0].id})}}
                      className="text-[10px] text-[#10b981] hover:underline"
                    >
                      Back to list
                    </button>
                  )}
                </label>

                {!showCustomChat ? (
                  <select
                    value={formData.chat_model}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setShowCustomChat(true);
                      } else {
                        setFormData({...formData, chat_model: e.target.value});
                      }
                    }}
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#10b981] outline-none transition-colors appearance-none"
                  >
                    {LLM_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    <option value="custom">-- Custom Model ID --</option>
                  </select>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.chat_model}
                      onChange={(e) => setFormData({...formData, chat_model: e.target.value})}
                      placeholder="Enter custom model ID (e.g. gpt-4o)"
                      className="w-full bg-[#09090b] border border-[#10b981]/50 rounded-lg px-4 py-3 text-sm text-white focus:border-[#10b981] outline-none transition-colors"
                      autoFocus
                    />
                    <Edit3 size={14} className="absolute right-4 top-3.5 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Embedding Model */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center gap-2"><Database size={14} /> Embedding Model</span>
                  {showCustomEmbedding && (
                    <button
                      onClick={() => { setShowCustomEmbedding(false); setFormData({...formData, embedding_model: EMBEDDING_MODELS[0].id})}}
                      className="text-[10px] text-[#10b981] hover:underline"
                    >
                      Back to list
                    </button>
                  )}
                </label>

                {!showCustomEmbedding ? (
                  <select
                    value={formData.embedding_model}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setShowCustomEmbedding(true);
                      } else {
                        setFormData({...formData, embedding_model: e.target.value});
                      }
                    }}
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#10b981] outline-none transition-colors appearance-none"
                  >
                    {EMBEDDING_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    <option value="custom">-- Custom Model ID --</option>
                  </select>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.embedding_model}
                      onChange={(e) => setFormData({...formData, embedding_model: e.target.value})}
                      placeholder="Enter custom model ID (e.g. text-embedding-3-small)"
                      className="w-full bg-[#09090b] border border-[#10b981]/50 rounded-lg px-4 py-3 text-sm text-white focus:border-[#10b981] outline-none transition-colors"
                      autoFocus
                    />
                    <Edit3 size={14} className="absolute right-4 top-3.5 text-gray-500" />
                  </div>
                )}

                {formData.embedding_model !== brain.embedding_model && brain.embedding_model && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <p>Changing the embedding model requires re-indexing all documents. Old vectors will be incompatible.</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/5">
                 <h4 className="text-sm font-bold text-white mb-4">Maintenance</h4>
                 <button
                   onClick={handleReindex}
                   disabled={reindexing}
                   className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-xs font-bold hover:bg-white/5 transition-colors disabled:opacity-50"
                 >
                   {reindexing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                   <span>{reindexing ? 'Re-indexing (Do not close)...' : 'Re-index Documents'}</span>
                 </button>
              </div>
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="space-y-6">
               <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-3">
                     <Shield size={18} className="text-[#10b981]" />
                     <div>
                        <p className="text-sm font-bold">Use Global API Keys</p>
                        <p className="text-[10px] text-gray-500">Inherit keys from your account settings.</p>
                     </div>
                  </div>
                  <button
                    onClick={() => setFormData({...formData, use_global_keys: !formData.use_global_keys})}
                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.use_global_keys ? 'bg-[#10b981]' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.use_global_keys ? 'left-7' : 'left-1'}`}></div>
                  </button>
               </div>

               {!formData.use_global_keys && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Brain-Specific Groq Key</label>
                      <input
                        type="password"
                        placeholder="gsk_..."
                        value={formData.groq_api_key}
                        onChange={(e) => setFormData({...formData, groq_api_key: e.target.value})}
                        className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#10b981] outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Brain-Specific Google Key</label>
                      <input
                        type="password"
                        placeholder="AIza..."
                        value={formData.google_api_key}
                        onChange={(e) => setFormData({...formData, google_api_key: e.target.value})}
                        className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#10b981] outline-none transition-colors"
                      />
                    </div>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Requests</p>
                     <p className="text-2xl font-bold">{stats?.totalRequests || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Tokens Consumed</p>
                     <p className="text-2xl font-bold">{(stats?.totalTokens || 0).toLocaleString()}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" /> Recent Activity
                  </h4>
                  <div className="space-y-2">
                    {stats?.recentLogs?.map(log => (
                      <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/[0.03] text-xs">
                         <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-[#10b981]' : 'bg-red-500'}`}></span>
                            <span className="text-gray-300 font-mono uppercase">{log.type}</span>
                            <span className="text-gray-600">|</span>
                            <span className="text-gray-500">{log.model_used}</span>
                         </div>
                         <span className="text-gray-600">{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                    ))}
                    {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
                       <p className="text-center py-8 text-gray-600 text-xs italic">No activity recorded yet.</p>
                    )}
                  </div>
               </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
           <div className="flex items-center gap-2">
              {message && <span className="text-[#10b981] text-xs font-bold flex items-center gap-1"><CheckCircle size={14} /> {message}</span>}
           </div>
           <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-8 py-2 rounded-lg bg-[#10b981] hover:bg-[#059669] text-black text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>Save Changes</span>
              </button>
           </div>
        </div>

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}</style>
    </div>
  );
}
