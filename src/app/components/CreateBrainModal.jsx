'use client';

import { useState } from 'react';
import { X, Brain, Loader2 } from 'lucide-react';
import { createClient } from '../utils/supabase/client';

export default function CreateBrainModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // If the modal is closed, don't render anything
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return; // Don't submit empty names

    setLoading(true);
    const supabase = createClient();

    // 1. Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("You need to be logged in.");
      setLoading(false);
      return;
    }

    // 2. Send data to Supabase 'brains' table
    const { data, error } = await supabase
      .from('brains')
      .insert([
        { 
          name: name, 
          description: description,
          user_id: user.id,
          status: 'ready' 
        }
      ])
      .select()
      .single();

    setLoading(false);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      // 3. Success: Reset form and tell parent component
      setName('');
      setDescription('');
      onCreated(data); 
      onClose();
    }
  };

  return (
    // Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl p-6">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-[#10b981]/10 rounded-xl flex items-center justify-center text-[#10b981] mb-4 border border-[#10b981]/20">
            <Brain size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Create New Brain</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Name</label>
            <input 
              className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#10b981] outline-none transition-colors"
              placeholder="e.g. Finance Q4"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="space-y-1">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
             <textarea 
               className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#10b981] outline-none transition-colors"
               placeholder="Optional description..."
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               rows={3}
             />
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || !name} 
              className="flex-1 px-4 py-2 rounded-lg bg-[#10b981] text-black font-bold hover:bg-[#059669] flex justify-center items-center transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}