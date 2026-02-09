'use client';
import { useState } from 'react';
import { Copy, Check, AlertTriangle, X } from 'lucide-react';

export default function SecretKeyModal({ apiKey, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Save your API Key</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Please copy this key now. For your security, <span className="text-white font-bold underline">we cannot show it to you again.</span>
          </p>

          <div className="w-full relative group">
            <input 
              readOnly 
              value={apiKey}
              className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-3 pr-12 text-emerald-400 font-mono text-sm focus:outline-none"
            />
            <button 
              onClick={copyToClipboard}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-md transition-colors"
            >
              {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-gray-400" />}
            </button>
          </div>

          <button 
            onClick={onClose}
            className="mt-8 w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
          >
            I've saved it
          </button>
        </div>
      </div>
    </div>
  );
}