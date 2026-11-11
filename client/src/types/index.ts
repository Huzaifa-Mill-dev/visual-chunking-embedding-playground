export interface DocumentRecord {
  id: string;
  title: string;
  filename: string;
  fileType: "txt" | "md" | "other";
  content: string;
  charCount: number;
  wordCount: number;
  lineCount: number;
  createdAt: string;
}

export type ChunkStrategy =
  | "fixed"
  | "fixed-overlap"
  | "recursive"
  | "paragraph"
  | "sentence";

export interface ChunkOptions {
  strategy: ChunkStrategy;
  chunkSize: number;
  chunkOverlap: number;
  separators?: string[];
  minChunkLength?: number;
}

export interface ChunkRecord {
  id: string;
  docId: string;
  index: number;
  text: string;
  startChar: number;
  endChar: number;
  charCount: number;
  wordCount: number;
  tokenCount: number;
  overlapWithPrev: number;
  overlapWithNext: number;
  embedding?: number[];
  model?: string;
  dimensions?: number;
  embeddedAt?: string;
}

export interface StrategyInfo {
  id: ChunkStrategy;
  name: string;
  tagline: string;
  description: string;
  howItWorks: string[];
  pros: string[];
  cons: string[];
  recommendedFor: string;
}

export interface VectorStats {
  dimensions: number;
  l2Norm: number;
  min: number;
  max: number;
  mean: number;
  sample: number[];
}

export interface SimilarityResult {
  chunkId: string;
  chunkIndex: number;
  text: string;
  startChar: number;
  endChar: number;
  similarity: number;
  rawCosine: number;
  dotProduct: number;
  queryNorm: number;
  chunkNorm: number;
  angleDegrees: number;
}

export interface CosineExplanation {
  dotProduct: number;
  queryNorm: number;
  chunkNorm: number;
  rawCosine: number;
  normalizedScore: number;
  angleDegrees: number;
  geometricInterpretation: string;
  steps: {
    title: string;
    formula: string;
    computation: string;
    explanation: string;
  }[];
}

export interface PCAProjection {
  chunkId: string;
  chunkIndex: number;
  x: number;
  y: number;
  text: string;
}

export interface PCAResult {
  points: PCAProjection[];
  explainedVarianceRatio: [number, number];
  educationalNote: string;
}
