import { ChunkRecord, SimilarityResult } from '../types.js';

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

/**
 * Calculates Cosine Similarity with step-by-step educational math breakdown
 */
export function calculateCosineSimilarityWithTelemetry(
  queryVector: number[],
  chunkVector: number[]
): CosineExplanation {
  if (queryVector.length !== chunkVector.length) {
    throw new Error(`Dimension mismatch: Query has ${queryVector.length} dims, Chunk has ${chunkVector.length} dims.`);
  }

  const dims = queryVector.length;
  let dotProduct = 0;
  let querySumSquares = 0;
  let chunkSumSquares = 0;

  for (let i = 0; i < dims; i++) {
    dotProduct += queryVector[i] * chunkVector[i];
    querySumSquares += queryVector[i] * queryVector[i];
    chunkSumSquares += chunkVector[i] * chunkVector[i];
  }

  const queryNorm = Math.sqrt(querySumSquares);
  const chunkNorm = Math.sqrt(chunkSumSquares);

  let rawCosine = 0;
  if (queryNorm > 0 && chunkNorm > 0) {
    rawCosine = dotProduct / (queryNorm * chunkNorm);
  }

  // Clamp raw cosine to [-1, 1] to prevent floating point domain errors in Math.acos
  rawCosine = Math.max(-1, Math.min(1, rawCosine));

  // Angle in radians and degrees
  const angleRad = Math.acos(rawCosine);
  const angleDegrees = (angleRad * 180) / Math.PI;

  // Normalized score from 0.0 to 1.0 (for intuitive UI percent)
  // cos(0) = 1 -> 1.0 (100% identical direction)
  // cos(90 deg) = 0 -> 0.5 (orthogonal / unrelated)
  // cos(180 deg) = -1 -> 0.0 (opposite direction)
  const normalizedScore = (rawCosine + 1) / 2;

  let geometricInterpretation = '';
  if (angleDegrees < 20) {
    geometricInterpretation = 'Extremely close direction: Strong semantic alignment across most conceptual dimensions.';
  } else if (angleDegrees < 45) {
    geometricInterpretation = 'Moderate angle: Shares prominent core themes or related context.';
  } else if (angleDegrees < 75) {
    geometricInterpretation = 'Wide angle: Weak connection; only minor tangential vocabulary or syntax overlap.';
  } else {
    geometricInterpretation = 'Near orthogonal (perpendicular): Concepts reside in fundamentally distinct regions of embedding space.';
  }

  return {
    dotProduct,
    queryNorm,
    chunkNorm,
    rawCosine,
    normalizedScore,
    angleDegrees,
    geometricInterpretation,
    steps: [
      {
        title: 'Step 1: Compute Dot Product (A · B)',
        formula: 'A · B = Σ (A[i] * B[i])',
        computation: `${dotProduct.toFixed(5)}`,
        explanation: 'Measures how much the two vectors point in aligned directions across all dimensions. If both vectors have large positive or negative values in the same dimensions, the product grows large.',
      },
      {
        title: 'Step 2: Compute Vector Magnitudes (L2 Norms)',
        formula: '||A|| = √(Σ A[i]²), ||B|| = √(Σ B[i]²)',
        computation: `||Query|| = ${queryNorm.toFixed(5)}, ||Chunk|| = ${chunkNorm.toFixed(5)}`,
        explanation: 'Calculates Euclidean length from the origin. For pre-normalized embeddings, both lengths are ~1.0.',
      },
      {
        title: 'Step 3: Calculate Cosine of the Angle (cos θ)',
        formula: 'cos(θ) = (A · B) / (||A|| * ||B||)',
        computation: `${dotProduct.toFixed(5)} / (${queryNorm.toFixed(5)} * ${chunkNorm.toFixed(5)}) = ${rawCosine.toFixed(5)}`,
        explanation: 'Normalizes the dot product by vector lengths, yielding the cosine of the angle between them. Varies from -1 (opposite) through 0 (orthogonal) to +1 (identical direction).',
      },
      {
        title: 'Step 4: Angular Separation',
        formula: 'θ = arccos(cos(θ)) * (180 / π)',
        computation: `arccos(${rawCosine.toFixed(5)}) = ${angleDegrees.toFixed(2)}°`,
        explanation: 'The actual angular separation between the query and chunk in high-dimensional vector space.',
      },
    ],
  };
}

/**
 * Ranks all chunks against a query vector
 */
export function rankChunksBySimilarity(
  queryVector: number[],
  chunks: ChunkRecord[]
): SimilarityResult[] {
  const results: SimilarityResult[] = [];

  for (const chunk of chunks) {
    if (!chunk.embedding || chunk.embedding.length === 0) continue;

    const explanation = calculateCosineSimilarityWithTelemetry(queryVector, chunk.embedding);

    results.push({
      chunkId: chunk.id,
      chunkIndex: chunk.index,
      text: chunk.text,
      startChar: chunk.startChar,
      endChar: chunk.endChar,
      similarity: explanation.normalizedScore,
      rawCosine: explanation.rawCosine,
      dotProduct: explanation.dotProduct,
      queryNorm: explanation.queryNorm,
      chunkNorm: explanation.chunkNorm,
      angleDegrees: explanation.angleDegrees,
    });
  }

  // Sort descending by similarity
  results.sort((a, b) => b.rawCosine - a.rawCosine);

  return results;
}
