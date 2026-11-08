import React from 'react';
import { DocumentRecord } from '../types/index.js';
import { ApiSettings } from '../utils/api.js';
import { 
  FileText, 
  Layers, 
  Sparkles, 
  BookOpen, 
  Settings, 
  Upload, 
  Download, 
  RefreshCw,
  Cpu
} from 'lucide-react';

interface NavbarProps {
  documents: DocumentRecord[];
  activeDoc: DocumentRecord | null;
  onSelectDoc: (id: string) => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onResetSamples: () => void;
  settings: ApiSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  documents,
  activeDoc,
  onSelectDoc,
  onOpenUpload,
  onOpenSettings,
  onOpenGuide,
  onResetSamples,
  settings,
}) => {
  const getProviderBadge = () => {
    switch (settings.provider) {
      case 'gemini':
        return { label: 'Gemini 768-D', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'openai':
        return { label: 'OpenAI 1536-D', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'ollama':
        return { label: 'Ollama Local', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      default:
        return { label: 'Local 64-D (Zero API Key)', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
    }
  };

  const badge = getProviderBadge();

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Visual Chunking & Embedding Playground
              </h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/80 text-cyan-300">
                Educational RAG
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive pipeline from raw text → chunks → vector embeddings → semantic retrieval
            </p>
          </div>
        </div>

        {/* Center: Document Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 shadow-inner">
            <FileText className="w-4 h-4 text-cyan-400" />
            <select
              value={activeDoc?.id || ''}
              onChange={(e) => onSelectDoc(e.target.value)}
              className="bg-transparent text-sm text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-slate-200">
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenUpload}
            title="Upload TXT or Markdown file"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload</span>
          </button>

          <button
            onClick={onResetSamples}
            title="Reload built-in educational sample documents"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Active Model Indicator */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded-md border ${badge.color} hover:brightness-110 transition`}
            title="Click to change embedding model or API keys"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{badge.label}</span>
          </button>

          {/* Educational Concept Guide */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 transition shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Concept Guide</span>
          </button>

          {/* Export JSON */}
          {activeDoc && (
            <a
              href={`/api/export/${activeDoc.id}`}
              download
              title="Export complete document, chunks, and vector embeddings as JSON"
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </a>
          )}

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Configure Embedding API keys & models"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
