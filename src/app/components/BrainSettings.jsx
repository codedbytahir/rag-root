'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings, RefreshCw, AlertTriangle,
  Loader2,
  X, BarChart3, Clock
} from 'lucide-react';

export default function BrainSettings({ brain, onClose }) {
  const [activeTab, setActiveTab] = useState('usage');
  const [reindexing, setReindexing] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [brain.id]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/brain/${brain.id}/stats`);
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
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
             onClick={() => setActiveTab('usage')}
             className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'usage' ? 'border-[#10b981] text-[#10b981]' : 'border-transparent text-gray-500 hover:text-white'}`}
           >
             Usage & Logs
           </button>
           <button
             onClick={() => setActiveTab('maintenance')}
             className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'maintenance' ? 'border-[#10b981] text-[#10b981]' : 'border-transparent text-gray-500 hover:text-white'}`}
           >
             Maintenance
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="pt-4">
                 <h4 className="text-sm font-bold text-white mb-4">Maintenance</h4>
                 <p className="text-xs text-gray-400 mb-4">Re-process all documents in this brain. This is useful if you suspect any documents were not indexed correctly.</p>
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
        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-end">
           <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-colors"
              >
                Close
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
