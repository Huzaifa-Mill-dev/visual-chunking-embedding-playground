import React, { useState } from 'react';
import { ChunkOptions, ChunkRecord, ChunkStrategy, StrategyInfo } from '../types/index.js';
import { 
  Sliders, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Layers,
  Scissors
} from 'lucide-react';

interface ChunkingConfigPanelProps {
  options: ChunkOptions;
  strategies: Record<string, StrategyInfo>;
  chunks: ChunkRecord[];
  onApplyOptions: (newOptions: ChunkOptions) => void;
  isProcessing: boolean;
}

export const ChunkingConfigPanel: React.FC<ChunkingConfigPanelProps> = ({
  options,
  strategies,
  chunks,
  onApplyOptions,
  isProcessing,
}) => {
  const [localOptions, setLocalOptions] = useState<ChunkOptions>(options);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Sync if options change externally
  React.useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const currentStrategyInfo = strategies[localOptions.strategy];

  // Calculate statistics
  const totalChunks = chunks.length;
  const totalChars = chunks.reduce((acc, c) => acc + c.charCount, 0);
  const totalTokens = chunks.reduce((acc, c) => acc + c.tokenCount, 0);
  const totalOverlapChars = chunks.reduce((acc, c) => acc + c.overlapWithPrev, 0);
  const avgChunkSize = totalChunks > 0 ? Math.round(totalChars / totalChunks) : 0;
  const overlapPercent = localOptions.chunkSize > 0 
    ? Math.round((localOptions.chunkOverlap / localOptions.chunkSize) * 100) 
    : 0;

  const handleStrategyChange = (strategy: ChunkStrategy) => {
    let defaultSize = localOptions.chunkSize;
    let defaultOverlap = localOptions.chunkOverlap;

    if (strategy === 'fixed') {
      defaultOverlap = 0;
    } else if (strategy === 'paragraph') {
      defaultSize = Math.max(300, defaultSize);
    }

    setLocalOptions({
      ...localOptions,
      strategy,
      chunkSize: defaultSize,
      chunkOverlap: defaultOverlap,
    });
  };

  const handleApply = () => {
    onApplyOptions(localOptions);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-4">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Chunking Configuration</h3>
            <p className="text-xs text-slate-400">Control how the document is partitioned into semantic units</p>
          </div>
        </div>

        <button
          onClick={handleApply}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-md shadow-cyan-600/20 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>Apply & Re-Chunk</span>
        </button>
      </div>

      {/* Strategy Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-300">
          <span>Chunking Strategy</span>
          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-[11px] transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHowItWorks ? 'Hide Strategy Details' : 'How this strategy works'}</span>
            {showHowItWorks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {(['recursive', 'fixed-overlap', 'fixed', 'paragraph', 'sentence'] as ChunkStrategy[]).map((strat) => {
            const isSelected = localOptions.strategy === strat;
            const info = strategies[strat];

            return (
              <button
                key={strat}
                onClick={() => handleStrategyChange(strat)}
                className={`p-2 rounded-lg text-left transition border text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold flex items-center justify-between mb-1">
                  <span>{info?.name || strat}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                  {info?.tagline || ''}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* "How it works" Collapsible Educational Box */}
      {showHowItWorks && currentStrategyInfo && (
        <div className="bg-slate-950/80 border border-cyan-800/40 rounded-lg p-3 text-xs space-y-2.5 animate-fadeIn">
          <div>
            <span className="font-bold text-cyan-300">{currentStrategyInfo.name}</span>
            <p className="text-slate-300 mt-1">{currentStrategyInfo.description}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Execution Logic:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
              {currentStrategyInfo.howItWorks.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400">Advantages</span>
              <ul className="text-[11px] text-slate-400 list-disc list-inside mt-0.5 space-y-0.5">
                {currentStrategyInfo.pros.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400">Trade-offs</span>
              <ul className="text-[11px] text-slate-400 list-disc list-inside mt-0.5 space-y-0.5">
                {currentStrategyInfo.cons.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Sliders for Size & Overlap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
        {/* Chunk Size Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-slate-300">Chunk Size</span>
            <span className="font-mono text-cyan-400 font-semibold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">
              {localOptions.chunkSize} characters (~{Math.round(localOptions.chunkSize / 4)} tokens)
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={1200}
            step={25}
            value={localOptions.chunkSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              // Ensure overlap never equals or exceeds chunk size
              const adjustedOverlap = Math.min(localOptions.chunkOverlap, newSize - 10);
              setLocalOptions({
                ...localOptions,
                chunkSize: newSize,
                chunkOverlap: Math.max(0, adjustedOverlap),
              });
            }}
            className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-slate-500">
            Target character window. Smaller = higher precision retrieval; Larger = broader context.
          </p>
        </div>

        {/* Chunk Overlap Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-slate-300">Chunk Overlap</span>
            <span className="font-mono text-amber-400 font-semibold bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/50">
              {localOptions.chunkOverlap} characters ({overlapPercent}%)
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, localOptions.chunkSize - 10)}
            step={10}
            disabled={localOptions.strategy === 'fixed'}
            value={localOptions.strategy === 'fixed' ? 0 : localOptions.chunkOverlap}
            onChange={(e) => {
              setLocalOptions({
                ...localOptions,
                chunkOverlap: Number(e.target.value),
              });
            }}
            className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer disabled:opacity-30"
          />
          <p className="text-[10px] text-slate-500">
            {localOptions.strategy === 'fixed' 
              ? 'Fixed chunking has 0 overlap by definition.' 
              : 'Margin repeated in adjacent chunks to prevent cutting ideas at boundaries.'}
          </p>
        </div>
      </div>

      {/* Warning if Overlap is High */}
      {overlapPercent > 35 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>High Overlap Warning:</strong> Overlap is {overlapPercent}% of chunk size. High overlap duplicates text significantly, increasing storage requirements and embedding API token costs.
          </span>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Chunks</span>
          <span className="text-lg font-bold font-mono text-cyan-400">{totalChunks}</span>
        </div>
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Avg Chunk Length</span>
          <span className="text-lg font-bold font-mono text-slate-200">{avgChunkSize} chars</span>
        </div>
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Tokens</span>
          <span className="text-lg font-bold font-mono text-emerald-400">~{totalTokens}</span>
        </div>
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Duplicate Overlap</span>
          <span className="text-lg font-bold font-mono text-amber-400">+{totalOverlapChars} chars</span>
        </div>
      </div>
    </div>
  );
};
