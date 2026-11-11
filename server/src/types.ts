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

export type EmbeddingProvider = "educational" | "gemini" | "openai" | "ollama";

export interface EmbeddingConfig {
  provider: EmbeddingProvider;
  model: string;
  apiKey?: string;
  endpoint?: string;
  dimensions?: number;
}

export interface SimilarityResult {
  chunkId: string;
  chunkIndex: number;
  text: string;
  startChar: number;
  endChar: number;
  similarity: number; // Cosine similarity: -1 to 1 (normalized to 0-1 for UI)
  rawCosine: number;
  dotProduct: number;
  queryNorm: number;
  chunkNorm: number;
  angleDegrees: number;
}

export interface PCAProjection {
  chunkId: string;
  chunkIndex: number;
  x: number; // Principal Component 1
  y: number; // Principal Component 2
  text: string;
}

export interface SessionState {
  currentDocumentId: string | null;
  documents: DocumentRecord[];
  activeStrategy: ChunkStrategy;
  chunkOptions: ChunkOptions;
  chunks: ChunkRecord[];
  embeddingConfig: EmbeddingConfig;
  lastQuery?: string;
}
