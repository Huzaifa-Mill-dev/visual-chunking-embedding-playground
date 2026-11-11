import React, { useState } from "react";
import { ChunkRecord } from "../types/index.js";
import { X, Copy, Check, Code, Info } from "lucide-react";

interface DataRecordModalProps {
  chunk: ChunkRecord | null;
  onClose: () => void;
}

export const DataRecordModal: React.FC<DataRecordModalProps> = ({
  chunk,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!chunk) return null;

  // Clean JSON representation
  const jsonString = JSON.stringify(chunk, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fieldExplanations = [
    {
      field: "id",
      role: "Unique primary key for this chunk in the vector index or database.",
    },
    {
      field: "docId",
      role: "Foreign key referencing the original source document.",
    },
    {
      field: "index",
      role: "Zero-based sequential order of this chunk within the parent document.",
    },
    {
      field: "text",
      role: "The raw text content sent to the embedding model and retrieved for LLM context.",
    },
    {
      field: "startChar / endChar",
      role: "Exact character boundary offsets in the source text for precise UI highlighting.",
    },
    {
      field: "tokenCount",
      role: "Estimated token count used to budget LLM context window limits.",
    },
    {
      field: "overlapWithPrev / overlapWithNext",
      role: "Number of overlapping characters shared with adjacent chunks to prevent context loss.",
    },
    {
      field: "embedding",
      role: "The dense numerical vector (array of floating-point numbers) representing semantic meaning.",
    },
    {
      field: "model",
      role: "Name of the embedding model used to produce the vector coordinates.",
    },
    {
      field: "dimensions",
      role: "Dimensionality of the vector space (e.g. 64, 768, 1536).",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                Chunk Record Inspector: Chunk #{chunk.index}
              </h3>
              <p className="text-xs text-slate-400 font-mono">ID: {chunk.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? "Copied JSON" : "Copy JSON"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar">
          {/* Metadata Field Guide */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Info className="w-4 h-4" />
              <span>Why these fields exist in a Vector Record:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {fieldExplanations.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/60 p-2 rounded border border-slate-800/80"
                >
                  <span className="font-mono text-cyan-300 font-bold block">
                    {item.field}
                  </span>
                  <span className="text-slate-400">{item.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Raw JSON Code block */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-300">
              Raw JSON Payload
            </span>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-72 leading-relaxed">
              {jsonString}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
