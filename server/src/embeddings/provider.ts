export interface EmbeddingVectorResult {
  embedding: number[];
  dimensions: number;
  model: string;
  cached?: boolean;
}

export interface VectorStats {
  dimensions: number;
  l2Norm: number;
  min: number;
  max: number;
  mean: number;
  sample: number[];
}

export interface IEmbeddingProvider {
  id: string;
  name: string;
  defaultModel: string;
  defaultDimensions: number;
  embedText(
    text: string,
    options?: { apiKey?: string; model?: string },
  ): Promise<EmbeddingVectorResult>;
  embedBatch(
    texts: string[],
    options?: { apiKey?: string; model?: string },
  ): Promise<EmbeddingVectorResult[]>;
}

/**
 * Computes vector statistics: L2 norm, min, max, mean, and sample of first 12 values
 */
export function computeVectorStats(vector: number[]): VectorStats {
  if (!vector || vector.length === 0) {
    return { dimensions: 0, l2Norm: 0, min: 0, max: 0, mean: 0, sample: [] };
  }

  let sumSquares = 0;
  let sum = 0;
  let min = vector[0];
  let max = vector[0];

  for (let i = 0; i < vector.length; i++) {
    const val = vector[i];
    sumSquares += val * val;
    sum += val;
    if (val < min) min = val;
    if (val > max) max = val;
  }

  return {
    dimensions: vector.length,
    l2Norm: Math.sqrt(sumSquares),
    min: Number(min.toFixed(5)),
    max: Number(max.toFixed(5)),
    mean: Number((sum / vector.length).toFixed(5)),
    sample: vector.slice(0, 12).map((v) => Number(v.toFixed(5))),
  };
}

/**
 * Normalize a vector to unit length (L2 norm = 1.0)
 * Educational Note: Normalizing embeddings to unit length means the Cosine Similarity
 * between two vectors simplifies to their Dot Product! (cos θ = A · B / (|A|*|B|) = A · B)
 */
export function normalizeVector(vec: number[]): number[] {
  let norm = 0;
  for (let i = 0; i < vec.length; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);
  if (norm === 0) return vec.slice();
  return vec.map((v) => v / norm);
}
