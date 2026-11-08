import React, { useState } from 'react';
import { ChunkRecord, CosineExplanation, SimilarityResult } from '../types/index.js';
import { ApiSettings } from '../utils/api.js';
import { getChunkColor } from '../utils/colors.js';
import { 
  Search, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Calculator, 
  Compass, 
  ArrowRight,
  GitCompare,
  TrendingUp,
  Sliders
} from 'lucide-react';

interface SimilaritySearchPanelProps {
  chunks: ChunkRecord[];
  docId: string;
  selectedChunkId: string | null;
  onSelectChunk: (id: string) => void;
  onSearch: (query: string) => void;
  searchResults: SimilarityResult[];
  topMatchExplanation: CosineExplanation | null;
  isSearching: boolean;
  onCompareTwoChunks: (chunkIdA: string, chunkIdB: string) => Promise<any>;
}

export const SimilaritySearchPanel: React.FC<SimilaritySearchPanelProps> = ({
  chunks,
  docId,
  selectedChunkId,
  onSelectChunk,
  onSearch,
  searchResults,
  topMatchExplanation,
  isSearching,
  onCompareTwoChunks,
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [showMathDetails, setShowMathDetails] = useState(false);
  const [showComparator, setShowComparator] = useState(false);

  // Chunk comparator states
  const [chunkAId, setChunkAId] = useState<string>('');
  const [chunkBId, setChunkBId] = useState<string>('');
  const [comparatorResult, setComparatorResult] = useState<any | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Preset example queries
  const exampleQueries = [
    'How do plants absorb sunlight to make food?',
    'What happens when nodes lose network connection?',
    'Why do we need to split documents before embedding?',
    'How do AI agents use external tools to solve tasks?',
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      onSearch(queryInput.trim());
    }
  };

  const handleSelectExample = (ex: string) => {
    setQueryInput(ex);
    onSearch(ex);
  };

  const handleRunComparison = async () => {
    if (!chunkAId || !chunkBId) return;
    setIsComparing(true);
    try {
      const result = await onCompareTwoChunks(chunkAId, chunkBId);
      setComparatorResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsComparing(false);
    }
  };

  const embeddedChunks = chunks.filter(c => c.embedding && c.embedding.length > 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Semantic Search & Vector Similarity</h3>
            <p className="text-xs text-slate-400">
              Query vectors in high-dimensional space and measure cosine alignment
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowComparator(!showComparator)}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
          <span>{showComparator ? 'Hide Comparator' : 'Compare 2 Chunks'}</span>
        </button>
      </div>

      {/* Query Search Form */}
      <form onSubmit={handleSearchSubmit} className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ask a question or enter a search query..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition font-sans"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !queryInput.trim() || embeddedChunks.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
            <span>Search</span>
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            Try Query:
          </span>
          {exampleQueries.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectExample(ex)}
              className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
            >
              {ex}
            </button>
          ))}
        </div>
      </form>

      {/* Chunk vs Chunk Comparator Modal / Card */}
      {showComparator && (
        <div className="bg-slate-950/80 border border-indigo-500/40 rounded-xl p-3.5 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <GitCompare className="w-4 h-4 text-indigo-400" />
              Direct Chunk-to-Chunk Similarity Comparator
            </span>
            <span className="text-[10px] text-slate-400">
              Measure angular alignment between any two chunks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Select Chunk A:</label>
              <select
                value={chunkAId}
                onChange={(e) => setChunkAId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200"
              >
                <option value="">-- Choose Chunk A --</option>
                {embeddedChunks.map(c => (
                  <option key={c.id} value={c.id}>
                    Chunk #{c.index}: {c.text.slice(0, 40)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Select Chunk B:</label>
              <select
                value={chunkBId}
                onChange={(e) => setChunkBId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200"
              >
                <option value="">-- Choose Chunk B --</option>
                {embeddedChunks.map(c => (
                  <option key={c.id} value={c.id}>
                    Chunk #{c.index}: {c.text.slice(0, 40)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRunComparison}
              disabled={isComparing || !chunkAId || !chunkBId}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              {isComparing ? 'Computing...' : 'Calculate Alignment'}
            </button>
          </div>

          {comparatorResult && (
            <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Cosine Similarity</span>
                  <span className="text-sm font-mono font-bold text-cyan-400">
                    {comparatorResult.telemetry.rawCosine.toFixed(4)}
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Angle (θ)</span>
                  <span className="text-sm font-mono font-bold text-amber-400">
                    {comparatorResult.telemetry.angleDegrees.toFixed(1)}°
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Dot Product</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {comparatorResult.telemetry.dotProduct.toFixed(4)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 italic border-l-2 border-indigo-400 pl-2">
                {comparatorResult.telemetry.geometricInterpretation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Search Results List */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Ranked Retrieval Results ({searchResults.length} chunks evaluated)
            </span>
            <button
              onClick={() => setShowMathDetails(!showMathDetails)}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs transition"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{showMathDetails ? 'Hide Math Breakdown' : 'Inspect Vector Math'}</span>
              {showMathDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Math Breakdown Panel */}
          {showMathDetails && topMatchExplanation && (
            <div className="bg-slate-950/90 border border-cyan-800/60 rounded-xl p-3.5 text-xs space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-cyan-400" />
                  Cosine Similarity Step-by-Step Telemetry
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Rank #1 Match
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {topMatchExplanation.steps.map((step, idx) => (
                  <div key={idx} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-200 block">{step.title}</span>
                    <div className="font-mono text-cyan-400 text-[11px] bg-slate-950 px-2 py-1 rounded">
                      {step.formula}
                    </div>
                    <div className="font-mono text-emerald-400 text-[11px]">
                      Result: {step.computation}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {step.explanation}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200">
                <strong>Geometric Summary:</strong> The query and top match chunk form an angle of{' '}
                <span className="font-mono font-bold text-amber-300">
                  {topMatchExplanation.angleDegrees.toFixed(2)}°
                </span>{' '}
                in high-dimensional vector space. {topMatchExplanation.geometricInterpretation}
              </div>
            </div>
          )}

          {/* Ranked Chunk Cards */}
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {searchResults.map((result, rank) => {
              const color = getChunkColor(result.chunkIndex);
              const isSelected = selectedChunkId === result.chunkId;
              const matchPercent = Math.round(result.similarity * 100);

              return (
                <div
                  key={result.chunkId}
                  onClick={() => onSelectChunk(result.chunkId)}
                  className={`p-3 rounded-lg border transition cursor-pointer text-xs space-y-2 ${
                    isSelected
                      ? `${color.border} ${color.bgActive} ring-1 ring-cyan-400`
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-400 text-[11px]">
                        #{rank + 1}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${color.badge}`}>
                        Chunk #{result.chunkIndex}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        cos(θ) = {result.rawCosine.toFixed(4)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        {result.angleDegrees.toFixed(1)}°
                      </span>
                      <span className="font-bold font-mono text-cyan-400 text-xs">
                        {matchPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar representing similarity */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.max(5, matchPercent)}%` }}
                      className={`h-full rounded-full ${
                        rank === 0 ? 'bg-gradient-to-r from-cyan-500 to-emerald-400' : 'bg-cyan-500/70'
                      }`}
                    />
                  </div>

                  <p className="text-slate-300 font-mono text-[11px] line-clamp-2 leading-relaxed">
                    {result.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Educational Explanation Box */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-400 leading-relaxed">
        <strong className="text-slate-300 block mb-1">Why does semantic search find answers without keyword overlap?</strong>
        Unlike traditional lexical search (which looks for exact string matches like SQL `LIKE` or basic grep),
        vector embeddings project meanings into geometric coordinates.
        A query like <em>"how do plants create energy"</em> activates chloroplast, photon, and photosynthesis concepts,
        producing a vector that points in virtually the same angular direction as the technical textbook passage!
      </div>
    </div>
  );
};
