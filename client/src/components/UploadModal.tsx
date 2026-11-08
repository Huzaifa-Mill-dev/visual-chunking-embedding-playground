import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react';

interface UploadModalProps {
  onUpload: (data: { title: string; filename: string; content: string; fileType?: 'txt' | 'md' }) => Promise<void>;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onUpload, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [filename, setFilename] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      setError('Please upload a .txt or .md plain text or markdown file.');
      return;
    }

    setError(null);
    setFilename(file.name);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Document content cannot be empty.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const fileType = filename.endsWith('.md') ? 'md' : 'txt';
      await onUpload({
        title: title.trim() || filename || 'Untitled Document',
        filename: filename || 'document.txt',
        content,
        fileType,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Ingest New Document</h3>
              <p className="text-xs text-slate-400">Upload a TXT or Markdown document to experiment with chunking</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* File Dropzone Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/40 transition group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,.md"
              className="hidden"
            />
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-500 group-hover:text-cyan-400 transition" />
            <p className="font-semibold text-slate-300">
              {filename ? `Selected: ${filename}` : 'Click to select a file from your computer'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Supports plain text (.txt) and Markdown (.md)</p>
          </div>

          {/* Title Input */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 block">Document Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Operating Systems Architecture"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          {/* Content TextArea */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 block">Document Content (or paste directly):</label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or edit document text here..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>{content.length.toLocaleString()} characters</span>
              <span>{content.trim() ? content.trim().split(/\s+/).length.toLocaleString() : 0} words</span>
            </div>
          </div>

          {/* Submit footer */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !content.trim()}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              {isUploading ? 'Ingesting...' : 'Ingest & Chunk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
