'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, UploadCloud, FileText, Trash2, 
  Loader2, MessageSquare, Plus, AlertCircle, Settings
} from 'lucide-react';
import Link from 'next/link';

// Internal Utils & Components
import { validatePDF } from '@/app/utils/pdfValidator';
import { createClient } from '@/app/utils/supabase/client';
import ChatInterface from '@/app/components/ChatInterface';
import BrainSettings from '@/app/components/BrainSettings';

export default function BrainWorkspace() {
  const params = useParams(); 
  const router = useRouter();
  
  const [brain, setBrain] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(""); 

  // 1. FETCH DATA (Via API)
  const fetchBrainData = async () => {
    try {
      const res = await fetch(`/api/brain/${params.id}`);
      if (!res.ok) throw new Error("Failed to load brain");

      const data = await res.json();
      setBrain(data.brain);
      setFiles(data.files);
    } catch (error) {
      console.error(error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrainData();
  }, [params.id, router]);

  // 2. HANDLE FILE UPLOAD
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      alert("File too large. Max 5MB allowed.");
      e.target.value = '';
      return;
    }

    setUploading(true);
    setUploadStatus("Scanning PDF Structure...");

    try {
      const validation = await validatePDF(file);
      if (!validation.valid) throw new Error(validation.error);

      setUploadStatus("Uploading to Secure Vault...");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const uniqueName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const filePath = `${user.id}/${params.id}/${uniqueName}`;

      const { error: storageError } = await supabase.storage
        .from('docs')
        .upload(filePath, file);

      if (storageError) throw storageError;

      setUploadStatus("Saving Metadata...");
      
      const apiRes = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          file_path: filePath,
          size: file.size,
          type: file.type,
          brain_id: params.id
        })
      });

      if (!apiRes.ok) throw new Error("Failed to save metadata");
      const newDoc = await apiRes.json();
      
      setFiles(prev => [newDoc, ...prev]);

      // LLAMAINDEX INGESTION
      setUploadStatus("AI is Vectorizing (Embeddings)...");

      const ingestRes = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: newDoc.id,
          file_name: file.name,
          file_path: filePath,
          brain_id: params.id
        })
      });

      if (!ingestRes.ok) {
        const errorData = await ingestRes.json();
        throw new Error(`AI Indexing failed: ${errorData.error}`);
      }

      setUploadStatus("Indexing Complete!");

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadStatus("");
      }, 1000);
      e.target.value = '';
    }
  };

  // 3. HANDLE DELETE
  const handleDelete = async (docId, filePath) => {
    if(!confirm("Delete this document?")) return;
    
    setFiles(files.filter(d => d.id !== docId));

    try {
      await fetch('/api/documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: docId, path: filePath })
      });
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete. Please refresh.");
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#050a08] flex items-center justify-center text-white">
      <Loader2 className="animate-spin text-[#10b981]" size={32} />
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#050a08] text-white font-sans overflow-hidden selection:bg-[#10b981] selection:text-black">
      
      {/* === SIDEBAR === */}
      <aside className="w-72 bg-[#0c1212] border-r border-white/5 flex flex-col z-20 shrink-0">
        <div className="p-4 border-b border-white/5">
          <div className="flex justify-between items-start mb-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs uppercase font-bold tracking-wider">
               <ArrowLeft size={12} /> Back
            </Link>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-[#10b981] hover:bg-[#10b981]/10 transition-all border border-transparent hover:border-[#10b981]/20"
            >
              <Settings size={16} />
            </button>
          </div>
          <h1 className="text-xl font-bold text-white truncate">{brain?.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 uppercase">
                {brain?.status || 'Ready'}
            </span>
            <span className="text-xs text-gray-500">{files.length} Documents</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
           {files.length === 0 && (
             <div className="text-center py-10 opacity-50">
               <p className="text-xs text-gray-500">No documents yet.</p>
             </div>
           )}

           {files.map(doc => (
             <div key={doc.id} className="group flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                <div className="flex items-center gap-3 overflow-hidden">
                   <FileText size={18} className="text-gray-400 shrink-0" />
                   <span className="text-sm text-gray-200 truncate">{doc.file_name}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(doc.id, doc.storage_path); }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                >
                   <Trash2 size={14} />
                </button>
             </div>
           ))}
        </div>

        <div className="p-3 border-t border-white/5">
          <label className={`flex items-center justify-center gap-2 w-full p-3 rounded-lg border border-dashed border-white/20 hover:border-[#10b981] hover:bg-[#10b981]/5 cursor-pointer transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploading ? <Loader2 size={16} className="animate-spin text-[#10b981]" /> : <Plus size={16} className="text-[#10b981]" />}
              <span className="text-sm text-gray-400">{uploading ? 'Processing...' : 'Add Document'}</span>
              <input type="file" className="hidden" accept="application/pdf" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>
      </aside>

      {/* === MAIN AREA: TRANSITIONS BETWEEN UPLOAD & CHAT === */}
      <main className="flex-1 flex flex-col bg-[#0f1515] relative overflow-hidden">
         
         {/* Background Grid Layer */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

         {files.length > 0 ? (
            /* CASE 1: BRAIN HAS DATA -> SHOW CHAT */
            <ChatInterface brainId={params.id} />
         ) : (
            /* CASE 2: BRAIN IS EMPTY -> SHOW UPLOAD UI */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="w-20 h-20 bg-[#10b981]/10 rounded-2xl flex items-center justify-center text-[#10b981] mx-auto border border-[#10b981]/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] mb-6">
                    <MessageSquare size={40} />
                </div>
                
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Build your Knowledge Base</h2>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                        Upload your first PDF (Text-only, Max 5MB). I will vectorize the content so you can ask questions instantly.
                    </p>
                </div>
                
                {!uploading ? (
                    <label className="inline-flex items-center gap-2 px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-black font-bold rounded-xl cursor-pointer transition-all hover:scale-105 shadow-xl shadow-[#10b981]/20">
                        <UploadCloud size={24} />
                        <span>Upload First PDF</span>
                        <input type="file" className="hidden" accept="application/pdf" onChange={handleFileUpload} />
                    </label>
                ) : (
                    <div className="bg-[#18181b] border border-white/10 p-6 rounded-2xl flex items-center gap-6 text-left max-w-sm w-full animate-pulse shadow-2xl">
                        <div className="relative">
                            <Loader2 className="animate-spin text-[#10b981]" size={32} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-base">{uploadStatus}</p>
                            <p className="text-xs text-gray-500 font-mono tracking-tighter">Computing Tensors & Vectors...</p>
                        </div>
                    </div>
                )}
            </div>
         )}
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && brain && (
        <BrainSettings
          brain={brain}
          onClose={() => setIsSettingsOpen(false)}
          onUpdate={fetchBrainData}
        />
      )}

      {/* Global Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>

    </div>
  );
}