import React, { useState } from 'react';
import { ChunkRecord } from '../types/index.js';
import { getChunkColor } from '../utils/colors.js';
import { 
  Layers, 
  Search, 
  Code, 
  Sparkles, 
  ArrowRight,
  Hash,
  Clock
} from 'lucide-react';

interface ChunkListProps {
  chunks: ChunkRecord[];
  selectedChunkId: string | null;
  onSelectChunk: (id: string) => void;
  onOpenRecord: (chunk: ChunkRecord) => void;
}

export const ChunkList: React.FC<ChunkListProps> = ({
  chunks,
  selectedChunkId,
  onSelectChunk,
  onOpenRecord,
}) => {
  const [filterText, setFilterText] = useState('');

  const filteredChunks = chunks.filter(c => 
    c.text.toLowerCase().includes(filterText.toLowerCase()) ||
    c.index.toString().includes(filterText)
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Generated Chunks</h3>
            <p className="text-xs text-slate-400">
              {chunks.length} total segments
            </p>
          </div>
        </div>

        {/* Filter input */}
        <div className="relative w-40">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter chunks..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>
      </div>

      {/* Chunks scroll list */}
      <div className="space-y-2.5 overflow-y-auto max-h-[560px] custom-scrollbar pr-1 flex-1">
        {filteredChunks.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            No chunks match your filter query.
          </div>
        ) : (
          filteredChunks.map((chunk) => {
            const color = getChunkColor(chunk.index);
            const isSelected = selectedChunkId === chunk.id;

            return (
              <div
                key={chunk.id}
                onClick={() => onSelectChunk(chunk.id)}
                className={`p-3 rounded-lg border transition cursor-pointer text-xs space-y-2 ${
                  isSelected
                    ? `${color.border} ${color.bgActive} ring-1 ring-cyan-400 shadow-md`
                    : `${color.border}/30 ${color.bg} hover:${color.border}/60 hover:${color.bgActive}`
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${color.badge}`}>
                      Chunk #{chunk.index}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      [{chunk.startChar} → {chunk.endChar}]
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {chunk.embedding ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {chunk.dimensions}-D
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Unembedded</span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRecord(chunk);
                      }}
                      title="Inspect full chunk JSON data record"
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Text excerpt */}
                <p className="text-slate-300 font-mono text-[11px] line-clamp-3 leading-relaxed">
                  {chunk.text}
                </p>

                {/* Footer metadata */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                  <span>{chunk.charCount} chars · ~{chunk.tokenCount} tokens</span>
                  {chunk.overlapWithPrev > 0 && (
                    <span className="text-amber-400">
                      ← {chunk.overlapWithPrev}c overlap
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
