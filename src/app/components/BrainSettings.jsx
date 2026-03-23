'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X, Settings, Cpu, FileText, Save,
  Loader2, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { MODEL_DEFAULTS } from '../../lib/models.config';

export default function BrainSettings({ brain, onClose }) {
  const [fetchingModels, setFetchingModels] = useState(true);
  const [models, setModels] = useState([]);
  const [saveStatus, setSaveStatus] = useState(null); // 'idle' | 'saving' | 'success' | 'error'

  const [formData, setFormData] = useState({
    chat_model: brain.chat_model || MODEL_DEFAULTS.DEFAULT_LLM,
    system_prompt: brain.system_prompt || ""
  });

  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(120, textareaRef.current.scrollHeight)}px`;
    }
  }, [formData.system_prompt]);

  // Fetch available models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch('/api/models');
        if (res.ok) {
          const data = await res.json();
          setModels(data.models);
        } else {
          throw new Error("Failed to load models");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingModels(false);
      }
    };
    fetchModels();
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/brain/${brain.id}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to save settings");

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#050a08]/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#0c1212]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981] border border-[#10b981]/20">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Brain Settings</h2>
              <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">{brain.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar">

          {/* LLM Selector */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
              <Cpu size={16} className="text-[#10b981]" />
              Language Model
            </label>
            <div className="relative">
              {fetchingModels ? (
                <div className="w-full h-11 bg-white/5 border border-white/10 rounded-xl flex items-center px-4 animate-pulse">
                  <Loader2 size={16} className="animate-spin text-gray-500 mr-2" />
                  <span className="text-sm text-gray-500">Fetching live models...</span>
                </div>
              ) : (
                <select
                  value={formData.chat_model}
                  onChange={(e) => setFormData({ ...formData, chat_model: e.target.value })}
                  className="w-full h-11 bg-[#121a1a] border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all appearance-none cursor-pointer"
                >
                  {models.length > 0 ? (
                    models.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))
                  ) : (
                    <option value={MODEL_DEFAULTS.DEFAULT_LLM}>{MODEL_DEFAULTS.DEFAULT_LLM} (Default)</option>
                  )}
                </select>
              )}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <RefreshCw size={14} className={fetchingModels ? 'animate-spin' : ''} />
              </div>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Select the LLM that will power this brain's reasoning and responses.
            </p>
          </div>

          {/* System Prompt */}
          <div className="space-y-3">
            <label className="flex items-center justify-between text-sm font-bold text-gray-300">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#10b981]" />
                System Prompt
              </div>
              <span className={`text-[10px] font-mono ${formData.system_prompt.length > 2000 ? 'text-red-400' : 'text-gray-500'}`}>
                {formData.system_prompt.length} / 2000
              </span>
            </label>
            <textarea
              ref={textareaRef}
              value={formData.system_prompt}
              onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value.slice(0, 2000) })}
              placeholder="You are a helpful assistant. Describe how this brain should behave..."
              className="w-full bg-[#121a1a] border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all resize-none min-h-[120px]"
            />
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Define the personality, tone, and constraints of your AI agent.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
           <div className="flex items-center gap-2">
              {saveStatus === 'success' && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold animate-in fade-in slide-in-from-left-2">
                  <CheckCircle2 size={14} /> Saved Successfully
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold animate-in fade-in slide-in-from-left-2">
                  <AlertCircle size={14} /> Failed to Save
                </div>
              )}
           </div>

           <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#10b981] hover:bg-[#059669] text-black text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#10b981]/20"
              >
                {saveStatus === 'saving' ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
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
