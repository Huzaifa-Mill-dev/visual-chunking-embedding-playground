import React, { useState } from 'react';
import { ChunkRecord, PCAResult } from '../types/index.js';
import { getChunkColor } from '../utils/colors.js';
import { Compass, Info, RefreshCw, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface Embedding2DPlotProps {
  pcaData: PCAResult | null;
  chunks: ChunkRecord[];
  selectedChunkId: string | null;
  onSelectChunk: (id: string) => void;
  onRefreshPCA: () => void;
  isLoading: boolean;
}

export const Embedding2DPlot: React.FC<Embedding2DPlotProps> = ({
  pcaData,
  chunks,
  selectedChunkId,
  onSelectChunk,
  onRefreshPCA,
  isLoading,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    chunkId: string;
    chunkIndex: number;
    x: number;
    y: number;
    text: string;
  } | null>(null);

  // SVG dimensions
  const width = 500;
  const height = 360;
  const padding = 45;

  const validChunksWithEmbedding = chunks.filter(c => c.embedding && c.embedding.length > 0);

  if (validChunksWithEmbedding.length < 2) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-center items-center h-80 text-center text-slate-500">
        <Compass className="w-10 h-10 mb-2 stroke-[1.5] text-slate-600" />
        <p className="text-sm font-medium text-slate-400">PCA 2D Projection Unavailable</p>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          At least 2 chunks must have generated vector embeddings to compute Principal Component Analysis.
        </p>
      </div>
    );
  }

  // Map normalized [-1, 1] coordinates to SVG canvas [padding, width - padding]
  const scaleX = (val: number) => {
    return padding + ((val + 1) / 2) * (width - 2 * padding);
  };

  const scaleY = (val: number) => {
    // Invert Y so positive is up
    return height - padding - ((val + 1) / 2) * (height - 2 * padding);
  };

  const pc1Variance = pcaData ? (pcaData.explainedVarianceRatio[0] * 100).toFixed(1) : '0';
  const pc2Variance = pcaData ? (pcaData.explainedVarianceRatio[1] * 100).toFixed(1) : '0';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">2D Embedding Projection (PCA)</h3>
            <p className="text-xs text-slate-400">
              Dimensionality reduction projecting high-dimensional vectors onto Principal Components
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshPCA}
          disabled={isLoading}
          title="Recalculate PCA Projection"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative bg-slate-950/70 border border-slate-800 rounded-lg p-2 overflow-hidden flex items-center justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[340px] select-none"
        >
          {/* Grid lines */}
          <line
            x1={padding}
            y1={scaleY(0)}
            x2={width - padding}
            y2={scaleY(0)}
            stroke="#1e293b"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <line
            x1={scaleX(0)}
            y1={padding}
            x2={scaleX(0)}
            y2={height - padding}
            stroke="#1e293b"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />

          {/* Axes Outer Box */}
          <rect
            x={padding}
            y={padding}
            width={width - 2 * padding}
            height={height - 2 * padding}
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            rx="4"
          />

          {/* Axis Labels */}
          <text
            x={width / 2}
            y={height - 12}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="10"
            fontFamily="monospace"
          >
            PC1: Principal Component 1 ({pc1Variance}% variance) →
          </text>
          <text
            x={14}
            y={height / 2}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="10"
            fontFamily="monospace"
            transform={`rotate(-90 14 ${height / 2})`}
          >
            PC2: Principal Component 2 ({pc2Variance}% variance) →
          </text>

          {/* Data Points */}
          {pcaData?.points.map((pt) => {
            const isSelected = selectedChunkId === pt.chunkId;
            const isHovered = hoveredPoint?.chunkId === pt.chunkId;
            const color = getChunkColor(pt.chunkIndex);
            const cx = scaleX(pt.x);
            const cy = scaleY(pt.y);

            return (
              <g
                key={pt.chunkId}
                onClick={() => onSelectChunk(pt.chunkId)}
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                {/* Selection Halo */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 14 : 11}
                    fill={color.hex}
                    fillOpacity="0.25"
                    stroke={color.hex}
                    strokeWidth="1.5"
                    className="transition-all"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 7 : 5}
                  fill={color.hex}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />

                {/* Chunk Number label */}
                <text
                  cx={cx}
                  cy={cy}
                  x={cx + 8}
                  y={cy + 4}
                  fill="#cbd5e1"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  #{pt.chunkIndex}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-3 right-3 bg-slate-900/95 border border-cyan-500/40 rounded-lg p-2.5 max-w-xs shadow-xl backdrop-blur text-xs pointer-events-none z-10 animate-fadeIn">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800">
              <span className="font-bold text-cyan-300">Chunk #{hoveredPoint.chunkIndex}</span>
              <span className="font-mono text-[10px] text-slate-400">
                ({hoveredPoint.x.toFixed(2)}, {hoveredPoint.y.toFixed(2)})
              </span>
            </div>
            <p className="text-slate-300 text-[11px] line-clamp-3 italic">
              "{hoveredPoint.text}"
            </p>
          </div>
        )}
      </div>

      {/* Educational Explanation Box */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-400 leading-relaxed">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-300 block mb-0.5">
              Understanding High-Dimensional Projections:
            </strong>
            Embeddings exist in high dimensions (e.g. 64 or 768 dimensions), which cannot be directly seen by human eyes.
            Principal Component Analysis (PCA) mathematically finds the 2 axes that capture the maximum geometric variance.
            Chunks closer together in this 2D plane share semantic topic features.
            <em> Remember: 2D projection provides intuitive cluster visualization, but compresses the true distances.</em>
          </div>
        </div>
      </div>
    </div>
  );
};
