import React, { useState } from "react";
import { ChunkRecord, DocumentRecord } from "../types/index.js";
import { getChunkColor } from "../utils/colors.js";
import {
  FileText,
  Eye,
  Info,
  Sparkles,
  Hash,
  AlignLeft,
  Layers,
} from "lucide-react";

interface DocumentViewerProps {
  document: DocumentRecord | null;
  chunks: ChunkRecord[];
  selectedChunkId: string | null;
  onSelectChunk: (id: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  chunks,
  selectedChunkId,
  onSelectChunk,
}) => {
  const [viewMode, setViewMode] = useState<"boundary" | "raw">("boundary");

  if (!document) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-900/40 text-slate-500">
        <FileText className="w-10 h-10 mb-2 stroke-[1.5]" />
        <p className="text-sm">No document selected</p>
      </div>
    );
  }

  // Build segmented boundaries for color coding
  // For each chunk, we display its slice of text with its corresponding color
  const renderBoundaryMap = () => {
    if (chunks.length === 0) {
      return (
        <div className="p-4 text-sm text-slate-400 font-mono whitespace-pre-wrap">
          {document.content}
        </div>
      );
    }

    return (
      <div className="space-y-3 font-mono text-xs leading-relaxed">
        {chunks.map((chunk, idx) => {
          const color = getChunkColor(chunk.index);
          const isSelected = selectedChunkId === chunk.id;
          const hasOverlapPrev = chunk.overlapWithPrev > 0;
          const hasOverlapNext = chunk.overlapWithNext > 0;

          return (
            <div
              key={chunk.id}
              onClick={() => onSelectChunk(chunk.id)}
              className={`group relative rounded-lg p-3 transition-all cursor-pointer border ${
                isSelected
                  ? `${color.border} ${color.bgActive} ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-950/50`
                  : `${color.border}/30 ${color.bg} hover:${color.border}/70 hover:${color.bgActive}`
              }`}
            >
              {/* Chunk Header Bar */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/40">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border ${color.badge}`}
                  >
                    Chunk #{chunk.index}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Chars [{chunk.startChar} → {chunk.endChar}]
                  </span>
                  <span className="text-[11px] text-slate-500">
                    ({chunk.charCount} chars · ~{chunk.tokenCount} tokens)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px]">
                  {hasOverlapPrev && (
                    <span
                      title={`This chunk shares ${chunk.overlapWithPrev} characters with previous chunk #${chunk.index - 1}`}
                      className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1"
                    >
                      <Layers className="w-3 h-3" />
                      Prev Overlap: {chunk.overlapWithPrev}c
                    </span>
                  )}
                  {chunk.embedding ? (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {chunk.dimensions}-D
                    </span>
                  ) : (
                    <span className="text-slate-500">Unembedded</span>
                  )}
                </div>
              </div>

              {/* Chunk Text Body with Overlap Highlighting */}
              <div className="text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
                {hasOverlapPrev && chunk.overlapWithPrev > 0 ? (
                  <>
                    <mark
                      title="Overlapping text copied from previous chunk to preserve boundary context"
                      className="bg-amber-400/25 text-amber-200 border-b border-amber-400/50 px-0.5 rounded-sm"
                    >
                      {chunk.text.slice(0, chunk.overlapWithPrev)}
                    </mark>
                    <span>{chunk.text.slice(chunk.overlapWithPrev)}</span>
                  </>
                ) : (
                  <span>{chunk.text}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Header bar with metadata & toggle */}
      <div className="bg-slate-950/60 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-200">
                {document.title}
              </h2>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                .{document.fileType}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
              <span>{document.charCount.toLocaleString()} chars</span>
              <span>·</span>
              <span>{document.wordCount.toLocaleString()} words</span>
              <span>·</span>
              <span>{document.lineCount.toLocaleString()} lines</span>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("boundary")}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md transition ${
              viewMode === "boundary"
                ? "bg-cyan-600/30 text-cyan-300 font-medium border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Chunk Boundary Map</span>
          </button>
          <button
            onClick={() => setViewMode("raw")}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md transition ${
              viewMode === "raw"
                ? "bg-cyan-600/30 text-cyan-300 font-medium border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Raw Text</span>
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 overflow-y-auto max-h-[580px] custom-scrollbar flex-1 bg-slate-950/20">
        {viewMode === "boundary" ? (
          renderBoundaryMap()
        ) : (
          <div className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed p-2">
            {document.content}
          </div>
        )}
      </div>

      {/* Educational Legend Footer */}
      {viewMode === "boundary" && chunks.length > 0 && (
        <div className="bg-slate-950/80 border-t border-slate-800 px-4 py-2 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500/60 border border-indigo-400"></span>
              Distinct Chunk Boundaries
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-400/40 border border-amber-400"></span>
              Overlapping Margins (Preserves Boundary Context)
            </span>
          </div>
          <span className="text-slate-500">
            Click any chunk to select & inspect in vector space
          </span>
        </div>
      )}
    </div>
  );
};
