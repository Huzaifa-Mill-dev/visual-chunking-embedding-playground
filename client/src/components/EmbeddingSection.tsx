import React, { useState } from 'react';
import { ChunkRecord } from '../types/index.js';
import { ApiSettings } from '../utils/api.js';
import { getChunkColor } from '../utils/colors.js';
import { 
  Sparkles, 
  Cpu, 
  Database, 
  CheckCircle2, 
  Code, 
  Maximize2, 
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';

interface EmbeddingSectionProps {
  chunks: ChunkRecord[];
  selectedChunk: ChunkRecord | null;
  onSelectChunk: (id: string) => void;
  onGenerateAll: () => void;
  onOpenRecord: (chunk: ChunkRecord) => void;
  isGenerating: boolean;
  settings: ApiSettings;
  cacheStats: { newlyGenerated: number; cached: number } | null;
}

export const EmbeddingSection: React.FC<EmbeddingSectionProps> = ({
  chunks,
  selectedChunk,
  onSelectChunk,
  onGenerateAll,
  onOpenRecord,
  isGenerating,
  settings,
  cacheStats,
}) => {
  const [showFullVector, setShowFullVector] = useState(false);

  const totalChunks = chunks.length;
  const embeddedCount = chunks.filter(c => c.embedding && c.embedding.length > 0).length;
  const allEmbedded = totalChunks > 0 && embeddedCount === totalChunks;

  // Active vector metrics
  const activeEmbedding = selectedChunk?.embedding;
  const vectorDims = activeEmbedding ? activeEmbedding.length : 0;

  // Calculate L2 norm, min, max, mean
  let l2Norm = 0;
  let minVal = 0;
  let maxVal = 0;
  let meanVal = 0;

  if (activeEmbedding && activeEmbedding.length > 0) {
    let sumSquares = 0;
    let sum = 0;
    minVal = activeEmbedding[0];
    maxVal = activeEmbedding[0];

    for (let i = 0; i < activeEmbedding.length; i++) {
      const v = activeEmbedding[i];
      sumSquares += v * v;
      sum += v;
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
    }
    l2Norm = Math.sqrt(sumSquares);
    meanVal = sum / activeEmbedding.length;
  }

  const selectedColor = selectedChunk ? getChunkColor(selectedChunk.index) : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-200">Vector Embeddings</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {embeddedCount} / {totalChunks} Embedded
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Transforming discrete text chunks into continuous high-dimensional geometric vectors
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          {cacheStats && (
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
              Cache: <span className="text-emerald-400">{cacheStats.cached} hit</span> · <span className="text-cyan-400">{cacheStats.newlyGenerated} new</span>
            </span>
          )}

          <button
            onClick={onGenerateAll}
            disabled={isGenerating || totalChunks === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition ${
              allEmbedded
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20'
            } disabled:opacity-50`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>
              {isGenerating 
                ? 'Generating Embeddings...' 
                : allEmbedded 
                  ? 'Re-Generate Embeddings' 
                  : 'Generate All Embeddings'}
            </span>
          </button>
        </div>
      </div>

      {/* Selected Chunk Vector Inspector */}
      {selectedChunk ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${selectedColor?.badge}`}>
                Selected: Chunk #{selectedChunk.index}
              </span>
              <span className="text-xs text-slate-400">
                ({selectedChunk.charCount} characters)
              </span>
            </div>

            <button
              onClick={() => onOpenRecord(selectedChunk)}
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Inspect Full JSON Record</span>
            </button>
          </div>

          {activeEmbedding ? (
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-3">
              {/* Stats badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">Dimensions</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">{vectorDims}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">L2 Norm (||v||)</span>
                  <span className="text-sm font-mono font-bold text-cyan-400">{l2Norm.toFixed(4)}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">Value Range</span>
                  <span className="text-sm font-mono font-bold text-amber-400">
                    [{minVal.toFixed(3)}, {maxVal.toFixed(3)}]
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">Mean Float</span>
                  <span className="text-sm font-mono font-bold text-slate-300">{meanVal.toFixed(4)}</span>
                </div>
              </div>

              {/* Vector Dimensions Sparkline / Bar Graph Visualization */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    Feature Dimension Heatmap (First 48 dimensions)
                  </span>
                  <span className="text-[10px] text-slate-500">Positive / Negative Activation</span>
                </div>

                <div className="h-10 bg-slate-900/90 rounded border border-slate-800 p-1 flex items-center gap-0.5 overflow-hidden">
                  {activeEmbedding.slice(0, 48).map((val, idx) => {
                    const heightPercent = Math.min(100, Math.max(10, Math.abs(val) * 350));
                    const isPositive = val >= 0;

                    return (
                      <div
                        key={idx}
                        title={`Dim [${idx}]: ${val.toFixed(5)}`}
                        className="flex-1 flex flex-col justify-center items-center h-full group relative cursor-pointer"
                      >
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-sm transition-all group-hover:brightness-125 ${
                            isPositive ? 'bg-cyan-400/80' : 'bg-rose-400/80'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vector Array Preview */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Vector Numerical Array [float32...]</span>
                  <button
                    onClick={() => setShowFullVector(!showFullVector)}
                    className="text-cyan-400 hover:text-cyan-300 text-[10px] transition"
                  >
                    {showFullVector ? 'Show Truncated (12 floats)' : `View All ${vectorDims} Floats`}
                  </button>
                </div>

                <div className="bg-slate-900/90 rounded border border-slate-800 p-2 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-24">
                  {showFullVector ? (
                    <span>[ {activeEmbedding.map(v => v.toFixed(6)).join(', ')} ]</span>
                  ) : (
                    <span>
                      [ {activeEmbedding.slice(0, 12).map(v => v.toFixed(5)).join(', ')}, ... +{vectorDims - 12} more floats ]
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-lg p-6 text-center text-slate-400 text-xs">
              <Cpu className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>This chunk has not been embedded yet.</p>
              <button
                onClick={onGenerateAll}
                className="mt-2 text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Click "Generate All Embeddings" above to embed all chunks.
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-950/30 border border-slate-800 rounded-lg p-4 text-center text-slate-500 text-xs">
          Select any chunk from the document view or chunk list to inspect its vector representation.
        </div>
      )}

      {/* Educational Box */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-400 leading-relaxed">
        <strong className="text-slate-300 block mb-1">What does an embedding model actually do?</strong>
        An embedding model receives a string of text and maps it into a point on a high-dimensional unit hypersphere.
        Rather than representing single words, the vector coordinates represent a dense blend of latent semantic concepts,
        syntax patterns, and contextual relationships. Normalizing vectors ensures their Euclidean length is 1.0, turning cosine similarity into a fast dot product calculation!
      </div>
    </div>
  );
};
